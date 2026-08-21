import { Module, Global } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SmsModule } from '../sms/sms.module';

@Global()
@Module({
  imports: [SmsModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
