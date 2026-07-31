import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';
import { ActiveUserGuard } from '../user-auth/guards/active-user.guard';
import { AdminJwtGuard } from '../admin-auth/guards/admin-jwt.guard';

@Controller()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // USER: View active offers (Must be logged in & ACTIVE status)
  @UseGuards(UserJwtGuard, ActiveUserGuard)
  @Get('offers')
  async getActiveOffers() {
    return this.offersService.getActiveOffers();
  }

  // ADMIN: Manage offers
  @UseGuards(AdminJwtGuard)
  @Get('admin/offers')
  async getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @UseGuards(AdminJwtGuard)
  @Post('admin/offers')
  async createOffer(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('reward_amount') rewardAmount: number,
    @Body('banner_url') bannerUrl?: string,
  ) {
    return this.offersService.createOffer({
      title,
      description,
      reward_amount: rewardAmount,
      banner_url: bannerUrl,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Patch('admin/offers/:id')
  async updateOffer(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('description') description?: string,
    @Body('reward_amount') rewardAmount?: number,
    @Body('banner_url') bannerUrl?: string,
    @Body('is_active') isActive?: boolean,
  ) {
    return this.offersService.updateOffer(id, {
      title,
      description,
      reward_amount: rewardAmount,
      banner_url: bannerUrl,
      is_active: isActive,
    });
  }

  @UseGuards(AdminJwtGuard)
  @Delete('admin/offers/:id')
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.deleteOffer(id);
  }
}
