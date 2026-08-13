'use client';

import React, { useState } from 'react';
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
  LogOut,
  Star,
  ChevronDown,
  Coins,
  Globe,
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
  const isApprovalsSection = pathname?.startsWith('/admin/approvals');

  // Default open when already on an approvals sub-route
  const [approvalsOpen, setApprovalsOpen] = useState(!!isApprovalsSection);

  // Hide sidebar on public pages, or if user/admin isn't logged in for their respective section (only after auth loading completes)
  if (isAdminRoute && !admin && !isLoading && !adminToken) return null;
  if (isDashboardRoute && !user && !isLoading && !userToken) return null;
  if (!isDashboardRoute && !isAdminRoute) return null;

  const userItems: LinkItem[] = [
    { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/dashboard/coins', label: 'Coins Wallet', icon: Coins },
    { href: '/dashboard/investments', label: 'Invest & Grow', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/referral', label: 'Referral Tree Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet & Ledger', icon: Wallet },
    { href: '/dashboard/settings', label: 'Profile Settings', icon: Settings },
  ];

  const adminTopItems: LinkItem[] = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/investments/actions', label: 'Investment Actions', icon: UserCheck },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
    { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
  ];

  const approvalItems: LinkItem[] = [
    { href: '/admin/approvals/activations', label: 'Activations', icon: UserCheck, accentClass: 'text-primary' },
    { href: '/admin/approvals/premium', label: 'Premium Upgrades', icon: Star, accentClass: 'text-[#854D0E]' },
  ];

  const adminBottomItems: LinkItem[] = [
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
  ];

  const renderLink = (item: LinkItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center space-x-3 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
          isChild ? 'pl-7 pr-3.5' : 'px-3.5'
        } ${
          isActive
            ? 'bg-[#005A36] text-white shadow-sm shadow-emerald-950/20 font-black'
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? 'text-secondary' : item.accentClass || 'text-slate-400'
          }`}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 p-4 space-y-4 overflow-y-auto z-20 h-screen sticky top-0">
      {/* Brand Header */}
      <Link href={isAdminRoute ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 shrink-0 group">
        <img
          src="/logo.png"
          alt="EarnX Capital"
          className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      {/* Role Indicator Banner */}
      <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-3 flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#005A36] flex items-center justify-center text-secondary font-black text-xs shrink-0">
          {isAdminRoute ? 'A' : 'U'}
        </div>
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="text-xs font-extrabold text-slate-900 truncate">
            {isAdminRoute ? 'Admin Control' : user?.full_name || user?.phone}
          </span>
          <span className="text-[10px] font-bold text-primary truncate">
            {isAdminRoute ? admin?.phone : user?.designation?.name || 'Member'}
          </span>
        </div>
        {isDashboardRoute && user && (
          <span className="text-[10px] font-extrabold text-primary bg-emerald-100/80 border border-emerald-200/80 px-2 py-0.5 rounded-lg shrink-0 font-mono">
            ৳{Number(user.wallet_balance || 0).toFixed(0)}
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {isAdminRoute ? (
          <>
            {/* Top admin links */}
            {adminTopItems.map((item) => renderLink(item))}

            {/* Approvals Queue Group (collapsible) */}
            <div className="pt-1 pb-0.5">
              <button
                onClick={() => setApprovalsOpen((o) => !o)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  isApprovalsSection
                    ? 'text-primary bg-emerald-50/70 border-l-2 border-primary'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center space-x-2 truncate">
                  <UserCheck className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="truncate">Approvals Queue</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    approvalsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  approvalsOpen ? 'max-h-40 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-0.5">
                  {approvalItems.map((item) => renderLink(item, true))}
                </div>
              </div>
            </div>

            {/* Bottom admin links */}
            {adminBottomItems.map((item) => renderLink(item))}
          </>
        ) : (
          userItems.map((item) => renderLink(item))
        )}
      </nav>

      {/* Sidebar Footer with Logout button */}
      <div className="pt-3 border-t border-slate-100 shrink-0">
        <button
          onClick={() => {
            if (isAdminRoute) logoutAdmin();
            else logoutUser();
          }}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-extrabold text-xs transition-colors border border-rose-200/80 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
