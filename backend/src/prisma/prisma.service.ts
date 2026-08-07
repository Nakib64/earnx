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
    } catch (err) {}

    try {
      await this.$executeRawUnsafe(
        `ALTER TABLE "InvestmentPlan" ADD COLUMN IF NOT EXISTS "is_lifetime" BOOLEAN DEFAULT false;`,
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
        `ALTER TABLE "UserInvestment" ALTER COLUMN "max_payouts" DROP NOT NULL;`,
      );
    } catch (err) {}
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
