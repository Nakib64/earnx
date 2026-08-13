'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function AdminIndexPage() {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [admin, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      <span className="text-xs font-semibold text-slate-500">Redirecting...</span>
    </div>
  );
}
