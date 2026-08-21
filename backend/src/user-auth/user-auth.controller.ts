import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserJwtGuard } from './guards/user-jwt.guard';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('send-signup-otp')
  async sendSignupOtp(@Body() body: { phone: string }) {
    return this.userAuthService.sendSignupOtp(body.phone);
  }

  @Post('verify-signup-otp')
  async verifySignupOtp(@Body() body: { phone: string; otp: string }) {
    return this.userAuthService.verifySignupOtp(body.phone, body.otp);
  }

  @Post('register')
  async register(@Body() dto: UserRegisterDto & { otp?: string }) {
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

  @UseGuards(UserJwtGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body()
    dto: {
      full_name?: string;
      email?: string;
      country?: string;
      national_id?: string;
      avatar_url?: string;
      current_password?: string;
      new_password?: string;
    },
  ) {
    return this.userAuthService.updateProfile(req.user.id, dto);
  }
}
