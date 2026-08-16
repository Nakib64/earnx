import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UserJwtGuard } from '../user-auth/guards/user-jwt.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(UserJwtGuard)
  @Post('buy')
  async buyPackage(@Request() req: any, @Body() dto: CreatePurchaseDto) {
    return this.purchasesService.purchasePackage(req.user.id, dto);
  }
}
