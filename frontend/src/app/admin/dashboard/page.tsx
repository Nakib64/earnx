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
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      const [usersRes, approvalsRes] = await Promise.all([
        apiFetch<any>('/admin/users?limit=1', { isAdmin: true }),
        apiFetch<any>('/admin/requests/pending', { isAdmin: true }),
      ]);

      const totalU = usersRes.success && usersRes.data ? (usersRes.data.meta?.total || usersRes.data.length || 0) : 0;
      const pendingActivations = approvalsRes.success && approvalsRes.data ? (approvalsRes.data.activations?.length || 0) : 0;
      const pendingWithdrawals = approvalsRes.success && approvalsRes.data ? (approvalsRes.data.withdrawals?.length || 0) : 0;

      setStats({
        totalUsers: totalU,
        pendingApprovals: pendingActivations + pendingWithdrawals,
      });
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
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Admin Control Center
            </h1>
            <p className="text-xs text-slate-300 font-semibold">
              Welcome back, <strong className="text-[#f3ba2f] font-mono">{admin?.phone}</strong>. Manage users, approve requests, and configure tree commissions.
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
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
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

        {/* Card 2: Pending Approvals */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest">
            Pending Approvals
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-100 font-mono tracking-tight">
                {loading ? '...' : stats.pendingApprovals}
              </div>
              <div className="text-xs font-bold text-amber-300">
                Awaiting Review
              </div>
            </div>
          </div>

          <Link
            href="/admin/approvals/activations"
            className="w-full bg-[#3d2705] hover:bg-[#4d3207] text-amber-200 border border-amber-500/40 font-extrabold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Review Queue</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>
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
            { href: '/admin/notices', icon: Megaphone, label: 'Notice Board', desc: 'Post announcements' },
            { href: '/admin/coins', icon: Coins, label: 'Coin Rate', desc: 'Market rates & sales' },
            { href: '/admin/investments', icon: TrendingUp, label: 'Investments', desc: 'Plans & returns' },
            { href: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'Top 100 rankings' },
            { href: '/admin/users', icon: Users, label: 'Users', desc: 'Members directory' },
            { href: '/admin/designations', icon: Award, label: 'Designations', desc: 'Rank & star badges' },
            { href: '/admin/approvals/activations', icon: UserCheck, label: 'Approvals', desc: 'Pending approvals' },
            { href: '/admin/commissions', icon: Layers, label: 'Commissions', desc: 'Multi-level rules' },
            { href: '/admin/wallet', icon: DollarSign, label: 'Transaction Log', desc: 'System ledger' },
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
