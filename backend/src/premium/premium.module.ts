import { Module } from '@nestjs/common';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { PremiumPackageSubService } from './sub-services/premium-package.sub-service';
import { DailyAdsSubService } from './sub-services/daily-ads.sub-service';
import { CoinsModule } from '../coins/coins.module';

@Module({
  imports: [PrismaModule, SystemConfigModule, CoinsModule],
  controllers: [PremiumController],
  providers: [
    PremiumPackageSubService,
    DailyAdsSubService,
    PremiumService,
  ],
  exports: [
    PremiumPackageSubService,
    DailyAdsSubService,
    PremiumService,
  ],
})
export class PremiumModule {}
