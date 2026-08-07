import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe(
        `ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'BALANCE_TRANSFER';`
      );
    } catch (err) {
      // Ignore if syntax unsupported or value already exists
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
