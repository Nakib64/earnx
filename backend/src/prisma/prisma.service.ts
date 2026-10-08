import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe(
        `ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'BALANCE_TRANSFER';`,
      );
      await this.$executeRawUnsafe(
        `ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'PREMIUM_DAILY_REWARD';`,
      );
      await this.$executeRawUnsafe(
        `ALTER TYPE "CoinTransactionType" ADD VALUE IF NOT EXISTS 'COIN_TRANSFER_SENT';`,
      );
      await this.$executeRawUnsafe(
        `ALTER TYPE "CoinTransactionType" ADD VALUE IF NOT EXISTS 'COIN_TRANSFER_RECEIVED';`,
      );
    } catch (err) {}

    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "premium_package_id" TEXT;`,
      );
    } catch (err) {}

    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "InvestmentPlan" ADD COLUMN IF NOT EXISTS "is_lifetime" BOOLEAN DEFAULT false;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "InvestmentPlan" ADD COLUMN IF NOT EXISTS "amount" DECIMAL(12, 2) DEFAULT 0;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "InvestmentPlan" ALTER COLUMN "duration_months" DROP NOT NULL;`,
      );
    } catch (err) {}

    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "is_lifetime" BOOLEAN DEFAULT false;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "request_type" TEXT DEFAULT 'NEW';`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "pending_plan_id" TEXT;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "pending_amount" DECIMAL(12, 2);`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ALTER COLUMN "max_payouts" DROP NOT NULL;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "duration_months" INTEGER DEFAULT 12;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "starts_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "ends_at" TIMESTAMP(3);`,
      );
      await this.$executeRawUnsafe(
        `ALTER TABLE "UserInvestment" ADD COLUMN IF NOT EXISTS "is_principal_returned" BOOLEAN DEFAULT false;`,
      );
    } catch (err) {}
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
