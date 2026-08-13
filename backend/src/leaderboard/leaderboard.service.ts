import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getTop100() {
    return this.prisma.leaderboardEntry.findMany({
      where: { is_active: true },
      orderBy: { rank: 'asc' },
      take: 100,
    });
  }

  async getPaginated(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.LeaderboardEntryWhereInput = {
      is_active: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { badge: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.leaderboardEntry.count({ where }),
      this.prisma.leaderboardEntry.findMany({
        where,
        orderBy: { rank: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data,
      total,
      page,
      totalPages,
      hasMore,
    };
  }

  async getAllAdmin() {
    return this.prisma.leaderboardEntry.findMany({
      orderBy: { rank: 'asc' },
    });
  }

  async createEntry(data: {
    rank: number;
    name: string;
    phone?: string;
    invested_amount: number;
    profit_earned: number;
    photo_url?: string;
    badge?: string;
  }) {
    const existing = await this.prisma.leaderboardEntry.findUnique({
      where: { rank: data.rank },
    });
    if (existing) {
      throw new BadRequestException(`Rank #${data.rank} is already taken by ${existing.name}`);
    }

    return this.prisma.leaderboardEntry.create({
      data: {
        rank: data.rank,
        name: data.name,
        phone: data.phone || null,
        invested_amount: new Prisma.Decimal(data.invested_amount),
        profit_earned: new Prisma.Decimal(data.profit_earned),
        photo_url: data.photo_url || null,
        badge: data.badge || null,
      },
    });
  }

  async updateEntry(
    id: string,
    data: {
      rank?: number;
      name?: string;
      phone?: string;
      invested_amount?: number;
      profit_earned?: number;
      photo_url?: string;
      badge?: string;
      is_active?: boolean;
    },
  ) {
    const entry = await this.prisma.leaderboardEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Leaderboard entry not found');

    const updateData: any = {};
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.invested_amount !== undefined)
      updateData.invested_amount = new Prisma.Decimal(data.invested_amount);
    if (data.profit_earned !== undefined)
      updateData.profit_earned = new Prisma.Decimal(data.profit_earned);
    if (data.photo_url !== undefined) updateData.photo_url = data.photo_url;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    return this.prisma.leaderboardEntry.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteEntry(id: string) {
    return this.prisma.leaderboardEntry.delete({ where: { id } });
  }

  // Seed default 100 leaderboard entries if empty
  async seedInitialLeaderboard() {
    const count = await this.prisma.leaderboardEntry.count();
    if (count >= 100) {
      return { message: 'Leaderboard already has 100 or more entries', count };
    }

    const mockNames = [
      'Rahim Chowdhury', 'Karim Hasan', 'Shakib Al Hasan', 'Tanvir Ahmed', 'Nusrat Jahan',
      'Mahmudul Hasan', 'Sabrina Islam', 'Arafat Rahman', 'Fahim Morshed', 'Mehedi Hasan',
      'Farhana Yesmin', 'Naimur Rahman', 'Zubaer Hossain', 'Kamrul Ahsan', 'Imran Hossain',
      'Sadiya Akter', 'Tariqul Islam', 'Nazmul Huda', 'Ashraful Islam', 'Rabiul Awal'
    ];

    const badges = ['VIP Diamond', 'Top Investor', 'Gold Member', 'Master Investor', 'Star Trader'];

    const entries: Prisma.LeaderboardEntryCreateManyInput[] = [];
    for (let i = 1; i <= 100; i++) {
      const existingRank = await this.prisma.leaderboardEntry.findUnique({ where: { rank: i } });
      if (!existingRank) {
        const nameIndex = (i - 1) % mockNames.length;
        const name = `${mockNames[nameIndex]} ${i > 20 ? `#${i}` : ''}`.trim();
        const invested = Math.round(500000 / (i * 0.4) + 10000);
        const profit = Math.round(invested * (0.2 + (100 - i) * 0.005));

        entries.push({
          rank: i,
          name,
          phone: `017${Math.floor(10000000 + Math.random() * 9000000)}`,
          invested_amount: new Prisma.Decimal(invested),
          profit_earned: new Prisma.Decimal(profit),
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
          badge: i <= 3 ? badges[i - 1] : i <= 10 ? 'Top 10 Club' : 'Investor',
        });
      }
    }

    if (entries.length > 0) {
      await this.prisma.leaderboardEntry.createMany({
        data: entries,
        skipDuplicates: true,
      });
    }

    return { message: `Seeded ${entries.length} leaderboard entries successfully`, count: await this.prisma.leaderboardEntry.count() };
  }
}
