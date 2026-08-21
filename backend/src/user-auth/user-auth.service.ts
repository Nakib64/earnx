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

    let maxNum = 0;
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
   * Dispatches 6-digit signup OTP via SMS
   */
  async sendSignupOtp(phone: string) {
    const cleanPhone = phone?.trim();
    if (!cleanPhone) {
      throw new BadRequestException('Phone number is required');
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingPhone) {
      throw new ConflictException('A user with this phone number already exists');
    }

    return this.otpService.generateAndSendOtp(cleanPhone, 'SIGNUP');
  }

  /**
   * Verifies 6-digit signup OTP
   */
  async verifySignupOtp(phone: string, otp: string) {
    return this.otpService.verifyOtp(phone, otp, 'SIGNUP');
  }

  /**
   * Dispatches 6-digit forgot password OTP via SMS
   */
  async sendForgotPasswordOtp(phone: string) {
    const cleanPhone = phone?.trim();
    if (!cleanPhone) {
      throw new BadRequestException('Phone number is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      throw new BadRequestException('No registered account found with this phone number');
    }

    return this.otpService.generateAndSendOtp(cleanPhone, 'FORGOT_PASSWORD');
  }

  /**
   * Verifies OTP and resets user password
   */
  async resetForgotPassword(phone: string, otp: string, newPassword: string) {
    const cleanPhone = phone?.trim();
    if (!cleanPhone) {
      throw new BadRequestException('Phone number is required');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    // 1. Verify OTP with brute force prevention
    await this.otpService.verifyOtp(cleanPhone, otp, 'FORGOT_PASSWORD');

    // 2. Find and update user password
    const user = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

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
      where: { phone: cleanPhone, purpose: 'FORGOT_PASSWORD' },
      data: { is_verified: false, otp: 'EXPIRED' },
    });

    return {
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    };
  }

  async register(dto: UserRegisterDto & { otp?: string }) {
    const cleanPhone = dto.phone.trim();
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingPhone) {
      throw new ConflictException('A user with this phone number already exists');
    }

    // Verify OTP if provided with registration, or check recent verification status
    if (dto.otp) {
      await this.otpService.verifyOtp(cleanPhone, dto.otp, 'SIGNUP');
    } else {
      const isVerified = await this.otpService.isPhoneVerified(cleanPhone, 'SIGNUP');
      if (!isVerified) {
        throw new BadRequestException(
          'Phone number verification required. Please enter the 6-digit OTP sent to your phone.',
        );
      }
    }

    let referredById: string | null = null;

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newReferralCode = await this.generateUniqueReferralCode();

    const user = await this.prisma.user.create({
      data: {
        phone: cleanPhone,
        password_hash: passwordHash,
        full_name: dto.full_name?.trim() || null,
        email: dto.email?.trim() || null,
        country: dto.country?.trim() || 'Bangladesh',
        national_id: dto.national_id?.trim() || null,
        avatar_url: dto.avatar_url?.trim() || null,
        referral_code: newReferralCode,
        referred_by_id: referredById,
        status: UserStatus.DISABLED, // Default DISABLED
      },
    });

    const payload = { sub: user.id, phone: user.phone, role: 'user' };
    const accessToken = this.jwtService.sign(payload);
    const { password_hash, ...sanitizedUser } = user;

    return {
      accessToken,
      user: sanitizedUser,
    };
  }

  async login(dto: UserLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone.trim() },
      include: {
        designation: true,
        referred_by: {
          select: {
            id: true,
            phone: true,
            full_name: true,
            referral_code: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account has been blocked by an admin');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const payload = { sub: user.id, phone: user.phone, role: 'user' };
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
        referred_by: {
          select: {
            id: true,
            phone: true,
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
      updateData.email = dto.email.trim() || null;
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

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        designation: true,
        referred_by: {
          select: {
            id: true,
            phone: true,
            full_name: true,
            referral_code: true,
          },
        },
      },
    });

    const { password_hash, ...sanitized } = updatedUser;
    return sanitized;
  }
}
