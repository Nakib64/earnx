import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getValue(key: string, defaultValue = ''): Promise<string> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : defaultValue;
  }

  async setValue(key: string, value: string): Promise<any> {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAll(): Promise<Record<string, string>> {
    const configs = await this.prisma.systemConfig.findMany();
    const result: Record<string, string> = {
      PREMIUM_WEEKLY_PAYOUT_AMOUNT: '100', // Default fallback
      COIN_PRICE: '10', // Default ৳10 per coin
      PREMIUM_FREE_COINS: '100', // Default 100 free coins on premium
      PREMIUM_FREE_COINS_REQUIRED_REFERRALS: '10', // Fixed 10 active referrals required
    };
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return result;
  }
}
