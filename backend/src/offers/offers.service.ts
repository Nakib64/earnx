import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveOffers() {
    return this.prisma.offer.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getAllOffers() {
    return this.prisma.offer.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async createOffer(data: {
    title: string;
    description: string;
    reward_amount: number;
    banner_url?: string;
  }) {
    return this.prisma.offer.create({
      data: {
        title: data.title,
        description: data.description,
        reward_amount: new Prisma.Decimal(data.reward_amount),
        banner_url: data.banner_url || null,
      },
    });
  }

  async updateOffer(
    id: string,
    data: {
      title?: string;
      description?: string;
      reward_amount?: number;
      banner_url?: string;
      is_active?: boolean;
    },
  ) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');

    return this.prisma.offer.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.reward_amount !== undefined && {
          reward_amount: new Prisma.Decimal(data.reward_amount),
        }),
        ...(data.banner_url !== undefined && { banner_url: data.banner_url }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
    });
  }

  async deleteOffer(id: string) {
    return this.prisma.offer.delete({ where: { id } });
  }
}
