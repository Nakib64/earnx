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
    subscribedPackage?: any,
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

      // Source user subscribing or upgrading to premium
      const sourceUser = await tx.user.findUnique({
        where: { id: sourceUserId },
        select: { id: true, phone: true, full_name: true, referral_code: true, referred_by_id: true },
      });

      if (!sourceUser || !sourceUser.referred_by_id) {
        return payoutSummary; // No referrer to pay
      }

      const sourceLabel = sourceUser.full_name || sourceUser.phone;

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

        // Determine payout amount and description for this level
        let payoutAmount = 0;
        let description = '';

        if (currentLevel === 1) {
          // Level 1: Direct Referral Commission from Package (e.g. 500, 800)
          const pkgDirect = subscribedPackage ? Number(subscribedPackage.direct_referral_commission || 0) : 0;
          if (pkgDirect > 0) {
            payoutAmount = pkgDirect;
            description = `Direct Referral Commission (${subscribedPackage.title}) from ${sourceLabel} (${sourceUser.referral_code || sourceUser.phone})`;
          } else if (ruleForLevel && Number(ruleForLevel.amount) > 0) {
            payoutAmount = Number(ruleForLevel.amount);
            description = `Direct Referral Commission from ${sourceLabel} (${sourceUser.referral_code || sourceUser.phone})`;
          }
        } else {
          // Levels 2 - 5: Multi-level rules
          if (ruleForLevel && Number(ruleForLevel.amount) > 0) {
            payoutAmount = Number(ruleForLevel.amount);
            description = `Premium Level ${currentLevel} Referral Commission from ${sourceLabel} (${sourceUser.referral_code || sourceUser.phone})`;
          }
        }

        if (payoutAmount > 0) {
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
          // Rule 2 for Level 1: Direct sponsor is rewarded if active
          else if (currentLevel === 1) {
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
          }
          // Rule 2 & 3 for Levels 2+: Upline MUST be a Premium member and designation rank cap applies
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
            const maxUnlockedLevel = parent.designation ? parent.designation.max_level : 5;
            const isQualified = parent.is_premium && maxUnlockedLevel >= currentLevel;

            if (isQualified) {
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

  // Admin rule configuration methods (Levels 2 to 5 for indirect uplines; Level 1 is on PremiumPackage)
  async getCommissionRules() {
    return this.prisma.commissionRule.findMany({
      where: { type: CommissionType.PREMIUM, level: { gte: 2 } },
      orderBy: [{ level: 'asc' }],
    });
  }

  async upsertCommissionRule(type: CommissionType, level: number, amount: number) {
    if (type === CommissionType.ACTIVATION) {
      throw new BadRequestException('Activation system has been removed. Only Premium commissions are supported.');
    }
    if (level < 2 || level > 5) {
      throw new BadRequestException(
        'Commission rules in this module configure upline Levels 2 to 5. Direct sponsor (Level 1) commission is configured directly on each Premium Package.',
      );
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
