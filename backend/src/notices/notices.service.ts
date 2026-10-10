import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  // Get active notice banners for user dashboard slider (ordered by serial_number asc)
  async getActiveNotice() {
    return this.prisma.notice.findMany({
      where: { is_active: true },
      orderBy: [{ serial_number: 'asc' }, { created_at: 'desc' }],
    });
  }

  // Admin: Get all notices
  async getAllNotices() {
    return this.prisma.notice.findMany({
      orderBy: [{ serial_number: 'asc' }, { created_at: 'desc' }],
    });
  }

  // Admin: Create notice image banner
  async createNotice(dto: CreateNoticeDto) {
    return this.prisma.notice.create({
      data: {
        title: dto.title?.trim() || 'Notice banner',
        content: dto.content?.trim() || '',
        image_url: dto.image_url?.trim() || null,
        link_url: dto.link_url?.trim() || null,
        serial_number: dto.serial_number !== undefined ? Number(dto.serial_number) : 0,
        is_active: dto.is_active ?? true,
      },
    });
  }

  // Admin: Update notice image banner
  async updateNotice(id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    return this.prisma.notice.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.content !== undefined && { content: dto.content.trim() }),
        ...(dto.image_url !== undefined && { image_url: dto.image_url.trim() }),
        ...(dto.link_url !== undefined && { link_url: dto.link_url.trim() }),
        ...(dto.serial_number !== undefined && { serial_number: Number(dto.serial_number) }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  // Admin: Batch update serial numbers
  async reorderNotices(items: { id: string; serial_number: number }[]) {
    for (const item of items) {
      await this.prisma.notice.update({
        where: { id: item.id },
        data: { serial_number: Number(item.serial_number) },
      });
    }
    return this.getAllNotices();
  }

  // Admin: Delete notice
  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    return this.prisma.notice.delete({ where: { id } });
  }
}
