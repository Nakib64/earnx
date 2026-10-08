import { Injectable } from '@nestjs/common';
import { RequestStatus } from '@prisma/client';
import { DepositGatewaySubService, DepositGatewayConfig } from './sub-services/deposit-gateway.sub-service';
import { DepositAdminSubService } from './sub-services/deposit-admin.sub-service';

export { DepositGatewayConfig };

/**
 * DepositsService acts as a Facade orchestrating deposit sub-services:
 * - DepositGatewaySubService: Gateway number configurations and user deposit submissions
 * - DepositAdminSubService: Admin listing, approval with atomic balance crediting, and rejection
 */
@Injectable()
export class DepositsService {
  constructor(
    private readonly gatewaySubService: DepositGatewaySubService,
    private readonly adminSubService: DepositAdminSubService,
  ) {}

  // ==========================================
  // GATEWAY & USER OPERATIONS
  // ==========================================
  async getDepositGateways(): Promise<DepositGatewayConfig> {
    return this.gatewaySubService.getDepositGateways();
  }

  async updateDepositGateways(data: Partial<DepositGatewayConfig>) {
    return this.gatewaySubService.updateDepositGateways(data);
  }

  async submitDeposit(
    userId: string,
    data: {
      method: string;
      sender_number: string;
      amount: number;
      trx_id: string;
    },
  ) {
    return this.gatewaySubService.submitDeposit(userId, data);
  }

  async getMyDeposits(userId: string, page = 1, limit = 20) {
    return this.gatewaySubService.getMyDeposits(userId, page, limit);
  }

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================
  async getAllDeposits(
    page = 1,
    limit = 20,
    search?: string,
    status?: RequestStatus,
  ) {
    return this.adminSubService.getAllDeposits(page, limit, search, status);
  }

  async approveDeposit(depositId: string, adminPhone: string) {
    return this.adminSubService.approveDeposit(depositId, adminPhone);
  }

  async rejectDeposit(depositId: string, adminPhone: string, reason?: string) {
    return this.adminSubService.rejectDeposit(depositId, adminPhone, reason);
  }
}
