'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Check, AlertTriangle } from 'lucide-react';
import {
  DashboardNoticeBanner,
  DashboardHeroHeader,
  DashboardQuickActions,
  MarketOverviewChart,
} from '../../components/dashboard';

interface ActiveNotice {
  id: string;
  title: string;
  content: string;
  is_active?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notice, setNotice] = useState<ActiveNotice | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await apiFetch<any>('/notices/active');
        if (res.success && res.data) {
          setNotice(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch notice', err);
      }
    };
    fetchNotice();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af37]"></div>
        <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  const isPremium = Boolean((user as any).is_premium);
  const firstName = user.full_name || user.phone;

  return (
    <div className="min-h-screen text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
        {/* Alert Messages */}
        {message && (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border ${
              message.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Notice Board Banner */}
        <DashboardNoticeBanner notice={notice} />

        {/* 1. HERO HEADER SECTION */}
        <DashboardHeroHeader
          firstName={firstName}
          isPremium={isPremium}
          walletBalance={user.wallet_balance}
        />

        {/* 2-COLUMN GRID / MOBILE SINGLE COLUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT COLUMN: Market Overview Chart */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <MarketOverviewChart />
          </div>

          {/* RIGHT COLUMN: Quick Actions & Settings */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <DashboardQuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
