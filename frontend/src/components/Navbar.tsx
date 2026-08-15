'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Users,
  Award,
  Settings,
  DollarSign,
  Layers,
  TrendingUp,
  Trophy,
  UserCheck,
  Home,
  Info,
  PhoneCall,
  LogIn,
  UserPlus,
  Coins,
  Globe,
  Star,
  ChevronRight,
  Crown,
  CheckCircle2,
  Headset,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const { user, admin, logoutUser, logoutAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isPublicRoute = !isDashboardRoute && !isAdminRoute;

  const userItems = [
    { href: '/dashboard', label: 'Account Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/referral', label: 'Team Lead Report', icon: Users },
    { href: '/dashboard/coins', label: 'Coin', icon: Coins },
    { href: '/dashboard/investments', label: 'Investment', icon: TrendingUp },
    { href: '/dashboard/settings', label: 'Account Setting', icon: Settings },
    { href: '/contact', label: 'Support', icon: Headset },
  ];

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/investments/actions', label: 'Investment Actions', icon: UserCheck },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/approvals/activations', label: 'Approvals: Activations', icon: UserCheck },
    { href: '/admin/approvals/premium', label: 'Approvals: Premium', icon: Star },
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
    { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
  ];

  const publicItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Support', icon: Headset },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'EX';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = isAdminRoute
    ? admin?.phone || 'Admin Manager'
    : user?.full_name || user?.phone || 'Rasel Hossain';

  const initials = getInitials(displayName);
  const designation = isAdminRoute
    ? 'System Admin'
    : user?.designation?.name || 'Premium Member';

  const drawerContent = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex h-screen h-[100dvh] transition-opacity duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-gradient-to-b from-[#01281a] via-[#011f15] to-[#00170f] text-white w-80 max-w-[88vw] h-full flex flex-col p-4 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-[#d4af37]/35 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#053d29] shrink-0">
          <Link
            href={isAdminRoute ? '/admin/dashboard' : '/'}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-1"
          >
            <img
              src="/logo.png"
              alt="EarnX Capital"
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[#d4af37] hover:text-white rounded-xl bg-[#023322] border border-[#d4af37]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Profile Box in Drawer */}
        {(user || admin) && (
          <Link
            href={isAdminRoute ? '/admin/settings' : '/dashboard/settings'}
            onClick={() => setMobileMenuOpen(false)}
            className="mt-3 bg-[#023322]/80 border border-[#d4af37]/35 hover:border-[#d4af37] rounded-2xl p-3 flex items-center justify-between transition-all group shrink-0"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 rounded-full border-2 border-[#d4af37] bg-gradient-to-br from-[#044830] to-[#011c13] flex items-center justify-center text-[#d4af37] font-black text-sm shrink-0 shadow-md">
                {initials}
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                  {displayName}
                </span>

                <div className="flex items-center space-x-1 text-[#f5c542] text-xs font-semibold mt-0.5">
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{designation}</span>
                </div>

                <div className="flex items-center space-x-1 text-[#10b981] text-[11px] font-medium mt-0.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Verified Account</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#d4af37] shrink-0 ml-1" />
          </Link>
        )}

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-2 custom-scrollbar">
          {((isAdminRoute && admin) ? adminItems : (isDashboardRoute && user) ? userItems : publicItems).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (isActive) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-white via-[#fffdfa] to-[#f7eed6] text-slate-900 border border-[#e5c158] shadow-md shadow-amber-500/10 transition-all"
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
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl border-b border-[#053d29]/50 hover:bg-[#033c28]/60 transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl border border-[#d4af37]/60 bg-[#022e1f]/60 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] transition-colors">
                    <Icon className="w-4.5 h-4.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-sm text-slate-100 group-hover:text-amber-200 transition-colors truncate">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#d4af37]/70 group-hover:text-[#d4af37] shrink-0 ml-1.5" />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Promo Card */}
        <div className="border border-[#d4af37]/35 bg-gradient-to-b from-[#033221] to-[#011a12] rounded-2xl p-3 relative overflow-hidden shrink-0 shadow-lg mb-2">
          <div className="flex items-center justify-between">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="goldRimMob" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFE066" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#996515" />
                  </linearGradient>
                  <linearGradient id="goldInnerMob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5D77F" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                </defs>
                <ellipse cx="35" cy="70" rx="28" ry="14" fill="#503504" opacity="0.7" />
                <ellipse cx="35" cy="67" rx="28" ry="14" fill="url(#goldRimMob)" />
                <ellipse cx="35" cy="64" rx="24" ry="11" fill="url(#goldInnerMob)" />
                <ellipse cx="48" cy="38" rx="30" ry="30" fill="url(#goldRimMob)" />
                <ellipse cx="48" cy="38" rx="26" ry="26" fill="url(#goldInnerMob)" />
                <circle cx="48" cy="38" r="21" fill="none" stroke="#FFE066" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M38 28 L45 38 L37 48 H42 L48 40 L54 48 H59 L51 38 L58 28 H53 L48 35 L43 28 Z" fill="#FFE066" stroke="#805307" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="flex flex-col text-right pl-2 min-w-0">
              <span className="text-[#10b981] font-bold text-[11px] flex items-center justify-end gap-1">
                Grow Your Wealth <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-white font-black text-base leading-tight mt-0.5">
                With EarnX
              </span>
              <span className="text-slate-300 text-[10px] font-medium leading-tight truncate">
                Smart Investment Secure Future
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-2 border-t border-[#053d29] shrink-0 space-y-2">
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logoutUser();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#032e1f] hover:bg-rose-950/40 text-amber-200 hover:text-rose-300 rounded-xl font-bold text-xs border border-[#d4af37]/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          ) : admin ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logoutAdmin();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#032e1f] hover:bg-rose-950/40 text-amber-200 hover:text-rose-300 rounded-xl font-bold text-xs border border-[#d4af37]/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Admin</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-[#023322] text-amber-200 hover:text-white rounded-xl font-bold text-xs border border-[#d4af37]/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
    </div>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border-b border-[#d4af37]/30 shadow-md w-full text-white ${
          isAdminRoute || isDashboardRoute ? 'lg:hidden' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={isAdminRoute ? '/admin/dashboard' : '/'} className="flex items-center space-x-1 group">
                <img
                  src="/logo.png"
                  alt="EarnX Capital"
                  className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links for Public Routes */}
            {isPublicRoute && (
              <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <Link
                  href="/"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/about'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/dashboard/coins"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/dashboard/coins'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  EarnX Coin
                </Link>
                <Link
                  href="/dashboard/investments"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/dashboard/investments'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  Investment
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/dashboard/leaderboard'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  Leaderboard
                </Link>
                <Link
                  href="/contact"
                  className={`text-xs sm:text-sm font-bold transition-colors ${
                    pathname === '/contact'
                      ? 'text-[#f3ba2f] border-b-2 border-[#f3ba2f] pb-0.5'
                      : 'text-slate-200 hover:text-[#f3ba2f]'
                  }`}
                >
                  Support
                </Link>
              </nav>
            )}

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="h-9 w-24 bg-emerald-950/60 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  {/* Balance Badge */}
                  <div className="flex bg-[#023322] border border-[#d4af37]/40 px-3 py-1.5 rounded-xl items-center space-x-1.5">
                    <Wallet className="w-4 h-4 text-[#f3ba2f]" />
                    <span className="text-xs font-black text-amber-200 font-mono">
                      ৳{Number(user.wallet_balance || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Public link to dashboard */}
                  {isPublicRoute && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-950" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : admin ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-200 bg-[#023322] border border-[#d4af37]/40 px-3 py-1 rounded-xl hidden sm:inline">
                    Admin: {admin.phone}
                  </span>
                  {isPublicRoute && (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-[#f3ba2f] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#f3ba2f] bg-[#023322] border border-[#d4af37]/35 hover:bg-[#03442e] transition-colors"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Render Mobile Drawer via Portal */}
      {mounted && drawerContent ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
