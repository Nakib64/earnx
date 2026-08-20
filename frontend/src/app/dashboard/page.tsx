'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import MarketOverviewChart from '../../components/dashboard/MarketOverviewChart';
import {
  Wallet,
  Users,
  Copy,
  Check,
  Zap,
  ChevronRight,
  Star,
  Award,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Settings,
  Megaphone,
  CheckCircle,
  Bell,
  Calendar,
  UserPlus,
  ArrowUpRight,
  ShoppingBag,
} from 'lucide-react';

interface ActiveNotice {
  id: string;
  title: string;
  content: string;
  is_active?: boolean;
}

export default function DashboardPage() {
  const { user, refreshUserProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${user.referral_code}`
      : `https://earnx.com/register?ref=${user.referral_code}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivationRequest = async () => {
    setRequestLoading(true);
    setMessage(null);
    try {
      await apiFetch('/requests/activation', { method: 'POST' });
      setMessage({
        type: 'success',
        text: 'Activation request submitted! Waiting for approval from admin.',
      });
      await refreshUserProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit request' });
    } finally {
      setRequestLoading(false);
    }
  };

  const handlePremiumRequest = async () => {
    setRequestLoading(true);
    setMessage(null);
    try {
      await apiFetch('/requests/premium', { method: 'POST' });
      setMessage({
        type: 'success',
        text: 'Premium upgrade request submitted! Waiting for approval.',
      });
      await refreshUserProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit request' });
    } finally {
      setRequestLoading(false);
    }
  };

  const isPremium = (user as any).is_premium;
  // Get designation name and star count directly from user's designation record in database
  const designationName = user.designation?.name || 'User';
  const starCount = user.designation?.stars ?? 0;

  // Format today's date
  const todayDate = new Date();
  const formattedDate = todayDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const weekday = todayDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
     

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-primary border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-primary shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Notice Board Banner matching Mockup Design - ONLY IF ACTIVE NOTICE EXISTS */}
      {notice && notice.is_active && notice.content && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Left Dark Icon Container */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-md">
            <Megaphone className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          {/* Notice Text Content */}
          <div className="space-y-1 flex-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {notice.title || 'Notice board'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed flex items-center flex-wrap gap-1.5">
              <span>{notice.content}</span>
              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10 shrink-0 inline-block" />
            </p>
          </div>

          {/* Quick action for unactivated / standard users */}
          {user.status === 'DISABLED' && (
            <button
              onClick={handleActivationRequest}
              disabled={requestLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{requestLoading ? 'Requesting...' : 'Activate Account'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main 3 Cards Grid Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Designation Card matching screenshot */}
        <div className="relative bg-[#002919] border border-emerald-800/40 rounded-2xl p-6 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-4 overflow-hidden min-h-[300px]">
          {/* Left Laurel Wreath Branch */}
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-16 h-40 text-emerald-700/60 pointer-events-none"
            viewBox="0 0 50 120"
            fill="currentColor"
          >
            <path d="M 40,110 C 25,85 18,55 30,10 C 28,18 20,24 10,22 C 16,32 26,33 32,28 C 24,38 12,42 5,38 C 12,48 24,46 30,42 C 20,54 8,56 2,50 C 9,62 20,60 28,56 C 18,70 6,71 1,65 C 8,78 20,74 27,70 C 18,84 6,85 2,80 C 10,91 22,86 28,82 C 20,95 10,96 6,92 C 14,101 26,96 32,92 Z" />
          </svg>

          {/* Right Laurel Wreath Branch (Flipped) */}
          <svg
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-16 h-40 text-emerald-700/60 pointer-events-none transform scale-x-[-1]"
            viewBox="0 0 50 120"
            fill="currentColor"
          >
            <path d="M 40,110 C 25,85 18,55 30,10 C 28,18 20,24 10,22 C 16,32 26,33 32,28 C 24,38 12,42 5,38 C 12,48 24,46 30,42 C 20,54 8,56 2,50 C 9,62 20,60 28,56 C 18,70 6,71 1,65 C 8,78 20,74 27,70 C 18,84 6,85 2,80 C 10,91 22,86 28,82 C 20,95 10,96 6,92 C 14,101 26,96 32,92 Z" />
          </svg>

          {/* Title: Designation */}
          <span className="text-base sm:text-lg font-bold text-[#f3ba2f] tracking-wide z-10">
            Designation
          </span>

          {/* Star Rating: Render stars if user has designation */}
          {starCount > 0 ? (
            <div className="flex items-center space-x-2 z-10 my-1">
              {Array.from({ length: starCount }).map((_, i) => (
                <Star
                  key={i}
                  className="w-7 h-7 fill-[#f3ba2f] text-[#f3ba2f] drop-shadow-[0_2px_4px_rgba(243,186,47,0.5)]"
                />
              ))}
            </div>
          ) : (
            <div className="z-10 my-1">
              <span className="text-xs font-semibold text-emerald-300/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/40">
                Standard Member
              </span>
            </div>
          )}

          {/* Subtitle: Rank Name */}
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide z-10">
            {designationName}
          </h3>

          {/* Gold Underline Bar */}
          <div className="w-14 h-0.5 bg-[#f3ba2f] rounded-full z-10 mt-1"></div>
        </div>

        {/* Card 2: Market Overview (Trading Chart) */}
        <div className="md:col-span-1">
          <MarketOverviewChart />
        </div>

      
      </div>

      {/* Referral Link Copy Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Your Unique Referral Link
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Share your link to register new downlines into your tree network
            </p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 text-primary border border-emerald-200/80 rounded-xl text-xs font-mono font-extrabold self-start sm:self-auto">
            User Code: {user.referral_code}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-700 focus:outline-none truncate"
          />
          <button
            onClick={copyReferral}
            className="bg-[#005A36] hover:bg-[#044D2F] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Grid matching Mockup Design */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            {
              href: '/dashboard/wallet',
              icon: Wallet,
              label: 'Cash Wallet',
              desc: 'Available Balance',
            },
            {
              href: '/dashboard/purchase',
              icon: ShoppingBag,
              label: 'Purchase Package',
              desc: 'Buy Activation/Plan',
            },
            {
              href: '/dashboard/investments',
              icon: TrendingUp,
              label: 'Invest & Grow',
              desc: 'Make Profit Daily',
            },
            {
              href: '/dashboard/leaderboard',
              icon: Trophy,
              label: 'Top 100',
              desc: 'Leaderboard Ranking',
            },
            {
              href: '/dashboard/referral',
              icon: UserPlus,
              label: 'Referral View',
              desc: 'View Referral Report',
            },
            {
              href: '/dashboard/wallet',
              icon: Wallet,
              label: 'Wallet',
              desc: 'Ledger & Transaction',
            },
            {
              href: '/dashboard/settings',
              icon: Settings,
              label: 'Account Setting',
              desc: 'Profile & Security',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all hover:border-[#d4af37] group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] group-hover:scale-105 transition-all shadow-sm mb-2.5">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-slate-900 group-hover:text-[#01281a] transition-colors leading-tight truncate max-w-full">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold truncate max-w-full mt-1">
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
