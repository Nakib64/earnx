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

  if (!admin && !isLoginPage) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
