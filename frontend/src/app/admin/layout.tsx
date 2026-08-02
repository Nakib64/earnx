'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading) {
      if (!admin && !isLoginPage) {
        router.replace('/admin/login');
      } else if (admin && isLoginPage) {
        router.replace('/admin/dashboard');
      }
    }
  }, [admin, isLoading, isLoginPage, router]);

  // While checking authorization or redirecting unauthenticated admin, show a loading spinner
  if (isLoading || (!admin && !isLoginPage)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        <span className="text-xs font-semibold text-slate-500">Checking Admin Authorization...</span>
      </div>
    );
  }

  return <>{children}</>;
}
