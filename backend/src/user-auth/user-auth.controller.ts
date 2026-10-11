import { Controller, Post, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserAuthService } from './user-auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserJwtGuard } from './guards/user-jwt.guard';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Throttle({ default: { limit: 3, ttl: 60000, blockDuration: 120000 } })
  @Post('send-signup-otp')
  async sendSignupOtp(@Body() body: { target?: string; phone?: string; email?: string }) {
    const target = body.target || body.phone || body.email || '';
    return this.userAuthService.sendSignupOtp(target);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-signup-otp')
  async verifySignupOtp(
    @Body() body: { target?: string; phone?: string; email?: string; otp: string },
  ) {
    const target = body.target || body.phone || body.email || '';
    return this.userAuthService.verifySignupOtp(target, body.otp);
  }

  @Throttle({ default: { limit: 3, ttl: 60000, blockDuration: 120000 } })
  @Post('forgot-password/send-otp')
  async sendForgotPasswordOtp(
    @Body() body: { target?: string; phone?: string; email?: string },
  ) {
    const target = body.target || body.phone || body.email || '';
    return this.userAuthService.sendForgotPasswordOtp(target);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password/reset')
  async resetForgotPassword(
    @Body()
    body: {
      target?: string;
      phone?: string;
      email?: string;
      otp: string;
      new_password: string;
    },
  ) {
    const target = body.target || body.phone || body.email || '';
    return this.userAuthService.resetForgotPassword(target, body.otp, body.new_password);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: UserRegisterDto & { otp?: string }) {
    return this.userAuthService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000, blockDuration: 60000 } })
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
