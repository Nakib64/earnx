import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  // Public / User endpoint to get active notice
  @Get('active')
  async getActiveNotice() {
    return this.noticesService.getActiveNotice();
  }

  // Admin: Get all notices
  @UseGuards(AdminJwtGuard)
  @Get('admin')
  async getAllNotices() {
    return this.noticesService.getAllNotices();
  }

  // Admin: Create notice
  @UseGuards(AdminJwtGuard)
  @Post('admin')
  async createNotice(@Body() dto: CreateNoticeDto) {
    const data = await this.noticesService.createNotice(dto);
    return { success: true, message: 'Notice created successfully', data };
  }

  // Admin: Update notice
  @UseGuards(AdminJwtGuard)
  @Put('admin/:id')
  async updateNotice(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    const data = await this.noticesService.updateNotice(id, dto);
    return { success: true, message: 'Notice updated successfully', data };
  }

  // Admin: Delete notice
  @UseGuards(AdminJwtGuard)
  @Delete('admin/:id')
  async deleteNotice(@Param('id') id: string) {
    await this.noticesService.deleteNotice(id);
    return { success: true, message: 'Notice deleted successfully' };
  }
}
