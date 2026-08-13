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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${isActive
                ? 'text-primary font-extrabold scale-105'
                : 'text-slate-500 font-medium hover:text-primary'
                }`}
            >
              <div
                className={`p-1.5 rounded-none transition-colors ${isActive ? 'bg-emerald-100/80 text-primary border-b-2 border-secondary' : ''
                  }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] tracking-tight font-extrabold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
