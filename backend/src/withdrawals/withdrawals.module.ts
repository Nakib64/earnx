import { Module } from '@nestjs/common';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { WithdrawalRequestSubService } from './sub-services/withdrawal-request.sub-service';
import { WithdrawalAdminSubService } from './sub-services/withdrawal-admin.sub-service';

@Module({
  imports: [PrismaModule, SmsModule, EmailModule],
  controllers: [WithdrawalsController],
  providers: [
    WithdrawalRequestSubService,
    WithdrawalAdminSubService,
    WithdrawalsService,
  ],
  exports: [
    WithdrawalRequestSubService,
    WithdrawalAdminSubService,
    WithdrawalsService,
  ],
})
export class WithdrawalsModule {}
