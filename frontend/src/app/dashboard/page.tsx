'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useDesignSystem } from '../../context/DesignSystemContext';
import { apiFetch } from '../../lib/api';
import { Check, AlertTriangle, Crown, Wallet } from 'lucide-react';
import {
  DashboardNoticeBanner,
  DashboardQuickActions,
  UserAdsAnalyticsChart,
  DashboardSkeleton,
  NoticeItem,
} from '../../components/dashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isLoading: isSkeletonReviewMode } = useDesignSystem();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await apiFetch<any>('/notices/active');
        if (res.success && res.data) {
          if (Array.isArray(res.data)) {
            setNotices(res.data);
          } else if (Array.isArray(res.data.data)) {
            setNotices(res.data.data);
          } else {
            setNotices([res.data]);
          }
        } else if (Array.isArray(res)) {
          setNotices(res);
        }
      } catch (err) {
        console.error('Failed to fetch notices', err);
      }
    };
    fetchNotices();
  }, []);

  // Universal Skeleton Loading when user profile is loading OR reviewer toggled Skeleton Mode
  if (!user || isSkeletonReviewMode) {
    return (
      <div className="relative z-10 min-h-full text-[#111827] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const isPremium = Boolean((user as any).is_premium);
  const firstName = user.full_name || user.phone;

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Notice Board Image Slider Banner (Placed BEFORE Account Overview per requirement) */}
        <DashboardNoticeBanner notices={notices} />

        {/* Compact, Clearly Structured Page Header (Sitting directly on background per Membership Page Principle) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Small eyebrow label with subtle letter spacing */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Account Overview
            </div>

            {/* Prominent main heading (~30-32px on desktop) */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
              Personal Dashboard &amp; Activity Overview
            </h1>

            {/* Supporting description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Welcome back, <span className="font-semibold text-slate-900">{firstName}</span>. Monitor daily ad views, track credited wallet earnings, and access platform services.
            </p>

            {/* Account status indicator */}
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPremium ? 'bg-[#009F6B]' : 'bg-slate-400'
                  }`}
                />
                Status:{' '}
                <strong className="text-slate-900 font-semibold">
                  {isPremium ? 'VIP Member' : 'Standard Account'}
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with subtle liquid glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link
              href="/dashboard/premium"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Membership</span>
            </Link>

            <Link
              href="/dashboard/wallet"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Wallet className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Cash Wallet</span>
            </Link>
          </div>
        </div>

        {/* Alert Messages (if any) */}
        {message && (
          <div
            className={`p-3.5 sm:p-4 rounded-[10px] text-xs sm:text-sm font-semibold flex items-center space-x-2 border shadow-2xs ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-[#009F6B] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* FULL WIDTH: User Ads & Earnings Analytics Chart with Separate Stats & Subscribed Package */}
        <div className="w-full">
          <UserAdsAnalyticsChart user={user} />
        </div>

        {/* FULL WIDTH: Platform Modules & Shortcuts Section */}
        <div className="w-full">
          <DashboardQuickActions />
        </div>
      </div>
    </div>
  );
}
