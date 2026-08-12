import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { WalletsModule } from '../wallets/wallets.module';
import { CoinsModule } from '../coins/coins.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [
    PrismaModule,
    CommissionsModule,
    WalletsModule,
    CoinsModule,
    UserAuthModule,
    AdminAuthModule,
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
