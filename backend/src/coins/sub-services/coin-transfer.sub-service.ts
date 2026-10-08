import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoinTransactionType, Prisma } from '@prisma/client';

@Injectable()
export class CoinTransferSubService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoinTransfer(
    userId: string,
    dto: {
      receiver_code: string;
      coin_amount: number;
      coin_rate: number;
      note?: string;
    },
  ) {
    const rawTarget = (dto.receiver_code || '').trim();
    if (!rawTarget) {
      throw new BadRequestException('Recipient identifier (phone, email, or referral code) is required');
    }

    const numCoins = Number(dto.coin_amount);
    const numRate = Number(dto.coin_rate);

    if (isNaN(numCoins) || numCoins <= 0) {
      throw new BadRequestException('Coin amount must be a positive number');
    }

    if (isNaN(numRate) || numRate <= 0) {
      throw new BadRequestException('Coin exchange rate must be a positive number');
    }

    const totalBDT = numCoins * numRate;

    return this.prisma.$transaction(
      async (tx) => {
        const sender = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!sender) throw new NotFoundException('Sender not found');

        if (Number(sender.coin_balance) < numCoins) {
          throw new BadRequestException(
            `Insufficient available coin balance. You have ${Number(sender.coin_balance)} coins available.`,
          );
        }

        const receiver = await tx.user.findFirst({
          where: {
            OR: [
              { referral_code: rawTarget },
              { phone: rawTarget },
              { email: rawTarget },
            ],
          },
        });

        if (!receiver) {
          throw new NotFoundException(`Recipient account "${rawTarget}" not found`);
        }

        if (receiver.id === userId) {
          throw new BadRequestException('You cannot transfer coins to your own account');
        }

        const coinsBefore = Number(sender.coin_balance);
        const coinsAfter = coinsBefore - numCoins;

        // 1. Deduct coins from sender immediately (Escrow Hold)
        await tx.user.update({
          where: { id: userId },
          data: {
            coin_balance: new Prisma.Decimal(coinsAfter),
          },
        });

        // 2. Record CoinTransaction for sender
        await tx.coinTransaction.create({
          data: {
            user_id: userId,
            type: CoinTransactionType.COIN_TRANSFER_SENT,
            amount: new Prisma.Decimal(numCoins),
            coins_before: new Prisma.Decimal(coinsBefore),
            coins_after: new Prisma.Decimal(coinsAfter),
            cost_bdt: new Prisma.Decimal(totalBDT),
            description: `Sent ${numCoins} coins to ${receiver.full_name || receiver.referral_code} at ৳${numRate.toFixed(2)}/coin (Pending acceptance)`,
          },
        });

        // 3. Create CoinTransfer record in PENDING state
        const transfer = await tx.coinTransfer.create({
          data: {
            sender_id: userId,
            receiver_id: receiver.id,
            coin_amount: new Prisma.Decimal(numCoins),
            coin_rate: new Prisma.Decimal(numRate),
            total_bdt_value: new Prisma.Decimal(totalBDT),
            note: dto.note?.trim() || null,
            status: 'PENDING',
          },
          include: {
            sender: {
              select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
                referral_code: true,
              },
            },
            receiver: {
              select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
                referral_code: true,
              },
            },
          },
        });

        return {
          success: true,
          message: `Transfer of ${numCoins} coins to ${receiver.full_name || receiver.referral_code} initiated! Coins are locked in escrow awaiting receiver acceptance.`,
          transfer,
          new_coin_balance: coinsAfter,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  async getPendingIncomingTransfers(userId: string) {
    return this.prisma.coinTransfer.findMany({
      where: {
        receiver_id: userId,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            referral_code: true,
          },
        },
      },
    });
  }

  async getMyCoinTransfers(userId: string) {
    return this.prisma.coinTransfer.findMany({
      where: {
        OR: [{ sender_id: userId }, { receiver_id: userId }],
      },
      orderBy: { created_at: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            referral_code: true,
          },
        },
        receiver: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            referral_code: true,
          },
        },
      },
    });
  }

  async approveCoinTransfer(transferId: string, receiverId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const transfer = await tx.coinTransfer.findUnique({
          where: { id: transferId },
          include: { sender: true, receiver: true },
        });

        if (!transfer) throw new NotFoundException('Coin transfer request not found');

        if (transfer.receiver_id !== receiverId) {
          throw new BadRequestException('You are not authorized to approve this transfer');
        }

        if (transfer.status !== 'PENDING') {
          throw new BadRequestException('This transfer has already been processed');
        }

        const numCoins = Number(transfer.coin_amount);
        const recipientCoinsBefore = Number(transfer.receiver.coin_balance);
        const recipientCoinsAfter = recipientCoinsBefore + numCoins;

        // 1. Credit recipient coins
        await tx.user.update({
          where: { id: receiverId },
          data: { coin_balance: new Prisma.Decimal(recipientCoinsAfter) },
        });

        // 2. Record CoinTransaction for recipient
        await tx.coinTransaction.create({
          data: {
            user_id: receiverId,
            type: CoinTransactionType.COIN_TRANSFER_RECEIVED,
            amount: new Prisma.Decimal(numCoins),
            coins_before: new Prisma.Decimal(recipientCoinsBefore),
            coins_after: new Prisma.Decimal(recipientCoinsAfter),
            cost_bdt: transfer.total_bdt_value,
            description: `Received ${numCoins} coins from ${transfer.sender.full_name || transfer.sender.referral_code} at ৳${Number(transfer.coin_rate).toFixed(2)}/coin`,
          },
        });

        // 3. Mark transfer APPROVED
        const updated = await tx.coinTransfer.update({
          where: { id: transferId },
          data: {
            status: 'APPROVED',
            responded_at: new Date(),
          },
          include: { sender: true, receiver: true },
        });

        return {
          success: true,
          message: `Successfully accepted transfer of ${numCoins} coins!`,
          transfer: updated,
          new_coin_balance: recipientCoinsAfter,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  async rejectCoinTransfer(transferId: string, receiverId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const transfer = await tx.coinTransfer.findUnique({
          where: { id: transferId },
          include: { sender: true, receiver: true },
        });

        if (!transfer) throw new NotFoundException('Coin transfer request not found');

        if (transfer.receiver_id !== receiverId) {
          throw new BadRequestException('You are not authorized to reject this transfer');
        }

        if (transfer.status !== 'PENDING') {
          throw new BadRequestException('This transfer has already been processed');
        }

        const numCoins = Number(transfer.coin_amount);
        const senderCoinsBefore = Number(transfer.sender.coin_balance);
        const senderCoinsAfter = senderCoinsBefore + numCoins;

        // 1. Refund coins to sender
        await tx.user.update({
          where: { id: transfer.sender_id },
          data: { coin_balance: new Prisma.Decimal(senderCoinsAfter) },
        });

        // 2. Record CoinTransaction refund for sender
        await tx.coinTransaction.create({
          data: {
            user_id: transfer.sender_id,
            type: CoinTransactionType.COIN_TRANSFER_RECEIVED,
            amount: new Prisma.Decimal(numCoins),
            coins_before: new Prisma.Decimal(senderCoinsBefore),
            coins_after: new Prisma.Decimal(senderCoinsAfter),
            description: `Refund of rejected coin transfer (${numCoins} coins from ${transfer.receiver.referral_code})`,
          },
        });

        // 3. Mark transfer REJECTED
        const updated = await tx.coinTransfer.update({
          where: { id: transferId },
          data: {
            status: 'REJECTED',
            responded_at: new Date(),
          },
          include: { sender: true, receiver: true },
        });

        return {
          success: true,
          message: 'Coin transfer rejected and coins refunded to sender.',
          transfer: updated,
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }
}
