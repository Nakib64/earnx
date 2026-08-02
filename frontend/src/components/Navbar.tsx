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
} from 'lucide-react';

export default function Navbar() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
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
    { href: '/dashboard/investments', label: 'Invest & Grow', icon: TrendingUp },
    { href: '/dashboard/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/dashboard/referral', label: 'Referral Tree Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet & Ledger', icon: Wallet },
    { href: '/dashboard/offers', label: 'Offers & Tasks', icon: Gift },
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg sky-gradient-bg flex items-center justify-center text-white font-bold text-sm">
              X
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-extrabold text-sm bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent truncate">
                EarnX
              </span>
              <span className="text-[10px] font-semibold text-slate-400 -mt-1 uppercase tracking-wider">
                {isAdminRoute ? 'Admin Portal' : 'MLM Ecosystem'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-3">
          {(isAdminRoute ? adminItems : isDashboardRoute ? userItems : publicItems).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
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

        {/* Drawer Footer Actions */}
        <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 sky-gradient-btn font-bold text-xs rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
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
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutAdmin();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-colors"
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
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 sky-gradient-btn font-bold text-xs rounded-xl"
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
        className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm w-full ${
          isAdminRoute || isDashboardRoute ? 'lg:hidden' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href={isAdminRoute ? '/admin/dashboard' : '/'} className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-xl sky-gradient-bg flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                  X
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
                    EarnX
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 -mt-1 uppercase tracking-widest">
                    {isAdminRoute ? 'Admin Portal' : 'MLM Ecosystem'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links for Public Routes */}
            {isPublicRoute && (
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/'
                      ? 'text-sky-600 font-bold border-b-2 border-sky-500 pb-0.5'
                      : 'text-slate-600 hover:text-sky-600'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/about'
                      ? 'text-sky-600 font-bold border-b-2 border-sky-500 pb-0.5'
                      : 'text-slate-600 hover:text-sky-600'
                  }`}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`text-sm font-semibold transition-colors ${
                    pathname === '/contact'
                      ? 'text-sky-600 font-bold border-b-2 border-sky-500 pb-0.5'
                      : 'text-slate-600 hover:text-sky-600'
                  }`}
                >
                  Contact Us
                </Link>
              </nav>
            )}

            {/* Right Status & Profile / Auth Controls */}
            <div className="flex items-center space-x-3">
              {user && !isAdminRoute && (
                <div className="flex items-center space-x-2">
                  {/* Balance Badge — hidden on very small screens to save space */}
                  <div className="hidden sm:flex bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-full items-center space-x-1.5">
                    <Wallet className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-sky-900">
                      ৳{Number(user.wallet_balance).toFixed(2)}
                    </span>
                  </div>

                  {/* Account Status Badge */}
                  {user.status === 'ACTIVE' ? (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                      Disabled
                    </span>
                  )}

                  {/* Dashboard button — always visible when on public pages */}
                  {isPublicRoute && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 sky-gradient-btn rounded-xl font-bold text-xs shadow-sm"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </Link>
                  )}

                  {/* Logout User */}
                  <button
                    onClick={logoutUser}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}

              {admin && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full hidden sm:inline">
                    Admin: {admin.email}
                  </span>
                  {/* Admin dashboard button on public pages */}
                  {isPublicRoute && (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={logoutAdmin}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Logout Admin"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}

              {!user && !admin && (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl sky-gradient-btn font-bold text-xs shadow-xs transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Render Mobile Drawer via Portal */}
      {mounted && drawerContent ? createPortal(drawerContent, document.body) : null}
    </>
  );
}
