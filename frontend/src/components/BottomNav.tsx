'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Wallet, Coins, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  if (!user || !isDashboardRoute) return null;

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/coins', label: 'Coins', icon: Coins },
    { href: '/dashboard/investments', label: 'Invest', icon: TrendingUp },
    { href: '/dashboard/referral', label: 'Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  ];

  const activeIndex = navItems.findIndex((item) => pathname === item.href);

  return (
    <div className="lg:hidden fixed bottom-4 left-3 right-3 z-50 pointer-events-auto">
      <nav className="relative max-w-md mx-auto bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] backdrop-blur-2xl border border-[#d4af37]/40 shadow-[0_10px_35px_rgba(0,0,0,0.5)] rounded-full p-1.5 flex items-center justify-between">
        {/* Animated Sliding Soft Gold Background Pill */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-[#f5c542]/20 to-[#d4af37]/20 border border-[#d4af37]/50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xs"
            style={{
              width: `calc(100% / ${navItems.length} - 6px)`,
              left: `calc(${activeIndex} * (100% / ${navItems.length}) + 3px)`,
            }}
          />
        )}

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeIndex === idx;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all duration-300 ${
                isActive
                  ? 'text-[#f3ba2f] font-black scale-105'
                  : 'text-slate-300 hover:text-white font-medium'
              }`}
            >
              <div className="flex flex-col items-center space-y-0.5">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                    isActive ? 'text-[#f3ba2f] scale-110 drop-shadow-[0_0_6px_rgba(243,186,47,0.5)]' : 'text-[#d4af37]/70'
                  }`}
                />
                <span className="text-[10px] tracking-tight font-extrabold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

