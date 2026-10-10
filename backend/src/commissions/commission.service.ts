import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallets/wallet.service';
import { CommissionType, TransactionType, UserStatus, Prisma } from '@prisma/client';

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
  private readonly logger = new Logger(CommissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Referral Commission Distribution:
   * Multi-level Premium referral payout (up to 5 levels).
   * Upper parent at Level N receives payout IF AND ONLY IF:
   * 1. They are an active member (status === ACTIVE)
   * 2. They are an active Premium subscriber (is_premium === true)
   * 3. Their Designation Star rating unlocks that tree level (max_level >= level)
   */
  async distributeCommissions(
    sourceUserId: string,
    commissionType: CommissionType = CommissionType.PREMIUM,
    externalTx?: Prisma.TransactionClient,
  ): Promise<CommissionPayoutRecord[]> {
    // If anything tries to trigger ACTIVATION commission, ignore since activation system is removed
    if (commissionType === CommissionType.ACTIVATION) {
      return [];
    }

    const runner = async (tx: Prisma.TransactionClient) => {
      const payoutSummary: CommissionPayoutRecord[] = [];

      // Fetch all commission rules for PREMIUM type, ordered by level asc
      const rules = await tx.commissionRule.findMany({
        where: { type: CommissionType.PREMIUM },
        orderBy: { level: 'asc' },
      });

      if (rules.length === 0) {
        this.logger.log(`No commission rules found for type ${commissionType}`);
        return payoutSummary;
      }

      // Source user subscribing or upgrading to premium
      const sourceUser = await tx.user.findUnique({
        where: { id: sourceUserId },
        select: { id: true, phone: true, full_name: true, referral_code: true, referred_by_id: true },
      });

      if (!sourceUser || !sourceUser.referred_by_id) {
        return payoutSummary; // No referrer to pay
      }

      // Multi-level depth up to 5 levels
      const maxAllowedTreeDepth = 5;

      let currentParentId: string | null = sourceUser.referred_by_id;
      let currentLevel = 1;
      const visitedUserIds = new Set<string>([sourceUserId]);

      while (currentParentId && currentLevel <= maxAllowedTreeDepth) {
        if (visitedUserIds.has(currentParentId)) {
          this.logger.warn(`Cycle detected in referral tree for user ${sourceUserId} at parent ${currentParentId}`);
          break;
        }
        visitedUserIds.add(currentParentId);

        const parent = await tx.user.findUnique({
          where: { id: currentParentId },
          include: { designation: true },
        });

        if (!parent) break;

        const ruleForLevel = rules.find((r) => r.level === currentLevel);

        if (ruleForLevel && Number(ruleForLevel.amount) > 0) {
          const payoutAmount = Number(ruleForLevel.amount);

          // Rule 1: Upline parent must be ACTIVE
          if (parent.status !== UserStatus.ACTIVE) {
            payoutSummary.push({
              level: currentLevel,
              parentId: parent.id,
              parentPhone: parent.phone,
              amount: payoutAmount,
              qualified: false,
              reason: `Upline user (${parent.phone}) at level ${currentLevel} is not ACTIVE`,
            });
          }
          // Rule 2: For PREMIUM commissions, upline MUST be a Premium member
          else if (!parent.is_premium) {
            payoutSummary.push({
              level: currentLevel,
              parentId: parent.id,
              parentPhone: parent.phone,
              amount: payoutAmount,
              qualified: false,
              reason: `Upline user (${parent.phone}) at level ${currentLevel} is not a Premium member`,
            });
          } else {
            // Rule 3: Designation Rank Cap (if parent has a designation with max_level, respects it; otherwise defaults to 5 levels)
            const maxUnlockedLevel = parent.designation ? parent.designation.max_level : 5;
            const isQualified = parent.is_premium && maxUnlockedLevel >= currentLevel;

            if (isQualified) {
              const sourceLabel = sourceUser.full_name || sourceUser.phone;
              const description = `Premium Level ${currentLevel} Referral Commission from ${sourceLabel} (${sourceUser.referral_code || sourceUser.phone})`;

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
                amount: payoutAmount,
                qualified: false,
                reason: `Parent designation '${parent.designation?.name || 'None'}' (max level ${maxUnlockedLevel}) does not unlock level ${currentLevel}`,
              });
            }
          }
        }

        // Move to next upper parent in the tree
        currentParentId = parent.referred_by_id;
        currentLevel += 1;
      }

      return payoutSummary;
    };

    if (externalTx) {
      return runner(externalTx);
    }

    return this.prisma.$transaction(async (tx) => runner(tx), { maxWait: 10000, timeout: 30000 });
  }

  // Admin rule configuration methods
  async getCommissionRules() {
    return this.prisma.commissionRule.findMany({
      where: { type: CommissionType.PREMIUM },
      orderBy: [{ level: 'asc' }],
    });
  }

  async upsertCommissionRule(type: CommissionType, level: number, amount: number) {
    if (type === CommissionType.ACTIVATION) {
      throw new BadRequestException('Activation system has been removed. Only Premium commissions are supported.');
    }
    return this.prisma.commissionRule.upsert({
      where: {
        type_level: { type: CommissionType.PREMIUM, level },
      },
      update: { amount: new Prisma.Decimal(amount) },
      create: { type: CommissionType.PREMIUM, level, amount: new Prisma.Decimal(amount) },
    });
  }

  async deleteCommissionRule(id: string) {
    return this.prisma.commissionRule.delete({
      where: { id },
    });
  }
}
