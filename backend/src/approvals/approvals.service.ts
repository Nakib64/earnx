import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionService } from '../commissions/commission.service';
import { WalletService } from '../wallets/wallet.service';
import { CoinsService } from '../coins/coins.service';
import { RequestStatus, UserStatus, CommissionType, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commissionService: CommissionService,
    private readonly walletService: WalletService,
    private readonly coinsService: CoinsService,
  ) {}

  private async generateSerialUserCode(tx: any): Promise<string> {
    const existingUsers = await tx.user.findMany({
      where: {
        referral_code: { startsWith: 'EX' },
      },
      select: { referral_code: true },
    });

    let maxNum = 0;
    for (const u of existingUsers) {
      const match = u.referral_code.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(4, '0');
    return `EX${padded}`;
  }

  // ==========================================
  // ACTIVATION REQUESTS
  // ==========================================

  async submitActivationRequest(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('User is already ACTIVE');
    }

    // Check for existing pending request
    const existingPending = await this.prisma.activationRequest.findFirst({
      where: { user_id: userId, status: RequestStatus.PENDING },
    });
    if (existingPending) {
      throw new BadRequestException('Activation request is already pending approval');
    }

    return this.prisma.activationRequest.create({
      data: {
        user_id: userId,
        referrer_id: user.referred_by_id,
        status: RequestStatus.PENDING,
      },
    });
  }

  async approveActivationRequest(requestId: string, approverId: string, isAdmin = false) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.activationRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!request) throw new NotFoundException('Activation request not found');
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(`Request is already ${request.status}`);
      }

      // Check permission: Must be Admin OR direct referrer
      if (!isAdmin) {
        if (!request.referrer_id || request.referrer_id !== approverId) {
          throw new ForbiddenException('Only the direct referrer or an Admin can approve this request');
        }
      }

      // 1. Update request status
      const updatedRequest = await tx.activationRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approved_by: approverId,
        },
      });

      // 2. Activate user & assign serial user code (EX0001, EX0002...)
      const targetUser = await tx.user.findUnique({ where: { id: request.user_id } });
      let userCode = targetUser?.referral_code;
      if (!userCode || !userCode.startsWith('EX')) {
        userCode = await this.generateSerialUserCode(tx);
      }

      await tx.user.update({
        where: { id: request.user_id },
        data: {
          status: UserStatus.ACTIVE,
          referral_code: userCode,
        },
      });

      // 3. Trigger activation commissions payout
      const payouts = await this.commissionService.distributeCommissions(
        request.user_id,
        CommissionType.ACTIVATION,
        tx,
      );

      // 4. Check & unlock premium bonus coins for referrer if active referral count target met
      if (request.referrer_id) {
        await this.coinsService.checkAndUnlockForReferrer(request.referrer_id, tx);
      }

      return { request: updatedRequest, payouts };
    }, { maxWait: 10000, timeout: 30000 });
  }

  async rejectActivationRequest(requestId: string, approverId: string, reason?: string, isAdmin = false) {
    const request = await this.prisma.activationRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Activation request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    if (!isAdmin && request.referrer_id !== approverId) {
      throw new ForbiddenException('Only the direct referrer or an Admin can reject this request');
    }

    return this.prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        approved_by: approverId,
        rejection_reason: reason || 'Request rejected',
      },
    });
  }

  // ==========================================
  // PREMIUM REQUESTS
  // ==========================================

  async submitPremiumRequest(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE users can request Premium status');
    }

    const existingPending = await this.prisma.premiumRequest.findFirst({
      where: { user_id: userId, status: RequestStatus.PENDING },
    });
    if (existingPending) {
      throw new BadRequestException('Premium request is already pending approval');
    }

    return this.prisma.premiumRequest.create({
      data: {
        user_id: userId,
        referrer_id: user.referred_by_id,
        status: RequestStatus.PENDING,
      },
    });
  }

  async approvePremiumRequest(requestId: string, approverId: string, isAdmin = false) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.premiumRequest.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (!request) throw new NotFoundException('Premium request not found');
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(`Request is already ${request.status}`);
      }

      if (!isAdmin && (!request.referrer_id || request.referrer_id !== approverId)) {
        throw new ForbiddenException('Only the direct referrer or an Admin can approve this request');
      }

      const updatedRequest = await tx.premiumRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approved_by: approverId,
        },
      });

      // Update user premium status fields (1 year / 365 days expiration)
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 365);

      await tx.user.update({
        where: { id: request.user_id },
        data: {
          is_premium: true,
          premium_started_at: now,
          premium_expires_at: expiresAt,
          premium_payout_count: 0,
          last_premium_payout_at: null,
        },
      });

      // Grant locked premium coins to user
      await this.coinsService.grantLockedCoinsOnPremium(request.user_id, tx);

      // Distribute Premium commissions payout
      const payouts = await this.commissionService.distributeCommissions(
        request.user_id,
        CommissionType.PREMIUM,
        tx,
      );

      return { request: updatedRequest, payouts };
    }, { maxWait: 10000, timeout: 30000 });
  }

  async rejectPremiumRequest(requestId: string, approverId: string, reason?: string, isAdmin = false) {
    const request = await this.prisma.premiumRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Premium request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    if (!isAdmin && request.referrer_id !== approverId) {
      throw new ForbiddenException('Only the direct referrer or an Admin can reject this request');
    }

    return this.prisma.premiumRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        approved_by: approverId,
        rejection_reason: reason || 'Request rejected',
      },
    });
  }

  // ==========================================
  // WITHDRAWAL REQUESTS (Direct to Admin)
  // ==========================================

  async submitWithdrawalRequest(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { referred_by: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE users can submit withdrawal requests');
    }

    if (amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero');
    }

    if (Number(user.wallet_balance) < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Deduct balance directly from requesting user
      await this.walletService.processTransaction(
        userId,
        TransactionType.WITHDRAW,
        -amount,
        `Withdrawal processed directly`,
        tx,
      );

      // 2. Credit the direct referrer (if exists) with commission equal to withdrawal amount
      if (user.referred_by) {
        await this.walletService.processTransaction(
          user.referred_by.id,
          TransactionType.COMMISSION,
          amount,
          `Withdrawal commission from ${user.full_name || user.phone}`,
          tx,
        );
      }

      // 3. Save withdrawal request directly as APPROVED
      return tx.withdrawalRequest.create({
        data: {
          user_id: userId,
          amount: new Prisma.Decimal(amount),
          status: RequestStatus.APPROVED,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });
  }

  async approveWithdrawalRequest(requestId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.withdrawalRequest.findUnique({
        where: { id: requestId },
        include: {
          user: {
            include: { referred_by: true },
          },
        },
      });

      if (!request) throw new NotFoundException('Withdrawal request not found');
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException(`Request is already ${request.status}`);
      }

      const amountToDeduct = Number(request.amount);
      const requester = request.user;
      const referrer = requester.referred_by;

      // 1. Deduct from the requesting user
      await this.walletService.processTransaction(
        request.user_id,
        TransactionType.WITHDRAW,
        -amountToDeduct,
        `Withdrawal approved by admin`,
        tx,
      );

      // 2. Credit the direct referrer (if exists) with the same amount
      if (referrer) {
        await this.walletService.processTransaction(
          referrer.id,
          TransactionType.COMMISSION,
          amountToDeduct,
          `Withdrawal commission from ${requester.full_name || requester.phone}`,
          tx,
        );
      }

      const updatedRequest = await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approved_by: adminId,
        },
      });

      return updatedRequest;
    }, { maxWait: 10000, timeout: 30000 });
  }

  async rejectWithdrawalRequest(requestId: string, adminId: string, reason?: string) {
    const request = await this.prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Withdrawal request not found');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    return this.prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        approved_by: adminId,
        rejection_reason: reason || 'Withdrawal request rejected by admin',
      },
    });
  }

  // Lists for referrers & admins
  async getPendingDownlineApprovals(referrerId: string) {
    const [activations, premiums] = await Promise.all([
      this.prisma.activationRequest.findMany({
        where: { referrer_id: referrerId, status: RequestStatus.PENDING },
        include: { user: { select: { id: true, phone: true, full_name: true } } },
      }),
      this.prisma.premiumRequest.findMany({
        where: { referrer_id: referrerId, status: RequestStatus.PENDING },
        include: { user: { select: { id: true, phone: true, full_name: true } } },
      }),
    ]);

    return { activations, premiums };
  }

  async getAllPendingAdminApprovals() {
    const userSelect = {
      id: true,
      phone: true,
      full_name: true,
      referral_code: true,
      wallet_balance: true,
      referred_by: { select: { id: true, phone: true, full_name: true } },
    };

    const [activations, premiums, withdrawals] = await Promise.all([
      this.prisma.activationRequest.findMany({
        orderBy: { created_at: 'desc' },
        include: { user: { select: userSelect } },
      }),
      this.prisma.premiumRequest.findMany({
        orderBy: { created_at: 'desc' },
        include: { user: { select: userSelect } },
      }),
      this.prisma.withdrawalRequest.findMany({
        orderBy: { created_at: 'desc' },
        include: { user: { select: userSelect } },
      }),
    ]);

    return { activations, premiums, withdrawals };
  }
}
