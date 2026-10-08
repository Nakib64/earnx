import { Injectable } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import { WithdrawalRequestSubService } from './sub-services/withdrawal-request.sub-service';
import { WithdrawalAdminSubService } from './sub-services/withdrawal-admin.sub-service';

/**
 * WithdrawalsService acts as a Facade orchestrating withdrawal sub-services:
 * - WithdrawalRequestSubService: User OTP generation, balance hold, and personal withdrawal history
 * - WithdrawalAdminSubService: Admin listing, OTP resending, and settlement payments
 */
@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly requestSubService: WithdrawalRequestSubService,
    private readonly adminSubService: WithdrawalAdminSubService,
  ) {}

  // ==========================================
  // USER WITHDRAWAL OPERATIONS
  // ==========================================
  async requestWithdrawal(userId: string, amount: number) {
    return this.requestSubService.requestWithdrawal(userId, amount);
  }

  async getUserWithdrawals(userId: string, page = 1, limit = 20) {
    return this.requestSubService.getUserWithdrawals(userId, page, limit);
  }

  // ==========================================
  // ADMIN WITHDRAWAL OPERATIONS
  // ==========================================
  async getAllWithdrawals(page = 1, limit = 20, search?: string, status?: RequestStatus) {
    return this.adminSubService.getAllWithdrawals(page, limit, search, status);
  }

  async resendOtp(withdrawalId: string) {
    return this.adminSubService.resendOtp(withdrawalId);
  }

  async processPayment(withdrawalId: string, targetUserId: string, adminPhone: string) {
    return this.adminSubService.processPayment(withdrawalId, targetUserId, adminPhone);
  }
}
