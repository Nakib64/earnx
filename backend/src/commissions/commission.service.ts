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
   * Business Rules Engine:
   * 1. ACTIVATION: Single-level direct referral payout ONLY.
   * 2. PREMIUM: Up to 5 layers upper.
   *    - Upper parent at Level N receives payout IF AND ONLY IF they are an active Premium subscriber AND their Designation Star rating unlocks that tree level (max_level >= level).
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
        this.logger.log(`No commission rules found for type ${commissionType}`);
        return payoutSummary;
      }

      // Source user being activated or upgrading to premium
      const sourceUser = await tx.user.findUnique({
        where: { id: sourceUserId },
        select: { id: true, phone: true, full_name: true, referral_code: true, referred_by_id: true },
      });

      if (!sourceUser || !sourceUser.referred_by_id) {
        return payoutSummary; // No referrer to pay
      }

      // Business Rule 1: ACTIVATION is single-level direct referrer ONLY (maxDepth = 1).
      // Business Rule 2: PREMIUM is up to 5 levels deep (maxDepth = 5).
      const maxAllowedTreeDepth = commissionType === CommissionType.ACTIVATION ? 1 : 5;

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
          // Rule 2: For PREMIUM commissions, ALL upline tiers (Level 1 to 5) must be Premium members
          else if (commissionType === CommissionType.PREMIUM && !parent.is_premium) {
            payoutSummary.push({
              level: currentLevel,
              parentId: parent.id,
              parentPhone: parent.phone,
              amount: payoutAmount,
              qualified: false,
              reason: `Upline user (${parent.phone}) at level ${currentLevel} is not a Premium member`,
            });
          } else {
            // Rule 3: 5-Level Designation Rank Cap (if parent has a designation with max_level, respects it; otherwise defaults to all 5 levels)
            const maxUnlockedLevel = parent.designation ? parent.designation.max_level : 5;

            const isQualified = commissionType === CommissionType.ACTIVATION
              ? currentLevel === 1
              : (parent.is_premium && maxUnlockedLevel >= currentLevel);

            if (isQualified) {
              const sourceLabel = sourceUser.full_name || sourceUser.phone;
              const description = `${commissionType === CommissionType.PREMIUM ? 'Premium' : 'Activation'} Level ${currentLevel} Commission from ${sourceLabel} (${sourceUser.referral_code || sourceUser.phone})`;

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
      orderBy: [{ type: 'asc' }, { level: 'asc' }],
    });
  }

  async upsertCommissionRule(type: CommissionType, level: number, amount: number) {
    if (type === CommissionType.ACTIVATION && level > 1) {
      throw new BadRequestException('Activation commission is single-level direct referrer only (Level 1)');
    }
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
