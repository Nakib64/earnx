import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_USER_SECRET') || 'earnx_user_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: { sub: string; phone: string; role: string }) {
    if (payload.role !== 'user') {
      throw new UnauthorizedException('Invalid user authentication token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { designation: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Your account has been blocked by an admin');
    }

    return user;
  }
}
