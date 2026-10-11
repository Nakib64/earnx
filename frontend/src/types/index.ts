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
  PREMIUM_DAILY_REWARD = 'PREMIUM_DAILY_REWARD',
  INVESTMENT_DEPOSIT = 'INVESTMENT_DEPOSIT',
  INVESTMENT_PAYOUT = 'INVESTMENT_PAYOUT',
  BALANCE_TRANSFER = 'BALANCE_TRANSFER',
  COIN_PURCHASE = 'COIN_PURCHASE',
}

export enum CommissionType {
  PREMIUM = 'PREMIUM',
}

export enum CoinTransactionType {
  PURCHASE = 'PURCHASE',
  PREMIUM_LOCKED_REWARD = 'PREMIUM_LOCKED_REWARD',
  PREMIUM_UNLOCKED = 'PREMIUM_UNLOCKED',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  COIN_TRANSFER_SENT = 'COIN_TRANSFER_SENT',
  COIN_TRANSFER_RECEIVED = 'COIN_TRANSFER_RECEIVED',
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

export interface PremiumPackage {
  id: string;
  title: string;
  description?: string | null;
  original_price?: number | string | null;
  discount_percent?: number | null;
  price: number | string;
  daily_ads_count: number;
  daily_reward_amount: number | string;
  duration_days: number;
  is_active: boolean;
  direct_referral_commission?: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DailyAdTask {
  is_premium: boolean;
  message?: string;
  package_title?: string;
  daily_reward_amount?: number;
  daily_ads_required?: number;
  ads_watched?: number;
  reward_per_ad?: number;
  earned_today?: number;
  remaining_ads?: number;
  remaining_reward?: number;
  quota_reached?: boolean;
  is_claimed?: boolean;
  can_claim?: boolean;
  claim_date?: string;
}

export interface AdsAnalyticsChartPoint {
  label: string;
  ads_count: number;
  total_earned: number;
  active_users: number;
}

export interface AdsAnalyticsPackageBreakdown {
  title: string;
  ads_count: number;
  total_earned: number;
  user_count: number;
}

export interface AdsAnalyticsRecentItem {
  id: string;
  user_id: string;
  user_name: string;
  user_phone?: string | null;
  package_title: string;
  amount: number;
  created_at: string;
  description?: string | null;
}

export interface AdsAnalyticsData {
  timeframe: string;
  summary: {
    total_ads_watched: number;
    total_earned_bdt: number;
    active_users: number;
    avg_ads_per_user: number;
    all_time_ads_watched: number;
    all_time_earned_bdt: number;
  };
  chart_data: AdsAnalyticsChartPoint[];
  package_breakdown: AdsAnalyticsPackageBreakdown[];
  recent_activity: AdsAnalyticsRecentItem[];
}


export interface DepositGatewayConfig {
  bkash_number: string;
  bkash_type: string;
  nagad_number: string;
  nagad_type: string;
  rocket_number: string;
  rocket_type: string;
  deposit_instruction?: string;
}

export interface DepositRequest {
  id: string;
  user_id: string;
  method: string;
  sender_number: string;
  amount: number | string;
  trx_id: string;
  status: RequestStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
}

export interface CoinTransfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  coin_amount: number | string;
  coin_rate: number | string;
  total_bdt_value: number | string;
  note?: string | null;
  status: RequestStatus;
  responded_at?: string | null;
  created_at: string;
  updated_at?: string;
  sender?: UserSummary;
  receiver?: UserSummary;
}

export interface MarketplaceComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
  replies?: MarketplaceComment[];
}

export interface MarketplacePost {
  id: string;
  user_id?: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  user: UserSummary & { designation?: Designation | null; is_premium?: boolean };
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  is_liked_by_me?: boolean;
  comments: MarketplaceComment[];
}

export interface User {
  id: string;
  phone?: string | null;
  full_name: string | null;
  email?: string | null;
  country?: string | null;
  national_id?: string | null;
  avatar_url?: string | null;
  referral_code: string;
  referred_by_id?: string | null;
  status: UserStatus;
  wallet_balance: number | string;
  coin_balance?: number | string;
  locked_coin_balance?: number | string;
  premium_coins_granted?: boolean;
  is_premium_coins_unlocked?: boolean;
  designation_id?: string | null;
  is_premium?: boolean;
  premium_package_id?: string | null;
  premium_package?: PremiumPackage | null;
  premium_started_at?: string | null;
  premium_expires_at?: string | null;
  designation?: Designation | null;
  referred_by?: UserSummary | null;
  created_at?: string;
  updated_at?: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  type: CoinTransactionType;
  amount: number | string;
  coins_before: number | string;
  coins_after: number | string;
  cost_bdt?: number | string | null;
  description?: string | null;
  created_at: string;
}

export interface CoinInfo {
  coin_balance: number;
  locked_coin_balance: number;
  locked_bonus_coins?: number;
  wallet_balance: number;
  is_premium: boolean;
  premium_coins_granted: boolean;
  is_premium_coins_unlocked: boolean;
  active_referral_count: number;
  required_referral_count: number;
  coin_price: number;
  premium_free_coins: number;
  can_unlock: boolean;
}

export interface UserSummary {
  id: string;
  phone?: string | null;
  email?: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  referral_code: string;
  wallet_balance?: number | string;
  is_premium?: boolean;
  referred_by?: UserSummary | null;
}

export interface Admin {
  id: string;
  phone: string;
  name: string;
  created_at?: string;
}

export interface Designation {
  id: string;
  name: string;
  title?: string;
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
  otp?: string | null;
  otp_expires_at?: string | null;
  status: RequestStatus;
  approved_by?: string | null;
  paid_to_user_id?: string | null;
  paid_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at?: string;
  user?: UserSummary;
  paid_to_user?: UserSummary | null;
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
  amount?: number | string;
  min_amount: number | string;
  max_amount?: number | string;
  monthly_return_percent: number | string;
  duration_months?: number | null;
  is_lifetime?: boolean;
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
  request_type?: string;
  pending_plan_id?: string | null;
  pending_amount?: number | string | null;
  total_payouts_made: number;
  max_payouts?: number | null;
  duration_months?: number | null;
  is_lifetime?: boolean;
  starts_at?: string;
  ends_at?: string | null;
  is_principal_returned?: boolean;
  last_payout_at?: string | null;
  next_payout_at?: string | null;
  created_at: string;
  updated_at?: string;
  plan?: InvestmentPlan;
  pending_plan?: InvestmentPlan | null;
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

// ==========================================
// ECOMMERCE & ORDERS DOMAIN
// ==========================================

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  images: string[];
  stock: number;
  category?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_image?: string | null;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number | string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  district: string;
  city?: string | null;
  delivery_address: string;
  notes?: string | null;
  payment_method: string;
  paid_at: string;
  items: OrderItem[];
  user?: UserSummary;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}
