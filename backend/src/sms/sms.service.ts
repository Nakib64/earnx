import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string | undefined;
  private readonly senderId: string | undefined;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SMS_API_KEY') || process.env.SMS_API_KEY;
    this.senderId = this.configService.get<string>('SMS_SENDER_ID') || process.env.SMS_SENDER_ID;
    this.apiUrl =
      this.configService.get<string>('SMS_API_URL') ||
      process.env.SMS_API_URL ||
      'https://api.sms.net.bd/sendsms';
  }

  /**
   * Normalize Bangladeshi phone number into 8801XXXXXXXXX or standard 11 digits
   */
  public normalizePhone(phone: string): string {
    let clean = phone.replace(/[^0-9+]/g, '');
    if (clean.startsWith('+880')) {
      clean = clean.substring(1);
    } else if (clean.startsWith('880')) {
      // already with 880 prefix
    } else if (clean.startsWith('01') && clean.length === 11) {
      clean = `880${clean.substring(1)}`;
    }
    return clean;
  }

  /**
   * Send SMS via sms.net.bd provider
   */
  async sendSms(to: string, message: string): Promise<SmsSendResult> {
    const formattedPhone = this.normalizePhone(to);

    // If no API key is provided, log to console for development & debugging
    if (!this.apiKey || this.apiKey === 'your_sms_api_key') {
      this.logger.log(`[SMS-DEV-MODE] To: ${formattedPhone} | Message: "${message}"`);
      return {
        success: true,
        provider: 'dev-console',
        messageId: `dev-${Date.now()}`,
      };
    }

    try {
      const params = new URLSearchParams({
        api_key: this.apiKey,
        msg: message,
        to: formattedPhone,
      });

      if (this.senderId) {
        params.append('sender_id', this.senderId);
      }

      const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && (data.error === 0 || data.status === 'success' || data.msg === 'Success')) {
        this.logger.log(`[SMS SUCCESS] Dispatched to ${formattedPhone}`);
        return {
          success: true,
          provider: 'sms.net.bd',
          messageId: data.data?.request_id || data.request_id || `sms-${Date.now()}`,
        };
      }

      const errMsg = data?.msg || data?.message || response.statusText || 'Failed to dispatch SMS';
      this.logger.error(`[SMS FAILED] Provider response: ${JSON.stringify(data)}`);
      return {
        success: false,
        provider: 'sms.net.bd',
        error: errMsg,
      };
    } catch (err: any) {
      this.logger.error(`[SMS ERROR] Network error sending SMS: ${err?.message || err}`);
      return {
        success: false,
        provider: 'sms.net.bd',
        error: err?.message || 'Network error while sending SMS',
      };
    }
  }

  /**
   * Helper to send 6-digit OTP for signup verification (GSM-7 ASCII, single SMS)
   */
  async sendSignupOtp(phone: string, otp: string): Promise<SmsSendResult> {
    const message = `Your EarnX verification OTP code is: ${otp}.`;
    return this.sendSms(phone, message);
  }

  /**
   * Helper to send 6-digit OTP for withdrawal verification (GSM-7 ASCII, single SMS)
   */
  async sendWithdrawalOtp(phone: string, otp: string, amount: number): Promise<SmsSendResult> {
    const message = `Your EarnX withdrawal OTP for BDT ${amount.toFixed(2)} is: ${otp}`;
    return this.sendSms(phone, message);
  }
}
