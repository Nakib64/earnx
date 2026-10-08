import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587', 10);
    const user = this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER;
    const pass = this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS;
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      process.env.SMTP_FROM ||
      'EarnX Capital <no-reply@earnx.com>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transporter initialized with host: ${host}:${port}`);
    } else {
      this.logger.log('No SMTP credentials configured. Running in DEV console email mode.');
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<EmailSendResult> {
    const cleanTo = to.trim();

    if (!this.transporter) {
      this.logger.log(`[EMAIL-DEV-MODE] To: ${cleanTo} | Subject: "${subject}" | Content: ${text || html}`);
      return {
        success: true,
        provider: 'dev-console',
        messageId: `dev-email-${Date.now()}`,
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: cleanTo,
        subject,
        html,
        text: text || subject,
      });

      this.logger.log(`[EMAIL SUCCESS] Sent to ${cleanTo} (MessageId: ${info.messageId})`);
      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
      };
    } catch (err: any) {
      this.logger.error(`[EMAIL ERROR] Failed to send email to ${cleanTo}: ${err.message}`);
      return {
        success: false,
        provider: 'smtp',
        error: err.message,
      };
    }
  }

  async sendSignupOtp(email: string, otp: string): Promise<EmailSendResult> {
    const subject = `Your EarnX Verification Code: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
        <h2 style="color: #005A36; margin-bottom: 8px;">EarnX Capital</h2>
        <p style="color: #475569; font-size: 14px;">Welcome to EarnX! Use the 6-digit verification code below to complete your account registration:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #005A36;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this, please disregard this message.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html, `Your EarnX verification OTP code is: ${otp}. Valid for 10 minutes.`);
  }

  async sendForgotPasswordOtp(email: string, otp: string): Promise<EmailSendResult> {
    const subject = `EarnX Password Reset Code: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
        <h2 style="color: #005A36; margin-bottom: 8px;">EarnX Capital</h2>
        <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the verification code below:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #b91c1c;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. If you did not request this, no action is needed.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html, `Your EarnX password reset OTP code is: ${otp}. Valid for 10 minutes.`);
  }

  async sendWithdrawalOtp(email: string, otp: string, amount: number): Promise<EmailSendResult> {
    const subject = `EarnX Withdrawal Verification Code: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
        <h2 style="color: #005A36; margin-bottom: 8px;">EarnX Capital</h2>
        <p style="color: #475569; font-size: 14px;">A withdrawal request of <strong>৳${amount.toFixed(2)}</strong> has been initiated on your account. Confirm your request with the OTP below:</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #005A36;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 12px;">This code expires in 10 minutes. For security, never share this code with anyone.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html, `Your EarnX withdrawal OTP for BDT ${amount.toFixed(2)} is: ${otp}. Valid for 10 minutes.`);
  }
}
