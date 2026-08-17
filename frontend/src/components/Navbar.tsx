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
  ChevronDown,
  ShoppingBag,
  Megaphone,
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
    { href: '/dashboard/purchase', label: 'Purchase Package', icon: ShoppingBag },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
    { href: '/dashboard/referral', label: 'Team Lead Report', icon: Users },
    { href: '/dashboard/coins', label: 'Coin', icon: Coins },
    { href: '/dashboard/investments', label: 'Investment', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/settings', label: 'Account Setting', icon: Settings },
    { href: '/contact', label: 'Support', icon: Headset },
  ];

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/notices', label: 'Notice Board', icon: Megaphone },
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
        className={`bg-gradient-to-b from-[#01281a] via-[#011f15] to-[#00170f] text-white w-68 sm:w-72 max-w-[75vw] h-full flex flex-col p-4 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-[#d4af37]/35 ${
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
              className="h-8 sm:h-9 w-auto object-contain bg-white rounded-lg px-2.5 py-1 shadow-sm"
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
                  className="h-9 sm:h-10 w-auto object-contain bg-white rounded-lg px-3 py-1 shadow-sm transition-transform group-hover:scale-105"
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
