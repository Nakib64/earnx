import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generates a 6-digit OTP, stores it in OtpVerification (valid for 10 min),
   * enforces 2-minute cooldown on resends, and dispatches via SMS or Email.
   */
  async generateAndSendOtp(
    target: string,
    purpose: 'SIGNUP' | 'WITHDRAWAL' | 'FORGOT_PASSWORD',
    channel?: 'SMS' | 'EMAIL',
    metadata?: { amount?: number },
  ) {
    const cleanTarget = target.trim();
    if (!cleanTarget) {
      throw new BadRequestException('Recipient phone or email is required');
    }

    const detectedChannel: 'SMS' | 'EMAIL' =
      channel || (cleanTarget.includes('@') ? 'EMAIL' : 'SMS');

    const existing = await this.prisma.otpVerification.findFirst({
      where: {
        OR: [
          { target: cleanTarget, purpose },
          { phone: cleanTarget, purpose },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    const now = new Date();

    // 2-minute resend cooldown check (120 seconds)
    if (existing && existing.last_sent_at) {
      const elapsedMs = now.getTime() - new Date(existing.last_sent_at).getTime();
      const cooldownMs = 120 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new BadRequestException(
          `Please wait ${remainingSeconds} seconds before requesting a new verification code.`,
        );
      }
    }

    // Generate cryptographically uniform 6-digit OTP (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    if (existing) {
      await this.prisma.otpVerification.update({
        where: { id: existing.id },
        data: {
          target: cleanTarget,
          phone: detectedChannel === 'SMS' ? cleanTarget : null,
          email: detectedChannel === 'EMAIL' ? cleanTarget : null,
          channel: detectedChannel,
          otp,
          attempts: 0,
          is_verified: false,
          expires_at: expiresAt,
          last_sent_at: now,
        },
      });
    } else {
      await this.prisma.otpVerification.create({
        data: {
          target: cleanTarget,
          phone: detectedChannel === 'SMS' ? cleanTarget : null,
          email: detectedChannel === 'EMAIL' ? cleanTarget : null,
          channel: detectedChannel,
          purpose,
          otp,
          attempts: 0,
          is_verified: false,
          expires_at: expiresAt,
          last_sent_at: now,
        },
      });
    }

    // Dispatch via SMS or Email based on channel
    if (detectedChannel === 'EMAIL') {
      if (purpose === 'SIGNUP') {
        await this.emailService.sendSignupOtp(cleanTarget, otp);
      } else if (purpose === 'FORGOT_PASSWORD') {
        await this.emailService.sendForgotPasswordOtp(cleanTarget, otp);
      } else if (purpose === 'WITHDRAWAL') {
        await this.emailService.sendWithdrawalOtp(cleanTarget, otp, metadata?.amount || 0);
      }
    } else {
      if (purpose === 'SIGNUP') {
        await this.smsService.sendSignupOtp(cleanTarget, otp);
      } else if (purpose === 'FORGOT_PASSWORD') {
        await this.smsService.sendForgotPasswordOtp(cleanTarget, otp);
      } else if (purpose === 'WITHDRAWAL') {
        await this.smsService.sendWithdrawalOtp(cleanTarget, otp, metadata?.amount || 0);
      }
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanTarget} via ${detectedChannel}.`,
      channel: detectedChannel,
      cooldownSeconds: 120,
      expiresAt,
      // Dev mode fallback
      ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY ? { devOtp: otp } : {}),
    };
  }

  /**
   * Verifies the 6-digit OTP code against brute force attempts (max 5) and expiration (10 min)
   */
  async verifyOtp(
    target: string,
    code: string,
    purpose: 'SIGNUP' | 'WITHDRAWAL' | 'FORGOT_PASSWORD',
  ) {
    const cleanTarget = target.trim();
    const cleanCode = code.trim();

    if (!cleanTarget || !cleanCode) {
      throw new BadRequestException('Recipient identifier and 6-digit OTP are required');
    }

    const record = await this.prisma.otpVerification.findFirst({
      where: {
        OR: [
          { target: cleanTarget, purpose },
          { phone: cleanTarget, purpose },
          { email: cleanTarget, purpose },
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No active OTP request found. Please request a new verification code.');
    }

    const now = new Date();

    // 1. Expiration check
    if (now > new Date(record.expires_at)) {
      throw new BadRequestException('The OTP verification code has expired. Please request a new code.');
    }

    // 2. Rate limiting / Brute force protection (max 5 failed attempts)
    if (record.attempts >= 5) {
      throw new BadRequestException(
        'Too many failed attempts. For security, this OTP is locked. Please request a new code.',
      );
    }

    // 3. Code comparison
    if (record.otp !== cleanCode) {
      const newAttempts = record.attempts + 1;
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: newAttempts },
      });

      const remaining = Math.max(0, 5 - newAttempts);
      if (remaining === 0) {
        throw new BadRequestException('Incorrect OTP. Maximum attempts exceeded. Please request a new code.');
      }
      throw new BadRequestException(`Incorrect OTP code. You have ${remaining} attempt(s) remaining.`);
    }

    // 4. Mark verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { is_verified: true, attempts: 0 },
    });

    return {
      success: true,
      message: 'Verification successful.',
    };
  }

  /**
   * Checks if identifier has a valid, verified OTP status within last 15 minutes
   */
  async isTargetVerified(target: string, purpose: 'SIGNUP'): Promise<boolean> {
    const clean = target.trim();
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        OR: [
          { target: clean, purpose },
          { phone: clean, purpose },
          { email: clean, purpose },
        ],
        is_verified: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!record) return false;

    const now = new Date();
    const elapsedMinutes = (now.getTime() - new Date(record.updated_at).getTime()) / (1000 * 60);
    return elapsedMinutes <= 15;
  }

  async isPhoneVerified(phone: string, purpose: 'SIGNUP'): Promise<boolean> {
    return this.isTargetVerified(phone, purpose);
  }
}
