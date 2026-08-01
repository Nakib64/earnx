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

  async getAllTransactions(page = 1, limit = 20, userId?: string, type?: TransactionType) {
    const skip = (page - 1) * limit;
    const where: Prisma.WalletTransactionWhereInput = {};
    if (userId) where.user_id = userId;
    if (type) where.type = type;

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
}
