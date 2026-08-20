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

  async register(dto: UserRegisterDto) {
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone.trim() },
    });

    if (existingPhone) {
      throw new ConflictException('A user with this phone number already exists');
    }

    let referredById: string | null = null;

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const newReferralCode = await this.generateUniqueReferralCode();

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone.trim(),
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
