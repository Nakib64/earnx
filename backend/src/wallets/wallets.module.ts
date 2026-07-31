import { Global, Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletsController } from './wallets.controller';

@Global()
@Module({
  controllers: [WalletsController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
