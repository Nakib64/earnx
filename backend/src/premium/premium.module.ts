import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { PremiumPackageSubService } from './sub-services/premium-package.sub-service';
import { DailyAdsSubService } from './sub-services/daily-ads.sub-service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, SystemConfigModule],
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
