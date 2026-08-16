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
  Star,
  ChevronDown,
  ChevronRight,
  Coins,
  Globe,
  Headset,
  Crown,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Megaphone,
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

  const [approvalsOpen, setApprovalsOpen] = useState(!!isApprovalsSection);

  // Hide sidebar on public pages, or if user/admin isn't logged in
  if (isAdminRoute && !admin && !isLoading && !adminToken) return null;
  if (isDashboardRoute && !user && !isLoading && !userToken) return null;
  if (!isDashboardRoute && !isAdminRoute) return null;

  const userItems: LinkItem[] = [
    { href: '/dashboard', label: 'Account Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/purchase', label: 'Purchase Package', icon: ShoppingBag },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/referral', label: 'Team Lead Report', icon: Users },
    { href: '/dashboard/coins', label: 'Coin', icon: Coins },
    { href: '/dashboard/investments', label: 'Investment', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/settings', label: 'Account Setting', icon: Settings },
    { href: '/contact', label: 'Support', icon: Headset },
  ];

  const adminTopItems: LinkItem[] = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/notices', label: 'Notice Board', icon: Megaphone },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/investments/actions', label: 'Investment Actions', icon: UserCheck },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
    { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
  ];

  const approvalItems: LinkItem[] = [
    { href: '/admin/approvals/activations', label: 'Activations', icon: UserCheck },
    { href: '/admin/approvals/premium', label: 'Premium Upgrades', icon: Star },
  ];

  const adminBottomItems: LinkItem[] = [
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
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

    if (isActive) {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-white via-[#fffdfa] to-[#f7eed6] text-slate-900 border border-[#e5c158] shadow-md shadow-amber-500/10 transition-all duration-200 ${
            isChild ? 'ml-3' : ''
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl border border-[#dfa836] bg-amber-500/10 flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-[#dfa836]" />
            </div>
            <span className="font-extrabold text-sm text-[#0d0d0d] tracking-tight truncate">{item.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#dfa836] shrink-0 ml-1.5" />
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center justify-between p-2.5 rounded-xl border-b border-[#053d29]/50 hover:bg-[#033c28]/60 transition-all duration-200 group ${
          isChild ? 'ml-3' : ''
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl border border-[#d4af37]/60 bg-[#022e1f]/60 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] transition-colors">
            <Icon className="w-4.5 h-4.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
          </div>
          <span className="font-bold text-sm text-slate-100 group-hover:text-amber-200 transition-colors truncate">
            {item.label}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#d4af37]/70 group-hover:text-[#d4af37] shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  };

  const displayName = isAdminRoute
    ? admin?.phone || 'Admin Manager'
    : user?.full_name || user?.phone || 'Rasel Hossain';

  const initials = getInitials(displayName);
  const designation = isAdminRoute
    ? 'System Admin'
    : user?.designation?.name || 'Premium Member';

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-gradient-to-b from-[#01281a] via-[#011f15] to-[#00170f] border-r border-[#d4af37]/30 p-3.5 space-y-3 overflow-y-auto z-20 h-screen sticky top-0 shadow-2xl custom-scrollbar">
      {/* Brand Header Logo */}
      <Link href={isAdminRoute ? '/admin/dashboard' : '/dashboard'} className="flex items-center justify-center pt-1 pb-2 shrink-0 group">
        <img
          src="/logo.png"
          alt="EarnX Capital"
          className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      {/* User / Admin Profile Banner Card */}
      <Link
        href={isAdminRoute ? '/admin/settings' : '/dashboard/settings'}
        className="bg-[#023322]/80 border border-[#d4af37]/35 hover:border-[#d4af37] rounded-2xl p-2.5 flex items-center justify-between transition-all duration-200 group shrink-0"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          {/* Avatar with Gold border */}
          <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] bg-gradient-to-br from-[#044830] to-[#011c13] flex items-center justify-center text-[#d4af37] font-black text-sm shrink-0 shadow-md">
            {initials}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors truncate">
              {displayName}
            </span>

            {/* Premium Member / Designation */}
            <div className="flex items-center space-x-1 text-[#f5c542] text-[11px] font-bold mt-0.5">
              <Crown className="w-3 h-3 shrink-0" />
              <span className="truncate">{designation}</span>
            </div>

            {/* Verification Status */}
            <div className="flex items-center space-x-1 text-[#10b981] text-[10px] font-bold mt-0.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-[#d4af37] group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto pr-0.5 custom-scrollbar">
        {isAdminRoute ? (
          <>
            {adminTopItems.map((item) => renderItem(item))}

            {/* Approvals Queue Collapsible */}
            <div className="py-0.5">
              <button
                onClick={() => setApprovalsOpen((o) => !o)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border-b border-[#053d29]/50 hover:bg-[#033c28]/60 text-slate-100 transition-all cursor-pointer ${
                  isApprovalsSection ? 'bg-[#033c28]/80 text-amber-300' : ''
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl border border-[#d4af37]/50 bg-[#022e1f]/60 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <span className="font-medium text-sm truncate">Approvals Queue</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#d4af37] transition-transform duration-200 ${
                    approvalsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  approvalsOpen ? 'max-h-48 opacity-100 mt-1 space-y-1' : 'max-h-0 opacity-0'
                }`}
              >
                {approvalItems.map((item) => renderItem(item, true))}
              </div>
            </div>

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
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#032e1f] hover:bg-rose-950/40 text-amber-200 hover:text-rose-300 rounded-xl font-bold text-xs transition-colors border border-[#d4af37]/30 hover:border-rose-500/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
