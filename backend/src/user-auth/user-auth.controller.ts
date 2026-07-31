import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserJwtGuard } from './guards/user-jwt.guard';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    return this.userAuthService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    return this.userAuthService.login(dto);
  }

  @UseGuards(UserJwtGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.userAuthService.getProfile(req.user.id);
  }
}
