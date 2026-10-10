'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wallet,
  UserCheck,
  Award,
  Settings,
  DollarSign,
  Layers,
  TrendingUp,
  Trophy,
  LogOut,
  ChevronRight,
  Coins,
  Globe,
  Headset,
  Crown,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Megaphone,
  Banknote,
  Lock,
  ArrowDownCircle,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type LinkItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  accentClass?: string;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, admin, userToken, adminToken, isLoading, logoutAdmin, logoutUser } = useAuth();

  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');

  // Hide sidebar on public pages (only show on /dashboard or /admin when authenticated)
  if (!isDashboardRoute && !isAdminRoute) {
    return null;
  }

  if (isDashboardRoute && !userToken) {
    return null;
  }

  if (isAdminRoute && !adminToken) {
    return null;
  }

  const userItems: LinkItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/purchase', label: 'Package Purchase', icon: ShoppingBag },
    { href: '/dashboard/deposit', label: 'Deposit Funds', icon: ArrowDownCircle },
    { href: '/dashboard/premium', label: 'Premium VIP & Ads', icon: Crown },
    { href: '/dashboard/marketplace', label: 'Community Feed', icon: MessageSquare },
    { href: '/dashboard/wallet', label: 'Cash Wallet', icon: Wallet },
    { href: '/dashboard/coins', label: 'Solana Coin Hub', icon: Coins },
    { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
    { href: '/dashboard/referral', label: 'Affiliate Team', icon: Users },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/settings', label: 'Account Settings', icon: Settings },
    { href: '/contact', label: 'Support Desk', icon: Headset },
  ];

  const adminTopItems: LinkItem[] = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/ads-analytics', label: 'Ads Analytics', icon: BarChart3 },
    { href: '/admin/deposits', label: 'Deposit Requests', icon: ArrowDownCircle },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
    { href: '/admin/premium', label: 'Premium Packages', icon: Crown },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/notices', label: 'Notice Board', icon: Megaphone },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/users', label: 'Users & Accounts', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
    { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
  ];



  const adminBottomItems: LinkItem[] = [
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: ' & Adjustments', icon: DollarSign },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'EX';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderItem = (item: LinkItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/dashboard');
    const lockedRoutes = ['/dashboard/investments', '/dashboard/coins', '/dashboard/marketplace'];
    const isLocked = !isAdminRoute && !user?.is_premium && lockedRoutes.includes(item.href);
    const isPurchase = item.href === '/dashboard/purchase';

    if (isActive) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-950 border border-emerald-500/30 shadow-sm transition-all duration-200 ${isChild ? 'ml-3' : ''
            }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-sm text-emerald-950 tracking-tight truncate">
              {item.label}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 ml-1.5">
            {isPurchase && (
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                BUY
              </span>
            )}
            {isLocked ? (
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center justify-between p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-150 group ${isChild ? 'ml-3' : ''
          }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
            <Icon className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
          </div>
          <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors truncate">
            {item.label}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0 ml-1.5">
          {isPurchase && (
            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              BUY
            </span>
          )}
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0 transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
          )}
        </div>
      </Link>
    );
  };

  const displayName = isAdminRoute
    ? admin?.phone || 'Admin Manager'
    : user?.full_name || user?.phone || '';

  const initials = getInitials(displayName);

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white/70 backdrop-blur-2xl border-r border-white/80 p-3.5 space-y-3 overflow-y-auto z-20 h-screen sticky top-0 shadow-[0_8px_30px_rgb(0,0,0,0.03)] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden specular-rim select-none">
      {/* Brand Header Logo */}
      <Link href={isAdminRoute ? '/admin/dashboard' : '/dashboard'} className="flex items-center justify-center pt-1 pb-2 shrink-0 group">
        <img
          src="/logo.png"
          alt="EarnX Capital"
          className="h-10 w-auto object-contain bg-white rounded-xl px-3 py-1 shadow-xs border border-slate-200/80 transition-transform group-hover:scale-105"
        />
      </Link>

      {/* User / Admin Profile Banner Card */}
      <Link
        href={isAdminRoute ? '/admin/settings' : '/dashboard/settings'}
        className="bg-white/80 hover:bg-white border border-white/95 shadow-sm rounded-2xl p-2.5 flex items-center justify-between transition-all duration-200 group shrink-0 specular-rim"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar with Emerald border */}
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 bg-emerald-50 flex items-center justify-center text-emerald-800 font-black text-sm shrink-0 shadow-xs">
            {initials}
          </div>

          <div className="flex flex-col min-w-0 justify-center">
            <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {isAdminRoute ? (admin?.name || displayName) : displayName}
            </span>

            {/* Status & Designation Line */}
            {!isAdminRoute && (
              user?.is_premium || user?.designation?.name ? (
                <div className="flex items-center space-x-1 text-emerald-700 text-[11px] font-bold mt-0.5">
                  <Crown className="w-3 h-3 shrink-0 text-amber-500" />
                  <span className="truncate">
                    {user?.is_premium ? 'Premium VIP' : user?.designation?.name}
                  </span>
                </div>
              ) : user?.status === 'ACTIVE' ? (
                <div className="flex items-center space-x-1 text-emerald-600 text-[11px] font-bold mt-0.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">Active Member</span>
                </div>
              ) : null
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {isAdminRoute ? (
          <>
            {adminTopItems.map((item) => renderItem(item))}
            {adminBottomItems.map((item) => renderItem(item))}
          </>
        ) : (
          userItems.map((item) => renderItem(item))
        )}
      </nav>

      {/* Logout Action */}
      <div className="pt-1 shrink-0">
        <button
          onClick={() => {
            if (isAdminRoute) logoutAdmin();
            else logoutUser();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/70 hover:bg-rose-50 hover:text-rose-600 text-slate-600 hover:border-rose-200 rounded-xl font-bold text-xs transition-colors border border-slate-200/80 cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
