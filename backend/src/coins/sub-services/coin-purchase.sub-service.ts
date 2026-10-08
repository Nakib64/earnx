import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { WalletService } from '../../wallets/wallet.service';
import { TransactionType, CoinTransactionType, Prisma } from '@prisma/client';

@Injectable()
export class CoinPurchaseSubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
    private readonly walletService: WalletService,
  ) {}

  async buyCoins(userId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount of coins must be greater than zero');
    }

    const configs = await this.configService.getAll();
    const coinPrice = parseFloat(configs.COIN_PRICE || '10');
    const totalCost = amount * coinPrice;

    return this.prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user) throw new NotFoundException('User not found');

        if (Number(user.wallet_balance) < totalCost) {
          throw new BadRequestException(
            `Insufficient wallet balance. Total cost is ৳${totalCost.toFixed(
              2,
            )}, but your balance is ৳${Number(user.wallet_balance).toFixed(2)}.`,
          );
        }

        const walletBefore = Number(user.wallet_balance);
        const walletAfter = walletBefore - totalCost;

        const coinsBefore = Number(user.coin_balance);
        const coinsAfter = coinsBefore + amount;

        // 1. Deduct from User Wallet
        await tx.user.update({
          where: { id: userId },
          data: {
            wallet_balance: new Prisma.Decimal(walletAfter),
            coin_balance: new Prisma.Decimal(coinsAfter),
          },
        });

        // 2. Record Wallet Transaction
        await tx.walletTransaction.create({
          data: {
            user_id: userId,
            type: TransactionType.COIN_PURCHASE,
            amount: new Prisma.Decimal(totalCost),
            balance_before: new Prisma.Decimal(walletBefore),
            balance_after: new Prisma.Decimal(walletAfter),
            description: `Purchased ${amount} coins at ৳${coinPrice.toFixed(2)}/coin`,
          },
        });

        // 3. Record Coin Transaction
        await tx.coinTransaction.create({
          data: {
            user_id: userId,
            type: CoinTransactionType.PURCHASE,
            amount: new Prisma.Decimal(amount),
            coins_before: new Prisma.Decimal(coinsBefore),
            coins_after: new Prisma.Decimal(coinsAfter),
            cost_bdt: new Prisma.Decimal(totalCost),
            description: `Purchased ${amount} coins for ৳${totalCost.toFixed(2)}`,
          },
        });

        return {
          amount,
          cost: totalCost,
          coin_price: coinPrice,
          new_wallet_balance: walletAfter,
          new_coin_balance: coinsAfter,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }
}
