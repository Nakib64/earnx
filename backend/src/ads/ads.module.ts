import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { MonetagService } from './monetag.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { PremiumModule } from '../premium/premium.module';

@Module({
  imports: [PrismaModule, SystemConfigModule, PremiumModule],
  controllers: [AdsController],
  providers: [MonetagService],
  exports: [MonetagService],
})
export class AdsModule {}
