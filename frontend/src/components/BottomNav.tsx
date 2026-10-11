'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Wallet, Coins, Crown, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  if (!mounted || !user || !isDashboardRoute) return null;

  const isPremium = Boolean((user as any).is_premium);

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/coins', label: 'Coins', icon: Coins },
    { href: '/dashboard/premium', label: 'Premium', icon: Crown },
    { href: '/dashboard/referral', label: 'Network', icon: Users },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  ];

  const activeIndex = navItems.findIndex((item) => pathname === item.href);

  return (
    <div className="lg:hidden fixed bottom-4 left-3 right-3 z-50 pointer-events-auto select-none">
      <nav className="relative max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.12)] rounded-3xl p-1.5 flex items-center justify-between h-16 specular-rim">
        {/* Animated Sliding Liquid Emerald Active Indicator */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1.5 bottom-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xs"
            style={{
              width: `calc(100% / ${navItems.length} - 6px)`,
              left: `calc(${activeIndex} * (100% / ${navItems.length}) + 3px)`,
            }}
          />
        )}

        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeIndex === idx;
          const lockedRoutes = ['/dashboard/investments', '/dashboard/coins', '/dashboard/marketplace'];
          const isLocked = !isPremium && lockedRoutes.includes(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${isActive
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-400 hover:text-slate-700 font-bold'
                }`}
            >
              <motion.div
                whileTap={{ scale: 0.90 }}
                className="flex flex-col items-center space-y-0.5 relative"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'text-emerald-600 scale-110' : 'text-slate-400'
                      }`}
                  />
                  {isLocked && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute -top-1 -right-1.5" />
                  )}
                </div>
                <span className="text-[10px] ">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
