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
  const { user, admin, logoutAdmin, logoutUser } = useAuth();

  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isApprovalsSection = pathname?.startsWith('/admin/approvals');

  // Default open when already on an approvals sub-route
  const [approvalsOpen, setApprovalsOpen] = useState(!!isApprovalsSection);

  // Hide sidebar on public pages, or if user/admin isn't logged in for their respective section
  if (isAdminRoute && !admin) return null;
  if (isDashboardRoute && !user) return null;
  if (!isDashboardRoute && !isAdminRoute) return null;


  const userItems: LinkItem[] = [
    { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/dashboard/coins', label: 'Coins Wallet', icon: Coins },
    { href: '/dashboard/investments', label: 'Invest & Grow', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/referral', label: 'Referral Tree Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet & Ledger', icon: Wallet },
    { href: '/dashboard/offers', label: 'Offers & Tasks', icon: Gift },
  ];

  const adminTopItems: LinkItem[] = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/settings', label: 'Global Settings', icon: Settings },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
  ];

  const approvalItems: LinkItem[] = [
    { href: '/admin/approvals/activations', label: 'Activations', icon: UserCheck, accentClass: 'text-sky-500' },
    { href: '/admin/approvals/premium', label: 'Premium Upgrades', icon: Star, accentClass: 'text-amber-500' },
    { href: '/admin/approvals/withdrawals', label: 'Withdrawals', icon: DollarSign, accentClass: 'text-emerald-500' },
  ];

  const adminBottomItems: LinkItem[] = [
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
    { href: '/admin/offers', label: 'Manage Offers', icon: Gift },
  ];


  const renderLink = (item: LinkItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center space-x-3 py-2.5 rounded-none font-medium text-xs transition-all ${
          isChild ? 'pl-7 pr-3.5' : 'px-3.5'
        } ${
          isActive
            ? 'bg-[#005A36] text-white border-l-4 border-[#D4AF37] shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon
          className={`w-4 h-4 shrink-0 ${
            isActive ? 'text-[#D4AF37]' : item.accentClass || 'text-slate-400'
          }`}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 p-4 space-y-5 overflow-y-auto z-10 h-screen sticky top-0 rounded-none`}
    >
      {/* Brand Header */}
      <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 shrink-0">
        <div className="w-9 h-9 rounded-none bg-[#005A36] border-b-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-black text-lg shadow-xs">
          X
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight text-[#005A36]">
            Earn<span className="text-[#D4AF37]">X</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 -mt-1 uppercase tracking-widest">
            {isAdminRoute ? 'Admin Portal' : 'Capital Ecosystem'}
          </span>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-none p-3 flex items-center space-x-3 shrink-0">
        <div className="w-8 h-8 rounded-none bg-[#005A36] flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
          {isAdminRoute ? 'A' : 'U'}
        </div>
        <div className="flex flex-col overflow-hidden flex-1">
          <span className="text-xs font-bold text-slate-800 truncate">
            {isAdminRoute ? 'Admin Control' : user?.full_name || user?.phone}
          </span>
          <span className="text-[10px] font-semibold text-[#005A36] truncate">
            {isAdminRoute ? admin?.phone : user?.designation?.name || 'Starter Member'}
          </span>
        </div>
        {isDashboardRoute && user && (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-none shrink-0 font-mono">
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

            {/* ── Approvals Queue Group (collapsible) ── */}
            <div className="pt-1 pb-0.5">
              {/* Clickable toggle header */}
              <button
                onClick={() => setApprovalsOpen(o => !o)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-none text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  isApprovalsSection
                    ? 'text-[#005A36] bg-emerald-50/70 border-l-2 border-[#005A36]'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <UserCheck className="w-3.5 h-3.5 shrink-0 text-[#005A36]" />
                  <span>Approvals Queue</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    approvalsOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              {/* Indented children */}
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
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-none font-bold text-xs transition-colors border border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
