import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { WalletsModule } from '../wallets/wallets.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { CoinPurchaseSubService } from './sub-services/coin-purchase.sub-service';
import { CoinTransferSubService } from './sub-services/coin-transfer.sub-service';
import { CoinRewardSubService } from './sub-services/coin-reward.sub-service';
import { CoinAdminSubService } from './sub-services/coin-admin.sub-service';

@Module({
  imports: [
    PrismaModule,
    SystemConfigModule,
    WalletsModule,
    UserAuthModule,
    AdminAuthModule,
  ],
  controllers: [CoinsController],
  providers: [
    CoinPurchaseSubService,
    CoinTransferSubService,
    CoinRewardSubService,
    CoinAdminSubService,
    CoinsService,
  ],
  exports: [
    CoinPurchaseSubService,
    CoinTransferSubService,
    CoinRewardSubService,
    CoinAdminSubService,
    CoinsService,
  ],
})
export class CoinsModule {}
