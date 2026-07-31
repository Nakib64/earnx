import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';
import { CommissionType, TransactionType, Prisma } from '@prisma/client';

export interface CommissionPayoutRecord {
  level: number;
  parentId: string;
  parentPhone: string;
  amount: number;
  qualified: boolean;
  reason?: string;
}

@Injectable()
export class CommissionService {
  private readonly logger = Logger.name;

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Recursive multi-level commission engine.
   * Traverses upward from sourceUserId, checking each parent's Designation max_level against current depth.
   */
  async distributeCommissions(
    sourceUserId: string,
    commissionType: CommissionType,
    externalTx?: Prisma.TransactionClient,
  ): Promise<CommissionPayoutRecord[]> {
    const runner = async (tx: Prisma.TransactionClient) => {
      const payoutSummary: CommissionPayoutRecord[] = [];

      // Fetch all commission rules for this type, ordered by level asc
      const rules = await tx.commissionRule.findMany({
        where: { type: commissionType },
        orderBy: { level: 'asc' },
      });

      if (rules.length === 0) {
        console.log(`No commission rules found for type ${commissionType}`);
        return payoutSummary;
      }

      const maxConfiguredLevel = Math.max(...rules.map((r) => r.level));

      // Get initial source user
      const sourceUser = await tx.user.findUnique({
        where: { id: sourceUserId },
        select: { id: true, phone: true, full_name: true, referred_by_id: true },
      });

      if (!sourceUser || !sourceUser.referred_by_id) {
        return payoutSummary; // No referrer to pay
      }

      let currentParentId: string | null = sourceUser.referred_by_id;
      let currentLevel = 1;

      while (currentParentId && currentLevel <= maxConfiguredLevel) {
        const parent = await tx.user.findUnique({
          where: { id: currentParentId },
          include: { designation: true },
        });

        if (!parent) break;

        const ruleForLevel = rules.find((r) => r.level === currentLevel);

        if (ruleForLevel && Number(ruleForLevel.amount) > 0) {
          const maxAllowedLevel = parent.designation ? parent.designation.max_level : 0;
          const isQualified = maxAllowedLevel >= currentLevel;

          if (isQualified) {
            const payoutAmount = Number(ruleForLevel.amount);
            const description = `${commissionType} Level ${currentLevel} Commission from user (${sourceUser.phone})`;

            await this.walletService.processTransaction(
              parent.id,
              TransactionType.COMMISSION,
              payoutAmount,
              description,
              tx,
            );

            payoutSummary.push({
              level: currentLevel,
              parentId: parent.id,
              parentPhone: parent.phone,
              amount: payoutAmount,
              qualified: true,
            });
          } else {
            payoutSummary.push({
              level: currentLevel,
              parentId: parent.id,
              parentPhone: parent.phone,
              amount: Number(ruleForLevel.amount),
              qualified: false,
              reason: `Parent designation '${parent.designation?.name || 'None'}' (max level ${maxAllowedLevel}) does not unlock level ${currentLevel}`,
            });
          }
        }

        // Move to next parent up the tree
        currentParentId = parent.referred_by_id;
        currentLevel++;
      }

      return payoutSummary;
    };

    if (externalTx) {
      return runner(externalTx);
    }

    return this.prisma.$transaction(async (tx) => runner(tx));
  }

  // Admin rule configuration methods
  async getCommissionRules() {
    return this.prisma.commissionRule.findMany({
      orderBy: [{ type: 'asc' }, { level: 'asc' }],
    });
  }

  async upsertCommissionRule(type: CommissionType, level: number, amount: number) {
    return this.prisma.commissionRule.upsert({
      where: {
        type_level: { type, level },
      },
      update: { amount: new Prisma.Decimal(amount) },
      create: { type, level, amount: new Prisma.Decimal(amount) },
    });
  }

  async deleteCommissionRule(id: string) {
    return this.prisma.commissionRule.delete({
      where: { id },
    });
  }
}
