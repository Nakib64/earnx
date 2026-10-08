import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemConfigService } from '../../system-config/system-config.service';
import { RequestStatus, Prisma } from '@prisma/client';

export interface DepositGatewayConfig {
  bkash_number: string;
  bkash_type: string;
  nagad_number: string;
  nagad_type: string;
  rocket_number: string;
  rocket_type: string;
  deposit_instruction?: string;
}

@Injectable()
export class DepositGatewaySubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: SystemConfigService,
  ) {}

  /**
   * Retrieves active payment gateway numbers configured by Admin
   */
  async getDepositGateways(): Promise<DepositGatewayConfig> {
    const [
      bkashNum,
      bkashType,
      nagadNum,
      nagadType,
      rocketNum,
      rocketType,
      instruction,
    ] = await Promise.all([
      this.configService.getValue('BKASH_NUMBER', '01700000000'),
      this.configService.getValue('BKASH_TYPE', 'Personal (Send Money)'),
      this.configService.getValue('NAGAD_NUMBER', '01800000000'),
      this.configService.getValue('NAGAD_TYPE', 'Personal (Send Money)'),
      this.configService.getValue('ROCKET_NUMBER', '01900000000'),
      this.configService.getValue('ROCKET_TYPE', 'Personal (Send Money)'),
      this.configService.getValue(
        'DEPOSIT_INSTRUCTION',
        'Send money to the designated number and paste the Transaction ID (TrxID) below.',
      ),
    ]);

    return {
      bkash_number: bkashNum,
      bkash_type: bkashType,
      nagad_number: nagadNum,
      nagad_type: nagadType,
      rocket_number: rocketNum,
      rocket_type: rocketType,
      deposit_instruction: instruction,
    };
  }

  /**
   * Admin: Update payment gateway numbers
   */
  async updateDepositGateways(data: Partial<DepositGatewayConfig>) {
    if (data.bkash_number !== undefined)
      await this.configService.setValue('BKASH_NUMBER', data.bkash_number.trim());
    if (data.bkash_type !== undefined)
      await this.configService.setValue('BKASH_TYPE', data.bkash_type.trim());
    if (data.nagad_number !== undefined)
      await this.configService.setValue('NAGAD_NUMBER', data.nagad_number.trim());
    if (data.nagad_type !== undefined)
      await this.configService.setValue('NAGAD_TYPE', data.nagad_type.trim());
    if (data.rocket_number !== undefined)
      await this.configService.setValue('ROCKET_NUMBER', data.rocket_number.trim());
    if (data.rocket_type !== undefined)
      await this.configService.setValue('ROCKET_TYPE', data.rocket_type.trim());
    if (data.deposit_instruction !== undefined)
      await this.configService.setValue('DEPOSIT_INSTRUCTION', data.deposit_instruction.trim());

    return this.getDepositGateways();
  }

  /**
   * User: Submits a deposit request with TrxID
   */
  async submitDeposit(
    userId: string,
    data: {
      method: string;
      sender_number: string;
      amount: number;
      trx_id: string;
    },
  ) {
    const numAmount = Number(data.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero');
    }

    const cleanTrx = data.trx_id?.trim().toUpperCase();
    if (!cleanTrx) {
      throw new BadRequestException('Transaction ID (TrxID) is required');
    }

    const cleanSender = data.sender_number?.trim();
    if (!cleanSender) {
      throw new BadRequestException('Sender phone number is required');
    }

    // Check if TrxID already exists
    const existingTrx = await this.prisma.depositRequest.findUnique({
      where: { trx_id: cleanTrx },
    });

    if (existingTrx) {
      throw new ConflictException(
        'This Transaction ID has already been submitted. Please check your TrxID or contact support.',
      );
    }

    const deposit = await this.prisma.depositRequest.create({
      data: {
        user_id: userId,
        method: data.method.trim().toUpperCase(),
        sender_number: cleanSender,
        amount: new Prisma.Decimal(numAmount),
        trx_id: cleanTrx,
        status: RequestStatus.PENDING,
      },
    });

    return {
      success: true,
      message: `Deposit request of ৳${numAmount.toFixed(2)} submitted successfully! Our team will verify the transaction and credit your wallet.`,
      deposit,
    };
  }

  /**
   * User: Get their deposit history
   */
  async getMyDeposits(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.depositRequest.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.depositRequest.count({ where: { user_id: userId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
