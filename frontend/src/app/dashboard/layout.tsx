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

  // Non-premium restriction: ONLY /dashboard and /dashboard/settings are unlocked
  const isAllowedPath = pathname === '/dashboard' || pathname === '/dashboard/settings';
  const isPremium = Boolean((user as any).is_premium);

  if (!isPremium && !isAllowedPath) {
    return (
      <div className="pb-20 lg:pb-0">
        <PremiumLockScreen />
      </div>
    );
  }

  return <div className="pb-20 lg:pb-0">{children}</div>;
}
