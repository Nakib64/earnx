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

    { href: '/about', label: 'About Us', icon: Info },
    { href: '/contact', label: 'Contact', icon: Headset },
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

  const drawerContent = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex h-screen h-[100dvh] transition-opacity duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white text-slate-900 w-72 max-w-[80vw] h-full flex flex-col p-5 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-slate-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <Link
            href={isAdminRoute ? '/admin/dashboard' : '/'}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-1"
          >
            <img
              src="/logo.png"
              alt="EarnX Capital"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User / Profile Box in Drawer */}
        {(user || admin) && (
          <Link
            href={isAdminRoute ? '/admin/settings' : '/dashboard/settings'}
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between group shrink-0"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#01281a] text-[#f3ba2f] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {initials}
              </div>

              <div className="flex flex-col min-w-0 justify-center">
                <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#01281a] transition-colors truncate">
                  {isAdminRoute ? (admin?.name || displayName) : displayName}
                </span>

                {!isAdminRoute && (
                  user?.is_premium || user?.designation?.name ? (
                    <div className="flex items-center space-x-1 text-amber-600 text-[11px] font-bold mt-0.5">
                      <Crown className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {user?.is_premium ? 'Premium Member' : user?.designation?.name}
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

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
          </Link>
        )}

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto py-4">
          {((isAdminRoute && admin) ? adminItems : (isDashboardRoute && user) ? userItems : publicItems).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (isActive) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-[#01281a] font-extrabold text-sm border border-emerald-200"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#01281a] text-white flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#f3ba2f]" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#01281a] shrink-0" />
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-[#01281a] group-hover:text-[#f3ba2f] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="group-hover:text-[#01281a] transition-colors truncate">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#01281a] shrink-0" />
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-slate-200 shrink-0 space-y-2">
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logoutUser();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
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
              className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Admin</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-3 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-3 bg-[#01281a] text-white hover:bg-[#023c28] font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#f3ba2f]" />
                <span>Join Now</span>
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
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs w-full text-slate-800 transition-all ${
          isAdminRoute || isDashboardRoute ? 'lg:hidden' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
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
                  className={`text-sm font-bold transition-colors ${
                    pathname === '/'
                      ? 'text-[#01281a] border-b-2 border-[#01281a] pb-1'
                      : 'text-slate-600 hover:text-[#01281a]'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-bold transition-colors ${
                    pathname === '/about'
                      ? 'text-[#01281a] border-b-2 border-[#01281a] pb-1'
                      : 'text-slate-600 hover:text-[#01281a]'
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`text-sm font-bold transition-colors ${
                    pathname === '/contact'
                      ? 'text-[#01281a] border-b-2 border-[#01281a] pb-1'
                      : 'text-slate-600 hover:text-[#01281a]'
                  }`}
                >
                  Contact
                </Link>
              </nav>
            )}

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  {isPublicRoute && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#01281a] hover:bg-[#023c28] text-white rounded-xl font-bold text-xs shadow-md transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#f3ba2f]" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : admin ? (
                <div className="flex items-center space-x-2">
                  {isPublicRoute && (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#01281a] hover:bg-[#023c28] text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#f3ba2f]" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-[#01281a] border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
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
