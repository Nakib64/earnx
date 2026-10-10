'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { PremiumLockScreen } from '../../components/common/PremiumLockScreen';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (!user) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
        </div>
      );
    }
    return null;
  }

  // All pages are accessible to members, except Coins, Investments, and Marketplace which require Premium / active package
  const isRestrictedPath =
    pathname.startsWith('/dashboard/coins') ||
    pathname.startsWith('/dashboard/investments') ||
    pathname.startsWith('/dashboard/marketplace');
  const isPremium = Boolean((user as any).is_premium);

  if (!isPremium && isRestrictedPath) {
    return (
      <div className="pb-24 lg:pb-8 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
        <PremiumLockScreen />
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4">
      {children}
    </div>
  );
}
