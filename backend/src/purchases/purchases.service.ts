import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { CommissionService } from '../commissions/commission.service';
import { WalletService } from '../wallets/wallet.service';
import { CoinsService } from '../coins/coins.service';
import { CreatePurchaseDto, PackageType } from './dto/create-purchase.dto';
import {
  UserStatus,
  CommissionType,
  TransactionType,
  RequestStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfigService: SystemConfigService,
    private readonly commissionService: CommissionService,
    private readonly walletService: WalletService,
    private readonly coinsService: CoinsService,
  ) {}

  private async generateSerialUserCode(tx: Prisma.TransactionClient): Promise<string> {
    const existingUsers = await tx.user.findMany({
      where: { referral_code: { startsWith: 'EX' } },
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
    return `EX${String(nextNum).padStart(4, '0')}`;
  }

  async purchasePackage(payerUserId: string, dto: CreatePurchaseDto) {
    const payer = await this.prisma.user.findUnique({
      where: { id: payerUserId },
    });
    if (!payer) throw new NotFoundException('Payer account not found');

    // 1. Find Target User by referral_code, phone, or id
    const cleanCode = dto.target_user_code.trim();
    const targetUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { referral_code: { equals: cleanCode, mode: 'insensitive' } },
          { phone: { equals: cleanCode } },
          { id: cleanCode },
        ],
      },
      include: { designation: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Target user with code/phone "${cleanCode}" was not found.`);
    }



    // 3. Package Validation & Duplicate Package Checks
    let packageCost = 0;
    let investmentPlan: any = null;

    if (dto.package_type === PackageType.ACTIVATION) {
      if (targetUser.status === UserStatus.ACTIVE) {
        throw new BadRequestException(
          `User "${targetUser.full_name || targetUser.phone}" (User Code: ${targetUser.referral_code}) is already an ACTIVE account. Account activation cannot be purchased again for an active member.`
        );
      }
      const feeVal = await this.systemConfigService.getValue('ACTIVATION_FEE', '500');
      packageCost = parseFloat(feeVal) || 500;
    } else if (dto.package_type === PackageType.PREMIUM) {
      if (payer.id !== targetUser.id && !payer.is_premium) {
        throw new BadRequestException(
          'You must be a Premium Member yourself in order to purchase Premium status for other users.'
        );
      }
      if (targetUser.status !== UserStatus.ACTIVE) {
        throw new BadRequestException(
          `User "${targetUser.full_name || targetUser.phone}" (User Code: ${targetUser.referral_code}) is not an ACTIVE account. An account must be activated before taking Premiumship.`
        );
      }
      if (targetUser.is_premium) {
        throw new BadRequestException(
          `User "${targetUser.full_name || targetUser.phone}" (User Code: ${targetUser.referral_code}) is already a Premium Member. Premium subscription cannot be purchased again.`
        );
      }
      const feeVal = await this.systemConfigService.getValue('PREMIUM_FEE', '1000');
      packageCost = parseFloat(feeVal) || 1000;
    } else if (dto.package_type === PackageType.INVESTMENT) {
      if (!dto.investment_plan_id) {
        throw new BadRequestException('Investment plan selection is required for investment package.');
      }
      investmentPlan = await this.prisma.investmentPlan.findUnique({
        where: { id: dto.investment_plan_id },
      });
      if (!investmentPlan || !investmentPlan.is_active) {
        throw new BadRequestException('Selected investment plan is invalid or inactive.');
      }
      packageCost = Number(investmentPlan.amount);
    } else {
      throw new BadRequestException('Invalid package type selected.');
    }

    // 4. Check Payer Main Wallet Balance
    const currentBalance = Number(payer.wallet_balance);
    if (currentBalance < packageCost) {
      throw new BadRequestException(
        `Insufficient wallet balance. This package requires ৳${packageCost.toFixed(
          2
        )}, but your current balance is ৳${currentBalance.toFixed(2)}.`
      );
    }

    // 5. Execute DB Transaction
    return this.prisma.$transaction(async (tx) => {
      // A. Deduct Payer Balance using WalletService
      await this.walletService.processTransaction(
        payer.id,
        TransactionType.BALANCE_TRANSFER,
        -packageCost,
        `Purchased ${dto.package_type} package for User Code ${targetUser.referral_code} (${targetUser.phone})`,
        tx
      );

      // B. Process Package Specific Logic for Target User
      if (dto.package_type === PackageType.ACTIVATION) {
        let userCode = targetUser.referral_code;
        if (!userCode || !userCode.startsWith('EX')) {
          userCode = await this.generateSerialUserCode(tx);
        }

        const updateData: any = {
          status: UserStatus.ACTIVE,
          referral_code: userCode,
        };

        await tx.user.update({
          where: { id: targetUser.id },
          data: updateData,
        });

        // Trigger activation commissions & bonus unlock
        await this.commissionService.distributeCommissions(
          targetUser.id,
          CommissionType.ACTIVATION,
          tx
        );
        if (targetUser.referred_by_id) {
          await this.coinsService.checkAndUnlockForReferrer(targetUser.referred_by_id, tx);
        }
      } else if (dto.package_type === PackageType.PREMIUM) {
        const updateData: any = {
          is_premium: true,
          premium_started_at: new Date(),
        };

        await tx.user.update({
          where: { id: targetUser.id },
          data: updateData,
        });

        // Trigger premium commissions
        await this.commissionService.distributeCommissions(
          targetUser.id,
          CommissionType.PREMIUM,
          tx
        );
      } else if (dto.package_type === PackageType.INVESTMENT) {
        const amountNum = Number(investmentPlan.amount);
        const returnPercentNum = Number(investmentPlan.monthly_return_percent);
        const monthlyPayoutNum = (amountNum * returnPercentNum) / 100;
        const durationMonths = investmentPlan.duration_months || 12;



        await tx.userInvestment.create({
          data: {
            user_id: targetUser.id,
            plan_id: investmentPlan.id,
            amount: new Prisma.Decimal(amountNum),
            monthly_return_percent: new Prisma.Decimal(returnPercentNum),
            monthly_payout_amount: new Prisma.Decimal(monthlyPayoutNum),
            status: RequestStatus.APPROVED,
            request_type: 'PURCHASE',
            max_payouts: investmentPlan.is_lifetime ? null : durationMonths,
            is_lifetime: investmentPlan.is_lifetime,
          },
        });
      }

      const updatedPayer = await tx.user.findUnique({
        where: { id: payer.id },
        select: { wallet_balance: true },
      });

      return {
        success: true,
        message: `Successfully purchased ${dto.package_type} package for ${
          targetUser.full_name || targetUser.phone
        } (User Code: ${targetUser.referral_code})!`,
        package_type: dto.package_type,
        amount: packageCost,
        target_user: {
          id: targetUser.id,
          full_name: targetUser.full_name,
          phone: targetUser.phone,
          referral_code: targetUser.referral_code,
        },
        remaining_balance: Number(updatedPayer?.wallet_balance || 0),
      };
    });
  }
}
