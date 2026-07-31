'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Gift,
  UserCheck,
  Award,
  Settings,
  DollarSign,
  Layers,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, admin } = useAuth();

  const isAdminRoute = pathname?.startsWith('/admin');

  const userItems = [
    { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/dashboard/investments', label: 'Invest & Grow', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/referral', label: 'Referral Tree Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet & Ledger', icon: Wallet },
    { href: '/dashboard/offers', label: 'Offers & Tasks', icon: Gift },
    { href: '/dashboard/approvals', label: 'Downline Approvals', icon: UserCheck },
  ];

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/settings', label: 'Global Settings', icon: Settings },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/approvals', label: 'Pending Approvals Queue', icon: UserCheck },
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
    { href: '/admin/offers', label: 'Manage Offers', icon: Gift },
  ];

  const items = isAdminRoute ? adminItems : userItems;

  if (!user && !admin) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* Role Indicator Banner */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg sky-gradient-bg flex items-center justify-center text-white font-bold text-sm">
          {isAdminRoute ? 'A' : 'U'}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-bold text-slate-800 truncate">
            {isAdminRoute ? 'Admin Control' : user?.full_name || user?.phone}
          </span>
          <span className="text-[10px] font-semibold text-sky-600 truncate">
            {isAdminRoute ? admin?.email : user?.designation?.name || 'Starter Member'}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
