import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateUniqueReferralCode(): Promise<string> {
    const totalUsers = await this.prisma.user.count();
    let nextNum = totalUsers + 1;
    let isUnique = false;
    let code = '';

    while (!isUnique) {
      const padded = String(nextNum).padStart(4, '0');
      code = `EX-${padded}`;
      const existing = await this.prisma.user.findUnique({
        where: { referral_code: code },
      });
      if (!existing) {
        isUnique = true;
      } else {
        nextNum++;
      }
    }
    return code;
  }

  async register(dto: UserRegisterDto) {
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone.trim() },
    });

    if (existingPhone) {
      throw new ConflictException('A user with this phone number already exists');
    }

    let referredById: string | null = null;

    if (dto.referral_code) {
      const referrer = await this.prisma.user.findUnique({
        where: { referral_code: dto.referral_code.trim().toUpperCase() },
      });

      if (!referrer) {
        throw new BadRequestException('Invalid referral code');
      }
      referredById = referrer.id;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newReferralCode = await this.generateUniqueReferralCode();

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone.trim(),
        password_hash: passwordHash,
        full_name: dto.full_name?.trim() || null,
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
    dto: { full_name?: string; current_password?: string; new_password?: string },
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
