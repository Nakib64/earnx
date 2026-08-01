// ==========================================
// CENTRAL DOMAIN ENUMS
// ==========================================

export enum UserStatus {
  DISABLED = 'DISABLED',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  COMMISSION = 'COMMISSION',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  PREMIUM_WEEKLY_PAYOUT = 'PREMIUM_WEEKLY_PAYOUT',
  INVESTMENT_DEPOSIT = 'INVESTMENT_DEPOSIT',
  INVESTMENT_PAYOUT = 'INVESTMENT_PAYOUT',
}

export enum CommissionType {
  ACTIVATION = 'ACTIVATION',
  PREMIUM = 'PREMIUM',
}

// ==========================================
// STANDARDIZED API RESPONSE STRUCTURE
// ==========================================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  statusCode?: number;
}

// ==========================================
// DOMAIN MODELS & ENTITIES
// ==========================================

export interface User {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  referred_by_id?: string | null;
  status: UserStatus;
  wallet_balance: number | string;
  designation_id?: string | null;
  is_premium?: boolean;
  premium_started_at?: string | null;
  premium_expires_at?: string | null;
  premium_payout_count?: number;
  last_premium_payout_at?: string | null;
  designation?: Designation | null;
  referred_by?: UserSummary | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSummary {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  wallet_balance?: number | string;
  referred_by?: UserSummary | null;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface Designation {
  id: string;
  name: string;
  stars: number;
  max_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number | string;
  balance_before: number | string;
  balance_after: number | string;
  description?: string | null;
  created_at: string;
  user?: UserSummary;
}

export interface ActivationRequest {
  id: string;
  user_id: string;
  referrer_id?: string | null;
  status: RequestStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
}

export interface PremiumRequest {
  id: string;
  user_id: string;
  referrer_id?: string | null;
  status: RequestStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number | string;
  status: RequestStatus;
  approved_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
}

export interface CommissionRule {
  id: string;
  type: CommissionType;
  level: number;
  amount: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  reward_amount: number | string;
  banner_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InvestmentPlan {
  id: string;
  title: string;
  min_amount: number | string;
  max_amount: number | string;
  monthly_return_percent: number | string;
  duration_months: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserInvestment {
  id: string;
  user_id: string;
  plan_id?: string | null;
  amount: number | string;
  monthly_return_percent: number | string;
  monthly_payout_amount: number | string;
  status: RequestStatus;
  total_payouts_made: number;
  max_payouts: number;
  last_payout_at?: string | null;
  next_payout_at?: string | null;
  created_at: string;
  updated_at?: string;
  plan?: InvestmentPlan;
  user?: UserSummary;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  phone?: string | null;
  invested_amount: number | string;
  profit_earned: number | string;
  photo_url?: string | null;
  badge?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SystemConfigMap = Record<string, string>;
