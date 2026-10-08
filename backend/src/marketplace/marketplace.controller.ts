import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MarketplaceService } from './marketplace.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';

const uploadStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'marketplace');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  },
});

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  /**
   * Get marketplace feed (public / authenticated)
   */
  @Get('posts')
  async getPosts(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('user_id') currentUserId?: string,
  ) {
    return this.marketplaceService.getPosts(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      currentUserId,
    );
  }

  /**
   * Upload post image
   */
  @UseGuards(UserJwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return {
      success: true,
      url: `/uploads/marketplace/${file.filename}`,
    };
  }

  /**
   * Create new marketplace post
   */
  @UseGuards(UserJwtGuard)
  @Post('posts')
  async createPost(
    @Request() req: any,
    @Body() body: { content: string; image_url?: string },
  ) {
    return this.marketplaceService.createPost(req.user.id, body);
  }

  /**
   * Toggle like on post
   */
  @UseGuards(UserJwtGuard)
  @Post('posts/:id/like')
  async toggleLike(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.toggleLike(req.user.id, id);
  }

  /**
   * Add comment or nested reply
   */
  @UseGuards(UserJwtGuard)
  @Post('posts/:id/comments')
  async addComment(
    @Request() req: any,
    @Param('id') postId: string,
    @Body() body: { content: string; parent_id?: string },
  ) {
    return this.marketplaceService.addComment(req.user.id, postId, body);
  }

  /**
   * Delete post
   */
  @UseGuards(UserJwtGuard)
  @Delete('posts/:id')
  async deletePost(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.deletePost(req.user.id, id, req.user?.role === 'admin');
  }

  /**
   * Delete comment
   */
  @UseGuards(UserJwtGuard)
  @Delete('comments/:id')
  async deleteComment(@Request() req: any, @Param('id') id: string) {
    return this.marketplaceService.deleteComment(req.user.id, id, req.user?.role === 'admin');
  }
}
