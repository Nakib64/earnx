import { Module } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { WalletsModule } from '../wallets/wallets.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [
    PrismaModule,
    SystemConfigModule,
    WalletsModule,
    UserAuthModule,
    AdminAuthModule,
  ],
  controllers: [CoinsController],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class CoinsModule {}
