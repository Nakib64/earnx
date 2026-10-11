'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { SolanaLogo } from '../../../components/common/SolanaLogo';
import {
  Coins,
  Save,
  Search,
  Users,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AdminCoinUser {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  coin_balance: number | string;
  locked_coin_balance: number | string;
  is_premium: boolean;
  premium_coins_granted: boolean;
  is_premium_coins_unlocked: boolean;
}

interface AdminCoinStats {
  configs: {
    COIN_PRICE: number;
    PREMIUM_FREE_COINS: number;
    PREMIUM_FREE_COINS_REQUIRED_REFERRALS: number;
  };
  stats: {
    total_available_coins: number;
    total_locked_coins: number;
    user_count: number;
  };
}

interface UsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminCoinsPage() {
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Config Form State
  const [coinPrice, setCoinPrice] = useState('10');
  const [premiumFreeCoins, setPremiumFreeCoins] = useState('100');
  const [requiredReferrals, setRequiredReferrals] = useState('10');

  // Stats
  const [statsData, setStatsData] = useState<AdminCoinStats | null>(null);

  // Users infinite scroll state
  const [users, setUsers] = useState<AdminCoinUser[]>([]);
  const [usersMeta, setUsersMeta] = useState<UsersMeta | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<AdminCoinUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustIsLocked, setAdjustIsLocked] = useState<boolean>(false);
  const [adjustDescription, setAdjustDescription] = useState<string>('');

  useEffect(() => {
    fetchStats();
    fetchUsers(1, '');
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiFetch<AdminCoinStats>('/coins/admin/stats', { isAdmin: true });
    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setStatsData(data);
      if (data.configs) {
        setCoinPrice(String(data.configs.COIN_PRICE || 10));
        setPremiumFreeCoins(String(data.configs.PREMIUM_FREE_COINS || 100));
        setRequiredReferrals(String(data.configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || 10));
      }
    }
    setLoading(false);
  };

  const fetchUsers = async (page: number, search: string, append = false) => {
    setUsersLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);

    const res = await apiFetch<{ data: AdminCoinUser[]; meta: UsersMeta }>(
      `/coins/admin/users?${params.toString()}`,
      { isAdmin: true },
    );

    if (res.success && res.data) {
      const responseData = (res.data as any).data || res.data;
      const usersArray = Array.isArray(responseData) ? responseData : responseData.data || [];
      const meta = (res.data as any).meta || responseData.meta;

      if (append) {
        setUsers((prev) => [...prev, ...usersArray]);
      } else {
        setUsers(usersArray);
      }
      if (meta) setUsersMeta(meta);
    }
    setUsersLoading(false);
  };

  // Infinite scroll sentinel ref callback
  const lastUserRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (usersLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && usersMeta?.hasMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchUsers(nextPage, searchQuery, true);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [usersLoading, usersMeta?.hasMore, currentPage, searchQuery],
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, value, false);
    }, 400);
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage(null);

    const res = await apiFetch('/coins/admin/configs', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({
        COIN_PRICE: parseFloat(coinPrice),
        PREMIUM_FREE_COINS: parseInt(premiumFreeCoins, 10),
        PREMIUM_FREE_COINS_REQUIRED_REFERRALS: parseInt(requiredReferrals, 10),
      }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Global coin configurations saved successfully!' });
      await fetchStats();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to save coin configurations.' });
    }
    setSavingConfig(false);
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;

    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      setMessage({ type: 'error', text: 'Please enter a non-zero adjustment amount.' });
      return;
    }

    setAdjusting(true);
    setMessage(null);

    const res = await apiFetch('/coins/admin/adjust', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        user_id: selectedUser.id,
        amount: amountNum,
        is_locked: adjustIsLocked,
        description: adjustDescription || 'Admin manual adjustment',
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Successfully adjusted ${adjustIsLocked ? 'locked' : 'available'} coins for ${selectedUser.full_name || selectedUser.phone}!`,
      });
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustDescription('');
      await fetchStats();
      setCurrentPage(1);
      await fetchUsers(1, searchQuery, false);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to adjust user coins.' });
    }
    setAdjusting(false);
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none flex items-center gap-1.5">
              <span>SOLANA TOKENOMICS &amp; ASSET MANAGEMENT</span>
              <SolanaLogo size={14} />
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>Solana Coins Hub &amp; Global Parameters</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Monitor platform-wide Solana coin circulation, configure market conversion pricing in BDT, manage VIP free coin grants, and adjust member balances.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Active Tokenomics Matrix &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {(statsData?.stats.user_count || 0).toLocaleString()} Member Accounts
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/coins"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Coins className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Client Hub</span>
            </Link>

            <button
              onClick={() => {
                fetchStats();
                fetchUsers(1, searchQuery, false);
              }}
              disabled={loading}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Coin Hub"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {message && (
          <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />
        )}

        {/* ── 2. TOP 4 KPI SUMMARY CARDS (Matches User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Available Coins */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Spendable Coins</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums flex items-center gap-1.5">
                {loading ? '...' : (statsData?.stats.total_available_coins || 0).toLocaleString()}
                <SolanaLogo size={18} />
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Circulating member balance
              </span>
            </div>
          </div>

          {/* Card 2: Locked Coins */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Locked Coins</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums flex items-center gap-1.5">
                {loading ? '...' : (statsData?.stats.total_locked_coins || 0).toLocaleString()}
                <SolanaLogo size={18} />
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Premium bonus held
              </span>
            </div>
          </div>

          {/* Card 3: Coin Market Price */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Market Price</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                ৳{coinPrice} <span className="text-xs font-semibold text-slate-400">/ coin</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Official buy conversion
              </span>
            </div>
          </div>

          {/* Card 4: VIP Free Coin Grant */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">VIP Bonus Grant</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                {premiumFreeCoins} <span className="text-xs font-semibold text-slate-400">Coins</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Requires {requiredReferrals} active referrals
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. GLOBAL COIN CONFIGURATION (Liquid Glassmorphism Card) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Radial Mesh Sheen */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/[0.04] blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4 relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Global Coin Parameters &amp; Yield Controls
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure real-time unit pricing, VIP sign-up grants, and referral release thresholds
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Instant Platform Sync
            </span>
          </div>

          <form onSubmit={handleSaveConfigs} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Parameter 1: Coin Market Price */}
              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#009F6B]" />
                    Coin Market Price (৳)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Per 1 Coin</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Price in BDT when user purchases coins using cash wallet.</p>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-slate-900 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              {/* Parameter 2: Premium Free Coins */}
              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    VIP Free Bonus Coins
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Locked Grant</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Amount of coins granted in locked state upon VIP subscription.</p>
                <div className="relative">
                  <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={premiumFreeCoins}
                    onChange={(e) => setPremiumFreeCoins(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-slate-900 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              {/* Parameter 3: Referral Threshold */}
              <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    Required Referrals to Unlock
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Unlock Milestone</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Number of active direct referrals required to unlock locked coins.</p>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={requiredReferrals}
                    onChange={(e) => setRequiredReferrals(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-slate-900 text-xs outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#009F6B] hover:bg-[#008C5F] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save System Configurations</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── 4. USER COIN BALANCES Transactions (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Member Coin Ledger</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Audit spendable and locked balances, and execute manual adjustments</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search name, phone, referral code..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100/80 bg-white/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-bold text-[10.5px] border-b border-slate-100">
                  <th className="py-3.5 px-5">Member &amp; Code</th>
                  <th className="py-3.5 px-4">Spendable &amp; Locked Balance</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-slate-400">
                      <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <p className="font-semibold text-xs">Loading member coin records...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-slate-400">
                      <Users className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm text-slate-700">No members found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try searching with a different name or phone number.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u, index) => {
                    const isLast = index === users.length - 1;
                    return (
                      <tr
                        key={u.id}
                        ref={isLast ? lastUserRef : null}
                        className="hover:bg-white/60 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] font-bold text-xs shrink-0">
                              {(u.full_name || u.phone).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                                {u.full_name || u.phone}
                              </p>
                              <p className="text-slate-400  text-[11px] mt-0.5">
                                {u.phone} &bull;{' '}
                                <span className="text-[#009F6B] font-bold">{u.referral_code}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-[#009F6B] flex items-center gap-1">
                              {Number(u.coin_balance).toLocaleString()} Avail
                              <SolanaLogo size={14} />
                            </span>
                            <span className="font-semibold text-amber-700">
                              ({Number(u.locked_coin_balance).toLocaleString()} Locked)
                            </span>
                            {u.is_premium_coins_unlocked ? (
                              <span className="inline-flex items-center text-[#009F6B] font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Unlocked
                              </span>
                            ) : Number(u.locked_coin_balance) > 0 ? (
                              <span className="inline-flex items-center text-amber-800 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                                <Lock className="w-3 h-3 mr-0.5" /> Locked
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setAdjustAmount('');
                              setAdjustIsLocked(false);
                              setAdjustDescription('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            <span>Adjust</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Infinite scroll loader */}
                {usersLoading && users.length > 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#009F6B]" />
                        <span>Loading more members...</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Meta Info */}
          {usersMeta && (
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-1">
              <span>Showing {users.length} of {usersMeta.total} members</span>
              <span>Page {usersMeta.page} of {usersMeta.totalPages}</span>
            </div>
          )}
        </div>

        {/* ── 5. MANUAL COIN ADJUSTMENT MODAL (Liquid Glassmorphism) ── */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] relative border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Adjust Member Coins</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Info Box */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-1.5 text-xs">
                <p className="font-bold text-slate-900">{selectedUser.full_name || 'Anonymous User'}</p>
                <p className="text-slate-500  text-[11px]">
                  Phone: {selectedUser.phone} &bull; Code: <strong className="text-[#009F6B]">{selectedUser.referral_code}</strong>
                </p>
                <div className="pt-2 flex justify-between font-bold border-t border-slate-200/70 mt-2">
                  <span className="text-[#009F6B]">Available: {Number(selectedUser.coin_balance).toLocaleString()}</span>
                  <span className="text-amber-700">Locked: {Number(selectedUser.locked_coin_balance).toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleAdjustCoins} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adjustment Target</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustIsLocked(false)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${!adjustIsLocked
                        ? 'bg-[#009F6B] border-[#009F6B] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                    >
                      Available Coins
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustIsLocked(true)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${adjustIsLocked
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                    >
                      Locked Coins
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adjustment Amount</label>
                  <p className="text-[11px] text-slate-400 font-medium">Use positive to credit (e.g. 50) or negative to deduct (e.g. -20).</p>
                  <div className="relative">
                    <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="1"
                      placeholder="e.g. 50 or -20"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl font-bold text-slate-900 text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reason / Audit Note</label>
                  <input
                    type="text"
                    placeholder="Admin adjustment reason..."
                    value={adjustDescription}
                    onChange={(e) => setAdjustDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting || !adjustAmount}
                    className="px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {adjusting ? 'Applying...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
