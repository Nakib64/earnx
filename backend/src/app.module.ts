import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { CommissionsModule } from './commissions/commissions.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AdminAuthModule,
    UserAuthModule,
    UsersModule,
    WalletsModule,
    CommissionsModule,
    ApprovalsModule,
    OffersModule,
  ],
})
export class AppModule {}
