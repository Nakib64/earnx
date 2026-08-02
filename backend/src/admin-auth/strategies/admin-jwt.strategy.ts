import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ADMIN_SECRET') || 'earnx_admin_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: { sub: string; phone: string; role: string }) {
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Invalid admin authentication token');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, phone: true, name: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account no longer exists');
    }

    return { ...admin, role: 'admin' };
  }
}
