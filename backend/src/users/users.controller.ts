import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';
import { UserStatus } from '@prisma/client';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User Referral Tree View
  @UseGuards(UserJwtGuard)
  @Get('users/tree')
  async getMyTree(@Request() req: any, @Query('depth') depth?: string) {
    const maxDepth = depth ? parseInt(depth, 10) : 5;
    return this.usersService.getReferralTree(req.user.id, maxDepth);
  }

  // User / Admin Search by User Code, Phone, or Name (Debounced Auto-complete)
  @Get('users/search-by-code')
  async searchUsers(
    @Query('q') query?: string,
    @Query('code_only') codeOnly?: string,
  ) {
    return this.usersService.searchUsers(query || '', codeOnly === 'true');
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/users/search')
  async searchUsersAdmin(
    @Query('q') query?: string,
    @Query('code_only') codeOnly?: string,
  ) {
    return this.usersService.searchUsers(query || '', codeOnly === 'true');
  }

  // Admin User List & Management
  @UseGuards(AdminJwtGuard)
  @Get('admin/users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('has_designation') hasDesignation?: string,
    @Query('referred_by_id') referredById?: string,
  ) {
    return this.usersService.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      search,
      status,
      hasDesignation === 'true',
      referredById,
    );
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/users/:id/tree')
  async getUserTree(@Param('id') id: string, @Query('depth') depth?: string) {
    const maxDepth = depth ? parseInt(depth, 10) : 5;
    return this.usersService.getReferralTree(id, maxDepth);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.updateUserStatus(id, status);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/users/:id/premium')
  async updateUserPremium(@Param('id') id: string, @Body('is_premium') isPremium: boolean) {
    return this.usersService.updateUserPremium(id, isPremium);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/users/:id/designation')
  async assignDesignation(
    @Param('id') id: string,
    @Body('designation_id') designationId: string | null,
    @Body('referred_by_id') referredById?: string | null,
  ) {
    return this.usersService.assignDesignation(id, designationId, referredById);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // Admin Designation Management CRUD
  @UseGuards(AdminJwtGuard)
  @Get('admin/designations')
  async getDesignations() {
    return this.usersService.getDesignations();
  }

  @UseGuards(AdminJwtGuard)
  @Get('admin/designations/:id/users')
  async getUsersByDesignation(@Param('id') id: string) {
    return this.usersService.getUsersByDesignation(id);
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/designations')
  async createDesignation(
    @Body('name') name: string,
    @Body('stars') stars: number,
    @Body('max_level') max_level: number,
  ) {
    return this.usersService.createDesignation(name, stars, max_level);
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/designations/:id')
  async updateDesignation(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('stars') stars?: number,
    @Body('max_level') max_level?: number,
  ) {
    return this.usersService.updateDesignation(id, name, stars, max_level);
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/designations/:id')
  async deleteDesignation(@Param('id') id: string) {
    return this.usersService.deleteDesignation(id);
  }
}
