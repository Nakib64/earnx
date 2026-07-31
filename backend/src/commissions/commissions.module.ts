import { Global, Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { CommissionsController } from './commissions.controller';

@Global()
@Module({
  controllers: [CommissionsController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionsModule {}
