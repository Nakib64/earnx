import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Generates a 6-digit OTP, stores it in OtpVerification (valid for 10 min),
   * enforces 2-minute cooldown on resends, and sends SMS to user.
   */
  async generateAndSendOtp(
    phone: string,
    purpose: 'SIGNUP' | 'WITHDRAWAL' | 'FORGOT_PASSWORD',
    metadata?: { amount?: number },
  ) {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      throw new BadRequestException('Phone number is required');
    }

    const existing = await this.prisma.otpVerification.findFirst({
      where: { phone: cleanPhone, purpose },
      orderBy: { created_at: 'desc' },
    });

    const now = new Date();

    // 2-minute resend cooldown check (120 seconds)
    if (existing && existing.last_sent_at) {
      const elapsedMs = now.getTime() - new Date(existing.last_sent_at).getTime();
      const cooldownMs = 120 * 1000; // 2 minutes
      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new BadRequestException(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        );
      }
    }

    // Generate cryptographically uniform 6-digit OTP (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes validity

    if (existing) {
      await this.prisma.otpVerification.update({
        where: { id: existing.id },
        data: {
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
          phone: cleanPhone,
          purpose,
          otp,
          attempts: 0,
          is_verified: false,
          expires_at: expiresAt,
          last_sent_at: now,
        },
      });
    }

    // Dispatch SMS based on purpose
    if (purpose === 'SIGNUP') {
      await this.smsService.sendSignupOtp(cleanPhone, otp);
    } else if (purpose === 'FORGOT_PASSWORD') {
      await this.smsService.sendForgotPasswordOtp(cleanPhone, otp);
    } else if (purpose === 'WITHDRAWAL') {
      await this.smsService.sendWithdrawalOtp(cleanPhone, otp, metadata?.amount || 0);
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanPhone}.`,
      cooldownSeconds: 120,
      expiresAt,
      // For development ease, include otp in response when SMS_API_KEY is not set
      ...(process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY ? { devOtp: otp } : {}),
    };
  }

  /**
   * Verifies the 6-digit OTP code against brute force attempts (max 5) and expiration (10 min)
   */
  async verifyOtp(phone: string, code: string, purpose: 'SIGNUP' | 'WITHDRAWAL' | 'FORGOT_PASSWORD') {
    const cleanPhone = phone.trim();
    const cleanCode = code.trim();

    if (!cleanPhone || !cleanCode) {
      throw new BadRequestException('Phone number and 6-digit OTP are required');
    }

    const record = await this.prisma.otpVerification.findFirst({
      where: { phone: cleanPhone, purpose },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('No active OTP request found for this phone number. Please request a new OTP.');
    }

    const now = new Date();

    // 1. Expiration check (10 minutes)
    if (now > new Date(record.expires_at)) {
      throw new BadRequestException('The OTP verification code has expired. Please request a new OTP.');
    }

    // 2. Rate limiting / Brute force protection (max 5 failed attempts)
    if (record.attempts >= 5) {
      throw new BadRequestException(
        'Too many failed attempts. For security, this OTP is locked. Please request a new OTP.',
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
        throw new BadRequestException('Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.');
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
      message: 'Phone number verified successfully.',
    };
  }

  /**
   * Checks if phone has a valid, verified OTP status within last 10 minutes
   */
  async isPhoneVerified(phone: string, purpose: 'SIGNUP'): Promise<boolean> {
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phone: phone.trim(),
        purpose,
        is_verified: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!record) return false;

    // Must have been verified within the last 15 minutes
    const now = new Date();
    const elapsedMinutes = (now.getTime() - new Date(record.updated_at).getTime()) / (1000 * 60);
    return elapsedMinutes <= 15;
  }
}
