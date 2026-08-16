import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { SystemConfigModule } from '../system-config/system-config.module';
import { CommissionsModule } from '../commissions/commissions.module';
import { CoinsModule } from '../coins/coins.module';

@Module({
  imports: [SystemConfigModule, CommissionsModule, CoinsModule],
  providers: [PurchasesService],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
