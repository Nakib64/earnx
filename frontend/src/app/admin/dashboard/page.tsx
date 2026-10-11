'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import {
  ShieldCheck,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  Award,
  Layers,
  TrendingUp,
  Trophy,
  Coins,
  Settings,
  DollarSign,
  Globe,
  Megaphone,
  Tv,
  BarChart3,
  Crown,
  Zap,
  ArrowDownCircle,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { ShimmerSkeleton, SkeletonLine } from '../../../components/design-system';
import { AdminAdsAnalyticsChart } from '../../../components/dashboard';

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  pendingPremiums?: number;
}

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
  });
  const [adsAnalytics, setAdsAnalytics] = useState<any | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [usersRes, approvalsRes, adsRes] = await Promise.all([
          apiFetch<any>('/admin/users?limit=1', { isAdmin: true }),
          apiFetch<any>('/admin/requests/pending', { isAdmin: true }),
          apiFetch<any>('/premium/admin/ads-analytics?timeframe=7d', { isAdmin: true }),
        ]);

        const totalU =
          usersRes.success && usersRes.data
            ? usersRes.data.meta?.total || usersRes.data.length || 0
            : 0;

        const pendingWithdrawals =
          approvalsRes.success && approvalsRes.data
            ? approvalsRes.data.withdrawals?.length || 0
            : 0;

        const pendingPremiums =
          approvalsRes.success && approvalsRes.data
            ? approvalsRes.data.premiums?.length || 0
            : 0;

        setStats({
          totalUsers: totalU,
          pendingApprovals: pendingWithdrawals,
          pendingPremiums,
        });

        if (adsRes.success && adsRes.data) {
          setAdsAnalytics(adsRes.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchAdminStats();
    }
  }, [admin]);

  // Loading skeleton matching user dashboard design system
  if (loading && !stats.totalUsers && !adsAnalytics) {
    return (
      <div className="relative z-10 min-h-full text-[#111827] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
            <div className="space-y-2 max-w-2xl w-full">
              <SkeletonLine className="w-32 h-3.5" rounded="rounded" />
              <SkeletonLine className="w-72 sm:w-96 h-8 sm:h-9" rounded="rounded-xl" />
              <SkeletonLine className="w-full sm:w-[480px] h-4" rounded="rounded" />
              <div className="pt-1 flex items-center gap-2">
                <ShimmerSkeleton className="w-2.5 h-2.5" rounded="rounded-full" />
                <SkeletonLine className="w-36 h-3.5" rounded="rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <ShimmerSkeleton className="w-32 h-9" rounded="rounded-xl" />
              <ShimmerSkeleton className="w-32 h-9" rounded="rounded-xl" />
            </div>
          </div>

          {/* 4 Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl sm:rounded-3xl p-5 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <SkeletonLine className="w-20 h-3" rounded="rounded" />
                  <ShimmerSkeleton className="w-8 h-8" rounded="rounded-xl" />
                </div>
                <SkeletonLine className="w-24 h-7" rounded="rounded-lg" />
              </div>
            ))}
          </div>

          {/* Big Analytics Card Skeleton */}
          <div className="bg-white/75 backdrop-blur-xl border border-white/85 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <SkeletonLine className="w-48 h-5" rounded="rounded-md" />
              <SkeletonLine className="w-28 h-4" rounded="rounded-md" />
            </div>
            <ShimmerSkeleton className="w-full h-48 sm:h-64" rounded="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const adminName = admin?.name || 'Super Admin';
  const totalPending = stats.pendingApprovals + (stats.pendingPremiums || 0);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. COMPACT PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Administrative Operations
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              System Control &amp; Activity Overview
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Welcome back, <span className="font-semibold text-slate-900">{adminName}</span>. Monitor platform volume, audit user accounts, and manage pending payouts.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Status:{' '}
                <strong className="text-slate-900 font-semibold">Super Administrator</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Console Phone: <span className=" text-slate-700 font-semibold">{admin?.phone}</span>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/withdrawals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Requests</span>
              {totalPending > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold ml-0.5">
                  {totalPending}
                </span>
              )}
            </Link>

            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Users className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Member Directory</span>
            </Link>
          </div>
        </div>

        {/* ── 2. TOP 4 KPI METRIC CARDS (Exact Match to User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Registered Users */}
          <Link href="/admin/users" className="block group">
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Members</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5 group-hover:text-[#009F6B] transition-colors">
                  Registered accounts &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Pending Withdrawals */}
          <Link href="/admin/withdrawals" className="block group">
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending Payouts</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                  {loading ? '...' : stats.pendingApprovals}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5 group-hover:text-amber-600 transition-colors">
                  Awaiting review queue &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Ads Impressions */}
          <Link href="/admin/ads-analytics" className="block group">
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Ads Watched ({selectedTimeframe.toUpperCase()})</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                  <Tv className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                  {loading ? '...' : (adsAnalytics?.summary?.total_ads_watched ?? 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5 group-hover:text-sky-600 transition-colors">
                  Live user views &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Card 4: User Rewards Paid */}
          <Link href="/admin/wallet" className="block group">
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">User Rewards ({selectedTimeframe.toUpperCase()})</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
                  ৳{loading ? '...' : (adsAnalytics?.summary?.total_earned_bdt ?? 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5 group-hover:text-purple-600 transition-colors">
                  Platform volume ledger &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* ── 3. ADS & WATCH-TO-EARN ANALYTICS (Liquid Glassmorphism Card) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 w-full relative overflow-hidden">
          {/* Ambient Mesh Sheen */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-500/[0.04] blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Ads &amp; Watch-to-Earn Performance
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                    {selectedTimeframe.toUpperCase()} Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Live volume of member ad views and rewarded wallet credits
                </p>
              </div>
            </div>

            <Link
              href="/admin/ads-analytics"
              className="text-xs font-semibold text-[#009F6B] hover:text-[#008C5F] flex items-center gap-1 transition-colors self-start sm:self-center shrink-0"
            >
              <span>Full Analytics &amp; Graphs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Ads Watched ({selectedTimeframe.toUpperCase()})
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {loading ? '...' : (adsAnalytics?.summary?.total_ads_watched ?? 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block">
                {(adsAnalytics?.summary?.all_time_ads_watched ?? 0).toLocaleString()} all-time
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                User Payouts ({selectedTimeframe.toUpperCase()})
              </span>
              <div className="text-xl sm:text-2xl font-bold text-amber-600 tabular-nums">
                ৳{loading ? '...' : (adsAnalytics?.summary?.total_earned_bdt ?? 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold block">
                ৳{(adsAnalytics?.summary?.all_time_earned_bdt ?? 0).toLocaleString()} all-time
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Watchers
              </span>
              <div className="text-xl sm:text-2xl font-bold text-sky-700 tabular-nums">
                {loading ? '...' : (adsAnalytics?.summary?.active_users ?? 0).toLocaleString()}
              </div>
              <span className="text-[10px] text-sky-600 font-semibold block">
                Active subscribers
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Avg Ads / Watcher
              </span>
              <div className="text-xl sm:text-2xl font-bold text-purple-700 tabular-nums">
                {loading ? '...' : adsAnalytics?.summary?.avg_ads_per_user ?? 0}
              </div>
              <span className="text-[10px] text-purple-600 font-semibold block">
                Daily task average
              </span>
            </div>
          </div>

          {/* ── Main Interactive Chart.js Ads Analytics Graph (Same as /admin/ads-analytics) ── */}
          <AdminAdsAnalyticsChart
            initialTimeframe="7d"
            initialData={adsAnalytics}
            onTimeframeChange={(tf) => setSelectedTimeframe(tf)}
            onDataLoaded={(data) => setAdsAnalytics(data)}
            heightClass="h-64 sm:h-76"
          />
        </div>

        {/* ── 4. COMMISSION MATRIX HIGHLIGHT BANNER (Matches User Dashboard VIP Banner) ── */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-amber-500/[0.06] rounded-full blur-3xl pointer-events-none" />

          {/* Left Summary */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-center justify-center text-[#009F6B] shrink-0 shadow-2xs">
              <Layers className="w-5 h-5 text-[#009F6B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Multi-Level Commission Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure affiliate tiers, direct referral payouts &amp; 5-level matrix percentages
              </p>
            </div>
          </div>

          {/* Right CTA */}
          <Link
            href="/admin/commissions"
            className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0 min-h-[44px]"
          >
            <span>Configure Rules</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </Link>
        </div>

        {/* ── 5. PLATFORM MANAGEMENT MODULES GRID (Matches User Dashboard Quick Actions) ── */}
        <div className="space-y-4">
          <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Management Modules &amp; Control
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                12 Core Systems
              </span>
            </div>

            {/* Grid of Interactive Module Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {[
                {
                  href: '/admin/products',
                  icon: ShoppingBag,
                  label: 'Products Catalog',
                  desc: 'Shop items & stock',
                  accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                },
                {
                  href: '/admin/orders',
                  icon: Package,
                  label: 'Ecommerce Orders',
                  desc: 'Delivery & fulfillment',
                  accent: 'bg-teal-50 text-teal-700 border-teal-200/80',
                },
                {
                  href: '/admin/deposits',
                  icon: ArrowDownCircle,
                  label: 'Deposit Gateway',
                  desc: 'Gateway & transactions',
                  accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                },
                {
                  href: '/admin/withdrawals',
                  icon: Wallet,
                  label: 'Withdrawal Queue',
                  desc: 'Pending user payouts',
                  accent: 'bg-amber-50 text-amber-700 border-amber-200/80',
                },
                {
                  href: '/admin/ads-analytics',
                  icon: BarChart3,
                  label: 'Ads Analytics',
                  desc: 'Watch-to-earn volume',
                  accent: 'bg-sky-50 text-sky-700 border-sky-200/80',
                },
                {
                  href: '/admin/premium',
                  icon: Crown,
                  label: 'VIP Packages',
                  desc: 'Membership limits',
                  accent: 'bg-amber-50 text-amber-700 border-amber-200/80',
                },
                {
                  href: '/admin/notices',
                  icon: Megaphone,
                  label: 'Notice Board',
                  desc: 'Public announcements',
                  accent: 'bg-rose-50 text-rose-700 border-rose-200/80',
                },
                {
                  href: '/admin/coins',
                  icon: Coins,
                  label: 'Solana Coin Hub',
                  desc: 'Market rates & sales',
                  accent: 'bg-purple-50 text-purple-700 border-purple-200/80',
                },
                {
                  href: '/admin/investments',
                  icon: TrendingUp,
                  label: 'Investments',
                  desc: 'Plans & returns',
                  accent: 'bg-teal-50 text-teal-700 border-teal-200/80',
                },
                {
                  href: '/admin/leaderboard',
                  icon: Trophy,
                  label: 'Leaderboard',
                  desc: 'Top 100 rankings',
                  accent: 'bg-amber-50 text-amber-700 border-amber-200/80',
                },
                {
                  href: '/admin/users',
                  icon: Users,
                  label: 'Users Directory',
                  desc: 'Member accounts',
                  accent: 'bg-blue-50 text-blue-700 border-blue-200/80',
                },
                {
                  href: '/admin/designations',
                  icon: Award,
                  label: 'Designations',
                  desc: 'Rank & stars badges',
                  accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                },
                {
                  href: '/admin/commissions',
                  icon: Layers,
                  label: 'Commissions',
                  desc: 'Multi-level matrix',
                  accent: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
                },
                {
                  href: '/admin/wallet',
                  icon: DollarSign,
                  label: 'Transaction Log',
                  desc: 'System transfers',
                  accent: 'bg-violet-50 text-violet-700 border-violet-200/80',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link key={idx} href={item.href} className="block">
                    <div className="relative flex flex-col items-center text-center p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md hover:bg-white/95 border border-white/80 hover:border-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] shadow-2xs transition-all duration-200 group cursor-pointer min-h-[96px] justify-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${item.accent}`}
                      >
                        <Icon className="w-4.5 h-4.5 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-[#009F6B] transition-colors leading-tight block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate max-w-full">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Settings Rows matching User Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/settings" className="block">
              <div className="flex items-center justify-between bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl px-5 py-4 hover:bg-white/90 transition-all group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100/80 border border-slate-200/80 group-hover:bg-emerald-50 text-slate-600 group-hover:text-[#009F6B] flex items-center justify-center shrink-0 transition-colors">
                    <Settings className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#009F6B] transition-colors">
                      Admin Profile &amp; Security
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">Update password &amp; phone credentials</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#009F6B] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
