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

  async login(dto: AdminLoginDto, ipAddress?: string, userAgent?: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { phone: dto.phone.trim() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password_hash);
    if (!isPasswordValid) {
      // Record failed login if admin exists
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
      throw new UnauthorizedException('Invalid phone number or password');
    }

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

