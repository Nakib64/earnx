import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestStatus, TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class DepositAdminSubService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin: List all deposit requests with filtering & search
   */
  async getAllDeposits(
    page = 1,
    limit = 20,
    search?: string,
    status?: RequestStatus,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.DepositRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { trx_id: { contains: q, mode: 'insensitive' } },
        { sender_number: { contains: q, mode: 'insensitive' } },
        { user: { full_name: { contains: q, mode: 'insensitive' } } },
        { user: { referral_code: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.depositRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              phone: true,
              email: true,
              referral_code: true,
              wallet_balance: true,
            },
          },
        },
      }),
      this.prisma.depositRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Approve deposit and atomically credit user's wallet
   */
  async approveDeposit(depositId: string, adminPhone: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const deposit = await tx.depositRequest.findUnique({
          where: { id: depositId },
          include: { user: true },
        });

        if (!deposit) {
          throw new NotFoundException('Deposit request not found');
        }

        if (deposit.status !== RequestStatus.PENDING) {
          throw new BadRequestException('This deposit request has already been processed');
        }

        const numAmount = Number(deposit.amount);
        const balanceBefore = Number(deposit.user.wallet_balance);
        const balanceAfter = balanceBefore + numAmount;

        // 1. Credit user wallet balance
        await tx.user.update({
          where: { id: deposit.user_id },
          data: { wallet_balance: new Prisma.Decimal(balanceAfter) },
        });

        // 2. Record ledger transaction
        await tx.walletTransaction.create({
          data: {
            user_id: deposit.user_id,
            type: TransactionType.DEPOSIT,
            amount: new Prisma.Decimal(numAmount),
            balance_before: new Prisma.Decimal(balanceBefore),
            balance_after: new Prisma.Decimal(balanceAfter),
            description: `Deposit via ${deposit.method} (TrxID: ${deposit.trx_id}) approved`,
          },
        });

        // 3. Mark deposit approved
        const updatedDeposit = await tx.depositRequest.update({
          where: { id: depositId },
          data: {
            status: RequestStatus.APPROVED,
            approved_by: adminPhone,
            approved_at: new Date(),
          },
          include: { user: true },
        });

        return {
          success: true,
          message: `Successfully approved deposit of ৳${numAmount.toFixed(2)} for ${
            deposit.user.full_name || deposit.user.phone || deposit.user.email
          } (${deposit.user.referral_code}).`,
          deposit: updatedDeposit,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * Admin: Reject deposit request
   */
  async rejectDeposit(depositId: string, adminPhone: string, reason?: string) {
    const deposit = await this.prisma.depositRequest.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit request not found');
    }

    if (deposit.status !== RequestStatus.PENDING) {
      throw new BadRequestException('This deposit request has already been processed');
    }

    const updated = await this.prisma.depositRequest.update({
      where: { id: depositId },
      data: {
        status: RequestStatus.REJECTED,
        approved_by: adminPhone,
        rejection_reason: reason || 'Invalid Transaction ID or unverified payment',
      },
      include: { user: true },
    });

    return {
      success: true,
      message: 'Deposit request rejected.',
      deposit: updated,
    };
  }
}
