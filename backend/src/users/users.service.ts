import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns downlines grouped dynamically by relative level depth (Level 1, Level 2, Level 3...).
   */
  async getReferralTree(userId: string, maxDepth = 5) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, full_name: true, referral_code: true },
    });

    if (!user) throw new NotFoundException('User not found');

    const treeByLevel: Record<number, any[]> = {};
    let currentParentIds = [userId];

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (currentParentIds.length === 0) break;

      const downlines = await this.prisma.user.findMany({
        where: { referred_by_id: { in: currentParentIds } },
        select: {
          id: true,
          phone: true,
          full_name: true,
          referral_code: true,
          status: true,
          created_at: true,
          referred_by_id: true,
          designation: {
            select: { id: true, name: true, stars: true, max_level: true },
          },
        },
      });

      if (downlines.length > 0) {
        treeByLevel[depth] = downlines;
        currentParentIds = downlines.map((d) => d.id);
      } else {
        break;
      }
    }

    return {
      user,
      tree: treeByLevel,
      summary: Object.keys(treeByLevel).reduce((acc, level) => {
        acc[`level_${level}`] = treeByLevel[Number(level)].length;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Admin User Management
  async getAllUsers(page = 1, limit = 50, search?: string, status?: UserStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { referral_code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          full_name: true,
          referral_code: true,
          status: true,
          wallet_balance: true,
          created_at: true,
          designation: true,
          referred_by: {
            select: { id: true, phone: true, full_name: true },
          },
          _count: {
            select: { referrals: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async assignDesignation(userId: string, designationId: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (designationId) {
      const designation = await this.prisma.designation.findUnique({
        where: { id: designationId },
      });
      if (!designation) throw new BadRequestException('Invalid designation ID');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { designation_id: designationId },
      include: { designation: true },
    });
  }

  // Admin Designation CRUD
  async getDesignations() {
    return this.prisma.designation.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { max_level: 'asc' },
    });
  }

  async getUsersByDesignation(designationId: string) {
    return this.prisma.user.findMany({
      where: { designation_id: designationId },
      select: {
        id: true,
        phone: true,
        full_name: true,
        referral_code: true,
        status: true,
        created_at: true,
      },
    });
  }

  async createDesignation(name: string, stars: number, max_level: number) {
    return this.prisma.designation.create({
      data: {
        name,
        stars: stars || 1,
        max_level: max_level || 1,
      },
    });
  }

  async updateDesignation(id: string, name?: string, stars?: number, max_level?: number) {
    return this.prisma.designation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(stars !== undefined && { stars }),
        ...(max_level !== undefined && { max_level }),
      },
    });
  }

  async deleteDesignation(id: string) {
    return this.prisma.designation.delete({
      where: { id },
    });
  }
}
