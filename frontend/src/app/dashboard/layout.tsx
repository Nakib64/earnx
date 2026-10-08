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

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
        <p className="text-sm font-medium text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  // All pages are accessible to members, except Coins and Investments which require Premium / active package
  const isRestrictedPath =
    pathname.startsWith('/dashboard/coins') || pathname.startsWith('/dashboard/investments');
  const isPremium = Boolean((user as any).is_premium);

  if (!isPremium && isRestrictedPath) {
    return (
      <div className="pb-20 lg:pb-0">
        <PremiumLockScreen />
      </div>
    );
  }

  return <div className="pb-20 lg:pb-0">{children}</div>;
}
