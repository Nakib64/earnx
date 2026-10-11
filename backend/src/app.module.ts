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
import { SystemConfigModule } from './system-config/system-config.module';
import { PremiumModule } from './premium/premium.module';
import { InvestmentsModule } from './investments/investments.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { CoinsModule } from './coins/coins.module';
import { NoticesModule } from './notices/notices.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SmsModule } from './sms/sms.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { DepositsModule } from './deposits/deposits.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { AdsModule } from './ads/ads.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100, // 100 requests per minute general limit per IP
      },
    ]),
    PrismaModule,
    SmsModule,
    EmailModule,
    OtpModule,
    WithdrawalsModule,
    DepositsModule,
    MarketplaceModule,
    EcommerceModule,
    AdminAuthModule,
    UserAuthModule,
    UsersModule,
    WalletsModule,
    CommissionsModule,
    ApprovalsModule,
    OffersModule,
    SystemConfigModule,
    PremiumModule,
    InvestmentsModule,
    LeaderboardModule,
    CoinsModule,
    NoticesModule,
    PurchasesModule,
    AdsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

