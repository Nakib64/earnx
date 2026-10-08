import { Module } from '@nestjs/common';
import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { DepositGatewaySubService } from './sub-services/deposit-gateway.sub-service';
import { DepositAdminSubService } from './sub-services/deposit-admin.sub-service';

@Module({
  imports: [PrismaModule, SystemConfigModule],
  controllers: [DepositsController],
  providers: [
    DepositGatewaySubService,
    DepositAdminSubService,
    DepositsService,
  ],
  exports: [
    DepositGatewaySubService,
    DepositAdminSubService,
    DepositsService,
  ],
})
export class DepositsModule {}
