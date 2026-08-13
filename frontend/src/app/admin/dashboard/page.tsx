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

      {/* Welcome Banner — matches green banner from coins page */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-2">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Admin Control Center
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Welcome back, <strong className="text-secondary font-mono">{admin?.phone}</strong>. Manage users, approve requests, and configure tree commissions.
            </p>
          </div>
        </div>
      </div>

      {/* Top 2 Metric Cards — matches coins page grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {/* Card 1: Registered Users */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Registered Users
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-primary">Total Members</div>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="w-full bg-emerald-100/60 hover:bg-emerald-100 text-primary font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Manage Users</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Pending Approvals
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-4xl font-black text-[#854D0E] font-mono tracking-tight">
                {loading ? '...' : stats.pendingApprovals}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#854D0E]">
                Awaiting Review
              </div>
            </div>
          </div>

          <Link
            href="/admin/approvals"
            className="w-full bg-[#FFF0E5] hover:bg-[#FFE5D2] text-[#854D0E] font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Review Queue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Commission Matrix Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          Commission Matrix
        </span>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-slate-900">Multi-Level Rules</p>
              <p className="text-xs font-medium text-slate-500">Configure payout levels & percentages</p>
            </div>
          </div>

          <Link
            href="/admin/commissions"
            className="bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200/80 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
          >
            <span>Configure</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid (2 Columns on Mobile with prominent Icons) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { href: '/admin/coins', icon: Coins, label: 'Coin Rate', desc: 'Market rates & sales' },
            { href: '/admin/investments', icon: TrendingUp, label: 'Investments', desc: 'Plans & returns' },
            { href: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'Top 100 rankings' },
            { href: '/admin/users', icon: Users, label: 'Users', desc: 'Members directory' },
            { href: '/admin/designations', icon: Award, label: 'Designations', desc: 'Rank & star badges' },
            { href: '/admin/approvals', icon: UserCheck, label: 'Approvals', desc: 'Pending approvals' },
            { href: '/admin/commissions', icon: Layers, label: 'Commissions', desc: 'Multi-level rules' },
            { href: '/admin/wallet', icon: DollarSign, label: 'Transaction Log', desc: 'System ledger' },
            { href: '/admin/settings', icon: Settings, label: 'Admin Profile', iconColor: 'text-[#005A36]', desc: 'Account credentials' },
            { href: '/admin/settings/global', icon: Globe, label: 'Global System', desc: 'Parameters & payouts' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:border-emerald-300 group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary group-hover:bg-[#005A36] group-hover:text-white transition-all shadow-2xs mb-2.5">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#005A36] transition-colors leading-tight truncate max-w-full">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-full mt-0.5">
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
