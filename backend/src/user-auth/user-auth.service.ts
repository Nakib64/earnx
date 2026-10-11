import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import * as bcrypt from 'bcrypt';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  public async generateUniqueReferralCode(tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    const existingUsers = await prisma.user.findMany({
      where: {
        referral_code: { startsWith: 'EX' },
      },
      select: { referral_code: true },
    });

    let maxNum = 1000;
    for (const u of existingUsers) {
      const match = u.referral_code.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    }

    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(4, '0');
    return `EX${padded}`;
  }

  /**
   * Dispatches 6-digit signup OTP via SMS (phone) or Email (email address)
   */
  async sendSignupOtp(target: string) {
    const cleanTarget = target?.trim();
    if (!cleanTarget) {
      throw new BadRequestException('Phone number or email address is required');
    }

    const isEmail = cleanTarget.includes('@');
    if (isEmail) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: cleanTarget },
      });
      if (existingEmail) {
        throw new ConflictException('A user with this email address already exists');
      }
      return this.otpService.generateAndSendOtp(cleanTarget, 'SIGNUP', 'EMAIL');
    } else {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: cleanTarget },
      });
      if (existingPhone) {
        throw new ConflictException('A user with this phone number already exists');
      }
      return this.otpService.generateAndSendOtp(cleanTarget, 'SIGNUP', 'SMS');
    }
  }

  /**
   * Verifies 6-digit signup OTP
   */
  async verifySignupOtp(target: string, otp: string) {
    return this.otpService.verifyOtp(target, otp, 'SIGNUP');
  }

  /**
   * Dispatches 6-digit forgot password OTP via SMS or Email
   */
  async sendForgotPasswordOtp(target: string) {
    const cleanTarget = target?.trim();
    if (!cleanTarget) {
      throw new BadRequestException('Phone number or email is required');
    }

    const isEmail = cleanTarget.includes('@');
    const user = isEmail
      ? await this.prisma.user.findUnique({ where: { email: cleanTarget } })
      : await this.prisma.user.findUnique({ where: { phone: cleanTarget } });

    if (!user) {
      throw new BadRequestException(`No registered account found with this ${isEmail ? 'email' : 'phone number'}`);
    }

    return this.otpService.generateAndSendOtp(cleanTarget, 'FORGOT_PASSWORD', isEmail ? 'EMAIL' : 'SMS');
  }

  /**
   * Verifies OTP and resets user password
   */
  async resetForgotPassword(target: string, otp: string, newPassword: string) {
    const cleanTarget = target?.trim();
    if (!cleanTarget) {
      throw new BadRequestException('Phone number or email is required');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    // 1. Verify OTP
    await this.otpService.verifyOtp(cleanTarget, otp, 'FORGOT_PASSWORD');

    // 2. Find and update user password
    const isEmail = cleanTarget.includes('@');
    const user = isEmail
      ? await this.prisma.user.findUnique({ where: { email: cleanTarget } })
      : await this.prisma.user.findUnique({ where: { phone: cleanTarget } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password_hash: passwordHash },
    });

    // Invalidate OTP record so it cannot be reused
    await this.prisma.otpVerification.updateMany({
      where: {
        OR: [
          { target: cleanTarget, purpose: 'FORGOT_PASSWORD' },
          { phone: cleanTarget, purpose: 'FORGOT_PASSWORD' },
          { email: cleanTarget, purpose: 'FORGOT_PASSWORD' },
        ],
      },
      data: { is_verified: false, otp: 'EXPIRED' },
    });

    return {
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    };
  }

  async register(dto: UserRegisterDto & { otp?: string }) {
    const cleanPhone = dto.phone ? dto.phone.trim() : null;
    const cleanEmail = dto.email ? dto.email.trim() : null;

    if (!cleanPhone && !cleanEmail) {
      throw new BadRequestException('Either a phone number or an email address must be provided');
    }

    // Verify uniqueness
    if (cleanPhone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        throw new ConflictException('A user with this phone number already exists');
      }
    }

    if (cleanEmail) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        throw new ConflictException('A user with this email address already exists');
      }
    }

    // Determine target for OTP check
    const primaryTarget = cleanPhone || cleanEmail!;

    if (dto.otp) {
      await this.otpService.verifyOtp(primaryTarget, dto.otp, 'SIGNUP');
    } else {
      const isVerified = await this.otpService.isTargetVerified(primaryTarget, 'SIGNUP');
      if (!isVerified) {
        throw new BadRequestException(
          `Verification required. Please enter the 6-digit OTP sent to your ${cleanPhone ? 'phone' : 'email'}.`,
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newReferralCode = await this.generateUniqueReferralCode();

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          phone: cleanPhone,
          email: cleanEmail,
          password_hash: passwordHash,
          full_name: dto.full_name?.trim() || null,
          country: dto.country?.trim() || 'Bangladesh',
          national_id: dto.national_id?.trim() || null,
          avatar_url: dto.avatar_url?.trim() || null,
          referral_code: newReferralCode,
          referred_by_id: null,
          status: UserStatus.ACTIVE, // Immediate ACTIVE access
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        const target = (err.meta?.target as string[]) || [];
        const targetStr = Array.isArray(target) ? target.join(', ') : String(target);
        if (targetStr.includes('phone')) {
          throw new ConflictException('A user with this phone number already exists');
        }
        if (targetStr.includes('email')) {
          throw new ConflictException('A user with this email address already exists');
        }
        if (targetStr.includes('referral_code')) {
          throw new ConflictException('Referral code collision. Please retry registration.');
        }
        throw new ConflictException('An account with these details already exists.');
      }
      throw err;
    }

    const payload = { sub: user.id, phone: user.phone || user.email, role: 'user' };
    const accessToken = this.jwtService.sign(payload);
    const { password_hash, ...sanitizedUser } = user;

    return {
      accessToken,
      user: sanitizedUser,
    };
  }

  // In-memory sliding window for account brute-force protection (phone or email)
  private failedAttempts = new Map<string, { attempts: number; lockedUntil: number | null; lastAttempt: number }>();

  private getLockoutStatus(target: string): { isLocked: boolean; remainingMinutes: number } {
    const record = this.failedAttempts.get(target);
    if (!record || !record.lockedUntil) {
      return { isLocked: false, remainingMinutes: 0 };
    }
    const now = Date.now();
    if (now < record.lockedUntil) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { isLocked: true, remainingMinutes };
    }
    // Expired lockout -> auto-reset
    this.failedAttempts.delete(target);
    return { isLocked: false, remainingMinutes: 0 };
  }

  private recordFailedAttempt(target: string): { remainingAttempts: number; isLocked: boolean; lockMinutes: number } {
    if (this.failedAttempts.size > 500) {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      for (const [key, value] of this.failedAttempts.entries()) {
        if (value.lastAttempt < twoHoursAgo && (!value.lockedUntil || value.lockedUntil < Date.now())) {
          this.failedAttempts.delete(key);
        }
      }
    }

    const record = this.failedAttempts.get(target) || { attempts: 0, lockedUntil: null, lastAttempt: Date.now() };
    const maxAttempts = 5;
    const lockMinutes = 15;
    const newAttempts = record.attempts + 1;

    if (newAttempts >= maxAttempts) {
      this.failedAttempts.set(target, {
        attempts: newAttempts,
        lockedUntil: Date.now() + lockMinutes * 60 * 1000,
        lastAttempt: Date.now(),
      });
      return { remainingAttempts: 0, isLocked: true, lockMinutes };
    }

    this.failedAttempts.set(target, {
      attempts: newAttempts,
      lockedUntil: null,
      lastAttempt: Date.now(),
    });

    return { remainingAttempts: maxAttempts - newAttempts, isLocked: false, lockMinutes: 0 };
  }

  private clearFailedAttempts(target: string) {
    this.failedAttempts.delete(target);
  }

  async login(dto: UserLoginDto) {
    const rawTarget = (dto.identifier || dto.phone || dto.email || '').trim().toLowerCase();
    if (!rawTarget) {
      throw new BadRequestException('Phone number or email is required');
    }

    // 1. Check account-level lockout status
    const { isLocked, remainingMinutes } = this.getLockoutStatus(rawTarget);
    if (isLocked) {
      throw new UnauthorizedException(
        `Too many failed login attempts. Account access is temporarily locked for security. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    // Find by phone OR by email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: rawTarget },
          { email: rawTarget },
        ],
      },
      include: {
        designation: true,
        referred_by: {
          select: {
            id: true,
            phone: true,
            email: true,
            full_name: true,
            referral_code: true,
          },
        },
      },
    });

    if (!user) {
      const { remainingAttempts, isLocked: newlyLocked, lockMinutes } = this.recordFailedAttempt(rawTarget);
      if (newlyLocked) {
        throw new UnauthorizedException(
          `Too many failed login attempts. Account access is temporarily locked for ${lockMinutes} minutes.`,
        );
      }
      throw new UnauthorizedException(
        `Invalid login credentials. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account has been blocked by an admin');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      const { remainingAttempts, isLocked: newlyLocked, lockMinutes } = this.recordFailedAttempt(rawTarget);
      if (newlyLocked) {
        throw new UnauthorizedException(
          `Too many failed login attempts. Account access is temporarily locked for ${lockMinutes} minutes.`,
        );
      }
      throw new UnauthorizedException(
        `Invalid login credentials. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
      );
    }

    // Login successful -> clear failed attempt counter
    this.clearFailedAttempts(rawTarget);

    const payload = { sub: user.id, phone: user.phone || user.email, role: 'user' };
    const accessToken = this.jwtService.sign(payload);

    const { password_hash, ...sanitizedUser } = user;

    return {
      accessToken,
      user: sanitizedUser,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        designation: true,
        premium_package: true,
        referred_by: {
          select: {
            id: true,
            phone: true,
            email: true,
            full_name: true,
            referral_code: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  async updateProfile(
    userId: string,
    dto: {
      full_name?: string;
      email?: string;
      country?: string;
      national_id?: string;
      avatar_url?: string;
      current_password?: string;
      new_password?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: any = {};

    if (dto.full_name !== undefined) {
      updateData.full_name = dto.full_name.trim() || null;
    }
    if (dto.email !== undefined) {
      const cleanEmail = dto.email.trim() || null;
      if (cleanEmail && cleanEmail !== user.email) {
        const existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) throw new ConflictException('Email address is already in use by another account');
      }
      updateData.email = cleanEmail;
    }
    if (dto.country !== undefined) {
      updateData.country = dto.country.trim() || 'Bangladesh';
    }
    if (dto.national_id !== undefined) {
      updateData.national_id = dto.national_id.trim() || null;
    }
    if (dto.avatar_url !== undefined) {
      updateData.avatar_url = dto.avatar_url.trim() || null;
    }

    if (dto.new_password) {
      if (!dto.current_password) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const isPasswordValid = await bcrypt.compare(dto.current_password, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      if (dto.new_password.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters');
      }
      updateData.password_hash = await bcrypt.hash(dto.new_password, 10);
    }

    let updatedUser;
    try {
      updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          designation: true,
          premium_package: true,
          referred_by: {
            select: {
              id: true,
              phone: true,
              email: true,
              full_name: true,
              referral_code: true,
            },
          },
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('Email address is already in use by another account');
      }
      throw err;
    }

    const { password_hash, ...sanitized } = updatedUser;
    return sanitized;
  }
}
