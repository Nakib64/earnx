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
        where: {
          referred_by_id: { in: currentParentIds },
          is_premium: true,
        },
        select: {
          id: true,
          phone: true,
          full_name: true,
          referral_code: true,
          status: true,
          is_premium: true,
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

  async searchUsers(query: string) {
    if (!query || query.trim().length < 1) return [];
    const q = query.trim();

    return this.prisma.user.findMany({
      where: {
        OR: [
          { referral_code: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { full_name: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        referral_code: true,
        status: true,
        is_premium: true,
        designation: {
          select: { name: true, stars: true },
        },
      },
      take: 10,
    });
  }

  // Admin User Management
  async getAllUsers(
    page = 1,
    limit = 50,
    search?: string,
    status?: UserStatus,
    hasDesignation?: boolean,
    referredById?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;

    if (referredById) {
      const parentUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: referredById }, { referral_code: referredById }],
        },
        select: { id: true },
      });

      const parentId = parentUser ? parentUser.id : referredById;

      where.is_premium = true;
      where.referred_by_id = parentId;
    } else if (hasDesignation) {
      where.designation_id = { not: null };
    }

    if (search) {
      const searchFilter = [
        { phone: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { referral_code: { contains: search, mode: 'insensitive' } },
      ];
      if (where.AND) {
        where.AND.push({ OR: searchFilter });
      } else if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchFilter }];
        delete where.OR;
      } else {
        where.OR = searchFilter;
      }
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
          is_premium: true,
          designation_id: true,
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

    let userCode = user.referral_code;
    if (status === UserStatus.ACTIVE && (!userCode || !userCode.startsWith('EX'))) {
      const existingUsers = await this.prisma.user.findMany({
        where: { referral_code: { startsWith: 'EX' } },
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
      userCode = `EX${String(nextNum).padStart(4, '0')}`;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status,
        ...(userCode ? { referral_code: userCode } : {}),
      },
    });
  }

  async updateUserPremium(userId: string, isPremium: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (isPremium) {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(now.getDate() + 365);

      return this.prisma.user.update({
        where: { id: userId },
        data: {
          is_premium: true,
          premium_started_at: now,
          premium_expires_at: expiresAt,
        },
      });
    } else {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          is_premium: false,
          premium_started_at: null,
          premium_expires_at: null,
        },
      });
    }
  }

  async assignDesignation(
    userId: string,
    designationId: string | null,
    referredById?: string | null,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        designation: true,
        referred_by: {
          include: { designation: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    let targetDesignation: any = null;
    if (designationId) {
      targetDesignation = await this.prisma.designation.findUnique({
        where: { id: designationId },
      });
      if (!targetDesignation) throw new BadRequestException('Invalid designation ID');
    }

    // Determine target sponsor ID
    const newSponsorId = referredById !== undefined ? referredById : user.referred_by_id;

    if (targetDesignation && newSponsorId) {
      if (newSponsorId === userId) {
        throw new BadRequestException('A user cannot be their own sponsor');
      }

      const sponsor = await this.prisma.user.findUnique({
        where: { id: newSponsorId },
        include: { designation: true },
      });

      if (!sponsor) {
        throw new BadRequestException('Invalid sponsor ID');
      }

      if (!sponsor.designation || sponsor.designation.stars <= targetDesignation.stars) {
        throw new BadRequestException(
          `Hierarchy violation: A member with '${targetDesignation.name}' (${targetDesignation.stars} Stars) must be under a sponsor with a strictly higher designation (greater than ${targetDesignation.stars} Stars). Please select a higher-badged sponsor or set as Top of Tree.`,
        );
      }
    }

    const dataToUpdate: any = { designation_id: designationId };
    if (referredById !== undefined) {
      dataToUpdate.referred_by_id = referredById;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      include: {
        designation: true,
        referred_by: {
          include: { designation: true },
        },
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  // Admin Designation CRUD
  async getDesignations() {
    return this.prisma.designation.findMany({
      include: {
        users: {
          select: {
            id: true,
            phone: true,
            full_name: true,
            referral_code: true,
            status: true,
          },
        },
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
    // First, unbind all users assigned to this designation (set designation_id = null)
    await this.prisma.user.updateMany({
      where: { designation_id: id },
      data: { designation_id: null },
    });

    // Then delete the designation record
    return this.prisma.designation.delete({
      where: { id },
    });
  }
}
