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
  UserCheck,
  DollarSign,
  Globe,
  Megaphone,
  Tv,
  BarChart3,
  Crown,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
  });
  const [adsAnalytics, setAdsAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      const [usersRes, approvalsRes, adsRes] = await Promise.all([
        apiFetch<any>('/admin/users?limit=1', { isAdmin: true }),
        apiFetch<any>('/admin/requests/pending', { isAdmin: true }),
        apiFetch<any>('/premium/admin/ads-analytics?timeframe=7d', { isAdmin: true }),
      ]);

      const totalU = usersRes.success && usersRes.data ? (usersRes.data.meta?.total || usersRes.data.length || 0) : 0;
      const pendingWithdrawals = approvalsRes.success && approvalsRes.data ? (approvalsRes.data.withdrawals?.length || 0) : 0;

      setStats({
        totalUsers: totalU,
        pendingApprovals: pendingWithdrawals,
      });

      if (adsRes.success && adsRes.data) {
        setAdsAnalytics(adsRes.data);
      }

      setLoading(false);
    };

    if (admin) fetchAdminStats();
  }, [admin]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Welcome Banner — Dark Emerald & Gold Luxury Banner */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-2">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#f3ba2f]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-black  text-white">
              Admin Control Center
            </h1>
            <p className="text-xs text-slate-300 font-semibold">
              Welcome back, <strong className="text-[#f3ba2f] ">{admin?.phone}</strong>. Manage users, approve requests, and configure tree commissions.
            </p>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Registered Users */}
        <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-200 uppercase tracking-widest">
            Registered Users
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-[#d4af37]/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white  ">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-slate-300">Total Members</div>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="w-full bg-[#03442e] hover:bg-[#04593d] text-amber-200 border border-[#d4af37]/30 font-extrabold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Manage Users</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>

        {/* Card 2: Pending Withdrawals */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest">
            Pending Withdrawals
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-100  ">
                {loading ? '...' : stats.pendingApprovals}
              </div>
              <div className="text-xs font-bold text-amber-300">
                Awaiting Payout
              </div>
            </div>
          </div>

          <Link
            href="/admin/withdrawals"
            className="w-full bg-[#3d2705] hover:bg-[#4d3207] text-amber-200 border border-amber-500/40 font-extrabold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Review Queue</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>
      </div>

      {/* Ads & Watch-to-Earn Analytics Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#01281a] to-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Ads & Watch-to-Earn Analytics Bar</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Last 7 Days
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Live volume of member ad impressions and direct wallet rewards
              </p>
            </div>
          </div>

          <Link
            href="/admin/ads-analytics"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-black transition-all shrink-0 self-start sm:self-auto"
          >
            <span>Full Analytics & Graphs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Analytics Bar Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ads Watched (7d)
            </span>
            <div className="text-xl sm:text-2xl font-black text-white ">
              {loading ? '...' : (adsAnalytics?.summary?.total_ads_watched ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              {(adsAnalytics?.summary?.all_time_ads_watched ?? 0).toLocaleString()} all-time
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              User Payouts (7d)
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 ">
              ৳{loading ? '...' : (adsAnalytics?.summary?.total_earned_bdt ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-400 font-semibold block">
              ৳{(adsAnalytics?.summary?.all_time_earned_bdt ?? 0).toLocaleString()} all-time
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Watchers
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-300 ">
              {loading ? '...' : (adsAnalytics?.summary?.active_users ?? 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-sky-400 font-semibold block">
              Active premium members
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Avg Ads / User
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-300 ">
              {loading ? '...' : (adsAnalytics?.summary?.avg_ads_per_user ?? 0)}
            </div>
            <span className="text-[10px] text-purple-400 font-semibold block">
              Per active watcher
            </span>
          </div>
        </div>

        {/* Mini 7-Day Trend Visual Bars */}
        {adsAnalytics?.chart_data && adsAnalytics.chart_data.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-emerald-800/40">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>7-Day Activity Distribution</span>
              <span className="text-emerald-400 ">
                {adsAnalytics.chart_data.reduce((acc: number, c: any) => acc + c.ads_count, 0)} Total Impressions
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 h-10 items-end">
              {adsAnalytics.chart_data.map((day: any, idx: number) => {
                const maxVal = Math.max(
                  ...adsAnalytics.chart_data.map((d: any) => d.ads_count),
                  1,
                );
                const heightPercent = Math.max(15, Math.round((day.ads_count / maxVal) * 100));
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer"
                    title={`${day.label}: ${day.ads_count} ads, ৳${day.total_earned} earned`}
                  >
                    <div
                      className="w-full rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-amber-500 group-hover:to-amber-300 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] text-slate-400 font-bold mt-1 truncate max-w-full">
                      {day.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>


      {/* Commission Matrix Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Commission Matrix
        </span>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-slate-900">Multi-Level Rules</p>
              <p className="text-xs font-bold text-slate-500">Configure payout levels & percentages</p>
            </div>
          </div>

          <Link
            href="/admin/commissions"
            className="bg-[#01281a] hover:bg-[#023c28] text-amber-200 border border-[#d4af37]/40 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1 shrink-0 transition-colors shadow-md"
          >
            <span>Configure</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { href: '/admin/ads-analytics', icon: BarChart3, label: 'Ads Analytics', desc: 'Watch & earn graphs' },
            { href: '/admin/premium', icon: Crown, label: 'VIP Packages', desc: 'Membership tiers & limits' },
            { href: '/admin/notices', icon: Megaphone, label: 'Notice Board', desc: 'Post announcements' },
            { href: '/admin/coins', icon: Coins, label: 'Coin Rate', desc: 'Market rates & sales' },
            { href: '/admin/investments', icon: TrendingUp, label: 'Investments', desc: 'Plans & returns' },
            { href: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'Top 100 rankings' },
            { href: '/admin/users', icon: Users, label: 'Users', desc: 'Members directory' },
            { href: '/admin/designations', icon: Award, label: 'Designations', desc: 'Rank & star badges' },
            { href: '/admin/withdrawals', icon: Wallet, label: 'Withdrawals', desc: 'Pending payouts' },
            { href: '/admin/commissions', icon: Layers, label: 'Commissions', desc: 'Multi-level rules' },
            { href: '/admin/wallet', icon: DollarSign, label: 'Transaction Log', desc: 'System ' },
            { href: '/admin/settings', icon: Settings, label: 'Admin Profile', desc: 'Account credentials' },
            { href: '/admin/settings/global', icon: Globe, label: 'Global System', desc: 'Parameters & payouts' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all hover:border-[#d4af37] group shadow-2xs"
              >
                <div className="w-11 h-11 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] group-hover:scale-105 transition-all shadow-sm mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-900 group-hover:text-[#01281a] transition-colors leading-tight truncate max-w-full">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold truncate max-w-full mt-0.5">
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
