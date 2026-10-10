import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  // Public / User endpoint to get active notices for dashboard slider
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

  // Admin: Upload Notice Image
  @UseGuards(AdminJwtGuard)
  @Post('admin/upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'notices');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `notice-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }
    const fileUrl = `/uploads/notices/${file.filename}`;
    return { url: fileUrl };
  }

  // Admin: Reorder notices
  @UseGuards(AdminJwtGuard)
  @Patch('admin/reorder')
  async reorderNotices(@Body() body: { items: { id: string; serial_number: number }[] }) {
    if (!body || !Array.isArray(body.items)) {
      throw new BadRequestException('Invalid items array for reordering');
    }
    const data = await this.noticesService.reorderNotices(body.items);
    return { success: true, message: 'Notices reordered successfully', data };
  }

  // Admin: Create notice image banner
  @UseGuards(AdminJwtGuard)
  @Post('admin')
  async createNotice(@Body() dto: CreateNoticeDto) {
    const data = await this.noticesService.createNotice(dto);
    return { success: true, message: 'Notice created successfully', data };
  }

  // Admin: Update notice image banner
  @UseGuards(AdminJwtGuard)
  @Put('admin/:id')
  @Patch('admin/:id')
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
