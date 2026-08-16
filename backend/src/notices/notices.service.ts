import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  // Get active notice for user dashboard (returns null if no active notice)
  async getActiveNotice() {
    return this.prisma.notice.findFirst({
      where: { is_active: true },
      orderBy: { updated_at: 'desc' },
    });
  }

  // Admin: Get all notices
  async getAllNotices() {
    return this.prisma.notice.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // Admin: Create notice
  async createNotice(dto: CreateNoticeDto) {
    if (dto.is_active !== false) {
      // Deactivate older active notices if new one is active
      await this.prisma.notice.updateMany({
        where: { is_active: true },
        data: { is_active: false },
      });
    }

    return this.prisma.notice.create({
      data: {
        title: dto.title?.trim() || 'Notice board',
        content: dto.content.trim(),
        is_active: dto.is_active ?? true,
      },
    });
  }

  // Admin: Update notice
  async updateNotice(id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    if (dto.is_active === true) {
      // Deactivate other notices
      await this.prisma.notice.updateMany({
        where: { id: { not: id }, is_active: true },
        data: { is_active: false },
      });
    }

    return this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.content !== undefined && { content: dto.content.trim() }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  // Admin: Delete notice
  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    return this.prisma.notice.delete({ where: { id } });
  }
}
