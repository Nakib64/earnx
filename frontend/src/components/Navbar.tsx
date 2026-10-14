'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MarketplaceNotificationDropdown } from './marketplace';
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
  Banknote,
  ArrowDownCircle,
  MessageSquare,
  Lock,
  BarChart3,
  Package,
} from 'lucide-react';

export default function Navbar() {
  const { user, admin, logoutUser, logoutAdmin, isLoading } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically close drawer upon page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isDashboardRoute = pathname?.startsWith('/dashboard');
  const isAdminRoute = pathname?.startsWith('/admin');
  const isPublicRoute = !isDashboardRoute && !isAdminRoute;

  const userItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/purchase', label: 'Package Purchase', icon: ShoppingBag },
    { href: '/dashboard/orders', label: 'My Orders', icon: Package },
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

  const adminItems = [
    { href: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products Catalog', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Ecommerce Orders', icon: Package },
    { href: '/admin/ads-analytics', label: 'Ads Analytics', icon: BarChart3 },
    { href: '/admin/deposits', label: 'Deposit Requests', icon: ArrowDownCircle },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: Banknote },
    { href: '/admin/premium', label: 'Premium Packages', icon: Crown },
    { href: '/admin/investments', label: 'Investment Plans', icon: TrendingUp },
    { href: '/admin/coins', label: 'Coin Management', icon: Coins },
    { href: '/admin/marketplace', label: 'Marketplace Feed', icon: MessageSquare },
    { href: '/admin/notices', label: 'Notice Board', icon: Megaphone },
    { href: '/admin/leaderboard', label: 'Top 100 Leaderboard', icon: Trophy },
    { href: '/admin/users', label: 'Users & Accounts', icon: Users },
    { href: '/admin/designations', label: 'Designations & Badges', icon: Award },
    { href: '/admin/commissions', label: 'Commission Rules', icon: Layers },
    { href: '/admin/wallet', label: ' Transactions', icon: DollarSign },
    { href: '/admin/settings', label: 'Admin Profile', icon: Settings },
  ];

  const publicItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/products', label: 'Shop / Products', icon: ShoppingBag },
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
    : user?.full_name || user?.phone || '';

  const initials = getInitials(displayName);

  const drawerNavItems = isAdminRoute
    ? adminItems
    : (isDashboardRoute || user)
      ? userItems
      : publicItems;

  const drawerContent = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ease-out ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
    >
      {/* Soft atmospheric luminous backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-md transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Glassmorphic Drawer Panel */}
      <div
        className={`relative z-10 w-80 max-w-[85vw] h-full flex flex-col p-4 sm:p-5 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-white/85 backdrop-blur-2xl border-r border-white/85 shadow-[0_25px_60px_rgba(0,0,0,0.15)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Ambient Refraction Mesh Orbs */}
        <div className="absolute -top-16 -left-16 w-52 h-52 bg-emerald-500/[0.09] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-16 w-48 h-48 bg-sky-500/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-12 w-48 h-48 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        {/* Drawer Header */}
        <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-slate-200/60 shrink-0">
          <Link
            href={isAdminRoute ? '/admin/dashboard' : '/'}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 group"
          >
            <img
              src="/logo.png"
              alt="EarnX Capital"
              className="h-9 w-auto object-contain bg-white/70 px-2.5 py-1 rounded-xl border border-white/90 shadow-xs transition-transform group-hover:scale-105"
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-white/70 hover:bg-white border border-white/90 shadow-xs backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* User / Profile Box in Drawer */}
        {(user || admin) && (
          <Link
            href={isAdminRoute ? '/admin/settings' : '/dashboard/settings'}
            onClick={() => setMobileMenuOpen(false)}
            className="relative z-10 mt-3.5 bg-white/75 hover:bg-white/90 border border-white/95 shadow-sm rounded-2xl p-2.5 flex items-center justify-between transition-all duration-200 group shrink-0 specular-rim"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 bg-emerald-50 flex items-center justify-center text-emerald-800 font-black text-sm shrink-0 shadow-xs">
                {initials}
              </div>

              <div className="flex flex-col min-w-0 justify-center">
                <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {isAdminRoute ? (admin?.name || displayName) : displayName}
                </span>

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
        )}

        {/* Navigation List */}
        <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto py-3 pr-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {drawerNavItems.map((item) => {
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-950 border border-emerald-500/30 shadow-xs transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-extrabold text-sm text-emerald-950  truncate">
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
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-150 group border border-transparent hover:border-white/80"
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
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="relative z-10 pt-3 border-t border-slate-200/60 shrink-0 space-y-2">
          {user ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logoutUser();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/70 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold text-xs transition-colors border border-slate-200/80 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          ) : admin ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logoutAdmin();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/70 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold text-xs transition-colors border border-slate-200/80 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out Admin</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-white/80 hover:bg-white text-slate-800 rounded-xl font-bold text-xs transition-colors border border-slate-200/80 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-100" />
                <span>Join Now</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] w-full text-slate-800 transition-all specular-rim ${isAdminRoute || isDashboardRoute ? 'lg:hidden' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
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
                  className={`text-sm font-bold transition-colors ${pathname === '/'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1'
                    : 'text-slate-600 hover:text-emerald-700'
                    }`}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className={`text-sm font-bold transition-colors ${pathname === '/products'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1'
                    : 'text-slate-600 hover:text-emerald-700'
                    }`}
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-bold transition-colors ${pathname === '/about'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1'
                    : 'text-slate-600 hover:text-emerald-700'
                    }`}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className={`text-sm font-bold transition-colors ${pathname === '/contact'
                    ? 'text-emerald-700 border-b-2 border-emerald-600 pb-1'
                    : 'text-slate-600 hover:text-emerald-700'
                    }`}
                >
                  Contact
                </Link>
              </nav>
            )}

            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Marketplace Notification Dropdown (Mounted client-side in the same line as Cart) */}
              {mounted && !isLoading && user && <MarketplaceNotificationDropdown />}

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                title="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#009F6B] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* {(!mounted || isLoading) ? (
                <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  {isPublicRoute && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-100" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : admin ? (
                <div className="flex items-center space-x-2">
                  {isPublicRoute && (
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-100" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-slate-300 transition-colors bg-white/60"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all"
                  >
                    Join
                  </Link>
                </div>
              )} */}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-white/90 shadow-xs backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
