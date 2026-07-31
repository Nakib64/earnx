import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller()
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get('system-config/public')
  async getPublicConfig() {
    return this.configService.getAll();
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/system-config')
  async getAdminConfig() {
    return this.configService.getAll();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/system-config')
  async updateConfig(@Body() body: { key: string; value: string }) {
    return this.configService.setValue(body.key, String(body.value));
  }
}
