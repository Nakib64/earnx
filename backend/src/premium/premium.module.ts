import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PremiumService } from './premium.service';
import { PremiumController } from './premium.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, SystemConfigModule],
  controllers: [PremiumController],
  providers: [PremiumService],
  exports: [PremiumService],
})
export class PremiumModule {}
