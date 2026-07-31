'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { ShieldCheck, Users, Wallet, Clock, ArrowUpRight, Award, Layers } from 'lucide-react';

export default function AdminDashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [usersRes, approvalsRes] = await Promise.all([
          apiFetch('/admin/users?limit=1', { isAdmin: true }),
          apiFetch('/admin/requests/pending', { isAdmin: true }),
        ]);

        const totalU = usersRes.meta?.total || 0;
        const pendingActivations = approvalsRes.activations?.length || 0;
        const pendingWithdrawals = approvalsRes.withdrawals?.length || 0;

        setStats({
          totalUsers: totalU,
          activeUsers: totalU, // dynamically estimated
          pendingApprovals: pendingActivations + pendingWithdrawals,
          totalBalance: 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (admin) fetchAdminStats();
  }, [admin]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold">Admin Control Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Welcome back, {admin?.email}. Manage users, approve withdrawals, and configure tree commissions.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</div>
          <Link href="/admin/users" className="text-xs font-bold text-sky-600 flex items-center">
            <span>Manage Users & Designations</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{stats.pendingApprovals}</div>
          <Link href="/admin/approvals" className="text-xs font-bold text-sky-600 flex items-center">
            <span>Review Pending Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Commission Matrix</span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-base font-bold text-slate-800">Multi-Level Rules</div>
          <Link href="/admin/commissions" className="text-xs font-bold text-sky-600 flex items-center">
            <span>Configure Payout Levels</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>

      {/* Admin Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <Link
          href="/admin/users"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-400 transition-colors"
        >
          <Users className="w-6 h-6 text-sky-600" />
          <span className="text-xs font-bold text-slate-800">Users List</span>
        </Link>

        <Link
          href="/admin/approvals"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-400 transition-colors"
        >
          <Clock className="w-6 h-6 text-amber-500" />
          <span className="text-xs font-bold text-slate-800">Approvals Queue</span>
        </Link>

        <Link
          href="/admin/commissions"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-400 transition-colors"
        >
          <Award className="w-6 h-6 text-purple-600" />
          <span className="text-xs font-bold text-slate-800">Commission Rules</span>
        </Link>

        <Link
          href="/admin/wallet"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-400 transition-colors"
        >
          <Wallet className="w-6 h-6 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800">Ledger & Adjust</span>
        </Link>
      </div>
    </div>
  );
}
