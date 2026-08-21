import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LeaderboardService } from './leaderboard.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  // Public/User Leaderboard endpoint with pagination & infinite scroll support
  @Get()
  async getLeaderboard(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    if (page || limit || search) {
      return this.leaderboardService.getPaginated(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        search,
      );
    }
    return this.leaderboardService.getTop100();
  }

  // Admin Endpoints
  @UseGuards(AdminJwtGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.leaderboardService.getAllAdmin();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/create')
  async createEntry(@Body() body: any) {
    return this.leaderboardService.createEntry({
      rank: Number(body.rank),
      name: body.name,
      phone: body.phone,
      invested_amount: Number(body.invested_amount),
      profit_earned: Number(body.profit_earned),
      photo_url: body.photo_url,
      badge: body.badge,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Put('admin/:id')
  @Patch('admin/:id')
  async updateEntry(@Param('id') id: string, @Body() body: any) {
    return this.leaderboardService.updateEntry(id, {
      rank: body.rank !== undefined ? Number(body.rank) : undefined,
      name: body.name,
      phone: body.phone,
      invested_amount: body.invested_amount !== undefined ? Number(body.invested_amount) : undefined,
      profit_earned: body.profit_earned !== undefined ? Number(body.profit_earned) : undefined,
      photo_url: body.photo_url,
      badge: body.badge,
      is_active: body.is_active,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/:id')
  async deleteEntry(@Param('id') id: string) {
    return this.leaderboardService.deleteEntry(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/reorder')
  async reorderEntries(@Body() body: { orders: { id: string; rank: number }[] }) {
    return this.leaderboardService.reorderEntries(body.orders);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/seed')
  async seedLeaderboard() {
    return this.leaderboardService.seedInitialLeaderboard();
  }

  // File Upload for Leaderboard Photos
  @UseGuards(AdminJwtGuard)
  @Post('admin/upload-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/leaderboard',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `photo-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = `/uploads/leaderboard/${file.filename}`;
    return { url: fileUrl };
  }
}
