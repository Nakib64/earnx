'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUsersBannerProps {
  totalMembers: number;
  onRefresh: () => void;
  loading?: boolean;
}

export function AdminUsersBanner({ totalMembers, onRefresh, loading = false }: AdminUsersBannerProps) {
  const handleRefresh = () => {
    onRefresh();
    toast.info('Refreshed user network data');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
      <div className="space-y-1.5 max-w-2xl select-none">
        {/* Eyebrow Label */}
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Community Network &amp; Directory
        </div>

        {/* Prominent Main Heading */}
        <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
          Badged Leaders &amp; Referral Network
        </h1>

        {/* Supporting Description */}
        <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
          Explore referral tree networks in-place, assign leader badges, adjust wallet balances, and govern account permissions.
        </p>

        {/* Operational Status Indicator */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
            Active Directory Stream &bull;{' '}
            <strong className="text-slate-900 font-semibold">
              {totalMembers} Network Members Registered
            </strong>
          </span>
        </div>
      </div>

      {/* Secondary Actions with Liquid Glassmorphism */}
      <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap select-none">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          title="Refresh Network Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
