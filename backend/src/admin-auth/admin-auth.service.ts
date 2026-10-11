import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private failedAdminAttempts = new Map<string, { attempts: number; lockedUntil: number | null; lastAttempt: number }>();

  private getAdminLockoutStatus(phone: string): { isLocked: boolean; remainingMinutes: number } {
    const record = this.failedAdminAttempts.get(phone);
    if (!record || !record.lockedUntil) {
      return { isLocked: false, remainingMinutes: 0 };
    }
    const now = Date.now();
    if (now < record.lockedUntil) {
      const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { isLocked: true, remainingMinutes };
    }
    this.failedAdminAttempts.delete(phone);
    return { isLocked: false, remainingMinutes: 0 };
  }

  private recordFailedAdminAttempt(phone: string): { remainingAttempts: number; isLocked: boolean; lockMinutes: number } {
    const record = this.failedAdminAttempts.get(phone) || { attempts: 0, lockedUntil: null, lastAttempt: Date.now() };
    const maxAttempts = 5;
    const lockMinutes = 15;
    const newAttempts = record.attempts + 1;

    if (newAttempts >= maxAttempts) {
      this.failedAdminAttempts.set(phone, {
        attempts: newAttempts,
        lockedUntil: Date.now() + lockMinutes * 60 * 1000,
        lastAttempt: Date.now(),
      });
      return { remainingAttempts: 0, isLocked: true, lockMinutes };
    }

    this.failedAdminAttempts.set(phone, {
      attempts: newAttempts,
      lockedUntil: null,
      lastAttempt: Date.now(),
    });

    return { remainingAttempts: maxAttempts - newAttempts, isLocked: false, lockMinutes: 0 };
  }

  private clearFailedAdminAttempts(phone: string) {
    this.failedAdminAttempts.delete(phone);
  }

  async login(dto: AdminLoginDto, ipAddress?: string, userAgent?: string) {
    const cleanPhone = dto.phone.trim();

    // 1. Check lockout status
    const { isLocked, remainingMinutes } = this.getAdminLockoutStatus(cleanPhone);
    if (isLocked) {
      throw new UnauthorizedException(
        `Too many failed admin login attempts. Account access is temporarily locked for security. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    const admin = await this.prisma.admin.findUnique({
      where: { phone: cleanPhone },
    });

    if (!admin) {
      const { remainingAttempts, isLocked: newlyLocked, lockMinutes } = this.recordFailedAdminAttempt(cleanPhone);
      if (newlyLocked) {
        throw new UnauthorizedException(
          `Too many failed login attempts. Admin access is locked for ${lockMinutes} minutes.`,
        );
      }
      throw new UnauthorizedException(
        `Invalid phone number or password. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password_hash);
    if (!isPasswordValid) {
      // Record failed login in history
      try {
        await (this.prisma as any).adminLoginHistory.create({
          data: {
            admin_id: admin.id,
            ip_address: ipAddress || 'Unknown',
            user_agent: userAgent || 'Unknown',
            status: 'FAILED',
          },
        });
      } catch {}

      const { remainingAttempts, isLocked: newlyLocked, lockMinutes } = this.recordFailedAdminAttempt(cleanPhone);
      if (newlyLocked) {
        throw new UnauthorizedException(
          `Too many failed login attempts. Admin access is locked for ${lockMinutes} minutes.`,
        );
      }
      throw new UnauthorizedException(
        `Invalid phone number or password. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
      );
    }

    // Success -> clear failed attempts
    this.clearFailedAdminAttempts(cleanPhone);

    // Record successful login history
    try {
      await (this.prisma as any).adminLoginHistory.create({
        data: {
          admin_id: admin.id,
          ip_address: ipAddress || 'Unknown',
          user_agent: userAgent || 'Unknown',
          status: 'SUCCESS',
        },
      });
    } catch (e) {
      // Non-blocking log
    }

    const payload = { sub: admin.id, phone: admin.phone, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        phone: admin.phone,
        name: admin.name,
      },
    };
  }

  async getLoginHistory(adminId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      (this.prisma as any).adminLoginHistory.findMany({
        where: { admin_id: adminId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      (this.prisma as any).adminLoginHistory.count({
        where: { admin_id: adminId },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateProfile(
    adminId: string,
    dto: { name?: string; phone?: string; current_password?: string; new_password?: string },
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim() || 'Admin';
    }

    if (dto.phone !== undefined) {
      const cleanPhone = dto.phone.trim();
      if (!cleanPhone) {
        throw new BadRequestException('Phone number cannot be empty');
      }
      const existingPhone = await this.prisma.admin.findUnique({
        where: { phone: cleanPhone },
      });
      if (existingPhone && existingPhone.id !== adminId) {
        throw new BadRequestException('This phone number is already registered to another admin account');
      }
      updateData.phone = cleanPhone;
    }

    if (dto.new_password) {
      if (!dto.current_password) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const isPasswordValid = await bcrypt.compare(dto.current_password, admin.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
      if (dto.new_password.length < 6) {
        throw new BadRequestException('New password must be at least 6 characters');
      }
      updateData.password_hash = await bcrypt.hash(dto.new_password, 10);
    }

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    return {
      id: updatedAdmin.id,
      phone: updatedAdmin.phone,
      name: updatedAdmin.name,
    };
  }
}

