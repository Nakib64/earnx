import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute an atomic wallet transaction.
   * Can accept an existing Prisma transaction client ($tx) or create a new $transaction.
   */
  async processTransaction(
    userId: string,
    type: TransactionType,
    amount: number | Prisma.Decimal,
    description: string,
    externalTx?: Prisma.TransactionClient,
  ) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount === 0) {
      throw new BadRequestException('Transaction amount must be a non-zero number');
    }

    const runner = async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const balanceBefore = Number(user.wallet_balance);
      const balanceAfter = balanceBefore + numericAmount;

      if (balanceAfter < 0) {
        throw new BadRequestException('Insufficient wallet balance for this transaction');
      }

      const walletTx = await tx.walletTransaction.create({
        data: {
          user_id: userId,
          type,
          amount: new Prisma.Decimal(numericAmount),
          balance_before: new Prisma.Decimal(balanceBefore),
          balance_after: new Prisma.Decimal(balanceAfter),
          description,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          wallet_balance: new Prisma.Decimal(balanceAfter),
        },
      });

      return {
        transaction: walletTx,
        newBalance: balanceAfter,
      };
    };

    if (externalTx) {
      return runner(externalTx);
    }

    return this.prisma.$transaction(async (tx) => runner(tx), { maxWait: 10000, timeout: 30000 });
  }

  async getUserTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTransactions(
    page = 1,
    limit = 20,
    userId?: string,
    type?: TransactionType,
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.WalletTransactionWhereInput = {};

    if (userId) where.user_id = userId;
    if (type) where.type = type;

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchConditions: Prisma.WalletTransactionWhereInput[] = [
        { description: { contains: q, mode: 'insensitive' } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
        { user: { full_name: { contains: q, mode: 'insensitive' } } },
        { user: { referral_code: { contains: q, mode: 'insensitive' } } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              full_name: true,
              referral_code: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // NETWORK BALANCE TRANSFER
  // ==========================================

  /**
   * Check if target user is in sender's referral network tree (upline or downline).
   */
  async isInSameNetworkTree(userAId: string, userBId: string): Promise<boolean> {
    if (userAId === userBId) return false;

    const getAncestors = async (startUserId: string): Promise<Set<string>> => {
      const ancestors = new Set<string>();
      let currentId: string | null = startUserId;
      const visited = new Set<string>();

      while (currentId) {
        if (visited.has(currentId)) break;
        visited.add(currentId);

        const user = await this.prisma.user.findUnique({
          where: { id: currentId },
          select: { id: true, referred_by_id: true },
        });

        if (!user || !user.referred_by_id) break;
        ancestors.add(user.referred_by_id);
        currentId = user.referred_by_id;
      }
      return ancestors;
    };

    const [ancestorsA, ancestorsB] = await Promise.all([
      getAncestors(userAId),
      getAncestors(userBId),
    ]);

    // B is an upline of A
    if (ancestorsA.has(userBId)) return true;

    // B is a downline of A
    if (ancestorsB.has(userAId)) return true;

    // A and B share any common ancestor in the referral tree
    for (const id of ancestorsA) {
      if (ancestorsB.has(id)) return true;
    }

    return false;
  }

  async verifyTransferRecipient(senderId: string, targetReferralCode: string) {
    const code = targetReferralCode.trim();
    if (!code) {
      throw new BadRequestException('Referral code is required');
    }

    const recipient = await this.prisma.user.findUnique({
      where: { referral_code: code },
      select: {
        id: true,
        full_name: true,
        phone: true,
        referral_code: true,
        status: true,
      },
    });

    if (!recipient) {
      throw new NotFoundException('No user found with this referral code');
    }

    if (recipient.id === senderId) {
      throw new BadRequestException('You cannot transfer balance to yourself');
    }

    const isNetworkMember = await this.isInSameNetworkTree(senderId, recipient.id);
    if (!isNetworkMember) {
      throw new BadRequestException('This user is not in your referral network tree');
    }

    return {
      id: recipient.id,
      full_name: recipient.full_name || 'Anonymous User',
      phone: recipient.phone,
      referral_code: recipient.referral_code,
    };
  }

  async executeBalanceTransfer(senderId: string, targetReferralCode: string, amount: number) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }

    const recipient = await this.verifyTransferRecipient(senderId, targetReferralCode);

    return this.prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId } });
      if (!sender) throw new NotFoundException('Sender user not found');

      const senderBalanceBefore = Number(sender.wallet_balance);
      if (senderBalanceBefore < numAmount) {
        throw new BadRequestException('Insufficient wallet balance to transfer');
      }

      const senderBalanceAfter = senderBalanceBefore - numAmount;

      // 1. Deduct sender wallet
      await tx.user.update({
        where: { id: senderId },
        data: { wallet_balance: new Prisma.Decimal(senderBalanceAfter) },
      });

      // 2. Log sender transaction
      await tx.walletTransaction.create({
        data: {
          user_id: senderId,
          type: TransactionType.BALANCE_TRANSFER,
          amount: new Prisma.Decimal(-numAmount),
          balance_before: new Prisma.Decimal(senderBalanceBefore),
          balance_after: new Prisma.Decimal(senderBalanceAfter),
          description: `Transfer sent to ${recipient.full_name} (${recipient.referral_code})`,
        },
      });

      // 3. Credit recipient wallet
      const recipientUser = await tx.user.findUnique({ where: { id: recipient.id } });
      if (!recipientUser) throw new NotFoundException('Recipient user not found');

      const recipientBalanceBefore = Number(recipientUser.wallet_balance);
      const recipientBalanceAfter = recipientBalanceBefore + numAmount;

      await tx.user.update({
        where: { id: recipient.id },
        data: { wallet_balance: new Prisma.Decimal(recipientBalanceAfter) },
      });

      // 4. Log recipient transaction
      await tx.walletTransaction.create({
        data: {
          user_id: recipient.id,
          type: TransactionType.BALANCE_TRANSFER,
          amount: new Prisma.Decimal(numAmount),
          balance_before: new Prisma.Decimal(recipientBalanceBefore),
          balance_after: new Prisma.Decimal(recipientBalanceAfter),
          description: `Transfer received from ${sender.full_name || sender.phone} (${sender.referral_code})`,
        },
      });

      return {
        success: true,
        transferredAmount: numAmount,
        recipient,
        newBalance: senderBalanceAfter,
      };
    }, { maxWait: 10000, timeout: 30000 });
  }
}
