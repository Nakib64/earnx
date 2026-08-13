import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @UseGuards(AdminJwtGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AdminJwtGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() dto: { name?: string; current_password?: string; new_password?: string },
  ) {
    return this.adminAuthService.updateProfile(req.user.id, dto);
  }
}
