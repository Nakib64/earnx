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
  Gift,
  UserCheck,
  Home,
  Info,
  PhoneCall,
  LogIn,
  UserPlus,
  Coins,
  Globe,
  Star,
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
    { href: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/dashboard/coins', label: 'Coins Wallet', icon: Coins },
    { href: '/dashboard/investments', label: 'Invest & Grow', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/referral', label: 'Referral Tree Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet & Ledger', icon: Wallet },
    { href: '/dashboard/settings', label: 'Profile Settings', icon: Settings },
  ];

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/investments/actions', label: 'Investment Actions', icon: UserCheck },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
    { href: '/admin/settings/global', label: 'Global Settings', icon: Globe },
    { href: '/admin/users', label: 'Users & Designations', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/approvals', label: 'Pending Approvals Queue', icon: UserCheck },
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: 'Ledger & Adjustments', icon: DollarSign },
  ];

  const publicItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/contact', label: 'Contact Us', icon: PhoneCall },
  ];

  const drawerContent = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex h-screen h-[100dvh] transition-opacity duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white w-72 max-w-[85vw] h-full flex flex-col p-4 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <Link href={isAdminRoute ? '/admin/dashboard' : '/'} onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="EarnX Capital"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-3">
          {((isAdminRoute && admin) ? adminItems : (isDashboardRoute && user) ? userItems : publicItems).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isApprovals = item.href === '/admin/approvals';

            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#005A36] text-white shadow-sm font-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>

                {/* Approvals Subitems in Mobile Menu */}
                {isApprovals && isAdminRoute && (
                  <div className="pl-6 space-y-0.5 border-l-2 border-slate-100 my-1">
                    {[
                      { href: '/admin/approvals/activations', label: 'Activations', icon: UserCheck },
                      { href: '/admin/approvals/premium', label: 'Premium Upgrades', icon: Star },
                    ].map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                            isSubActive
                              ? 'bg-[#005A36] text-white shadow-sm font-black'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-secondary' : 'text-slate-400'}`} />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-secondary" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-extrabold text-xs transition-colors border border-rose-200/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : admin ? (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4 text-secondary" />
                <span>Admin Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutAdmin();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-extrabold text-xs transition-colors border border-rose-200/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Admin</span>
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-extrabold text-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-[#005A36] text-white hover:bg-[#044D2F] font-extrabold text-xs rounded-xl shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-secondary" />
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
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-xs w-full ${
          isAdminRoute || isDashboardRoute ? 'lg:hidden' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={isAdminRoute ? '/admin/dashboard' : '/'} className="flex items-center space-x-2.5 group">
                <img
                  src="/logo.png"
                  alt="EarnX Capital"
                  className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links for Public Routes */}
            {isPublicRoute && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className={`text-xs sm:text-sm font-extrabold transition-colors ${
                    pathname === '/'
                      ? 'text-primary font-black border-b-2 border-secondary pb-0.5'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`text-xs sm:text-sm font-extrabold transition-colors ${
                    pathname === '/about'
                      ? 'text-primary font-black border-b-2 border-secondary pb-0.5'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`text-xs sm:text-sm font-extrabold transition-colors ${
                    pathname === '/contact'
                      ? 'text-primary font-black border-b-2 border-secondary pb-0.5'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Contact Us
                </Link>
              </nav>
            )}

            {/* Right Status & Profile / Auth Controls */}
            <div className="flex items-center space-x-3">
              {isLoading ? (
                <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  {/* Balance Badge */}
                  <div className="hidden sm:flex bg-[#F2FBF6] border border-emerald-100/90 px-3 py-1.5 rounded-xl items-center space-x-1.5">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary font-mono">
                      ৳{Number(user.wallet_balance || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Account Status Badge */}
                  {user.status === 'ACTIVE' ? (
                    <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 text-primary border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-primary" />
                      Active
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold bg-amber-50 text-[#854D0E] border border-amber-200">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#854D0E]" />
                      Disabled
                    </span>
                  )}

                  {/* Dashboard button */}
                  {isPublicRoute && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#005A36] hover:bg-[#044D2F] text-white rounded-xl font-extrabold text-xs shadow-sm transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-secondary" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : admin ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-primary bg-[#F2FBF6] border border-emerald-200 px-3 py-1 rounded-xl hidden sm:inline">
                    Admin: {admin.phone}
                  </span>
                  {/* Admin dashboard button on public pages */}
                  {isPublicRoute && (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#005A36] text-white rounded-xl font-extrabold text-xs shadow-sm transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-secondary" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-extrabold text-slate-700 hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs shadow-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
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
