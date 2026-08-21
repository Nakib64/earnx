import { Controller, Post, Body, Get, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto, @Request() req: any) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || req.ip || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    return this.adminAuthService.login(dto, ip, userAgent);
  }

  @UseGuards(AdminJwtGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AdminJwtGuard)
  @Get('login-history')
  async getLoginHistory(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminAuthService.getLoginHistory(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 15,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() dto: { name?: string; phone?: string; current_password?: string; new_password?: string },
  ) {
    return this.adminAuthService.updateProfile(req.user.id, dto);
  }
}
