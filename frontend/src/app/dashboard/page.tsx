'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  AlertTriangle,
  TrendingUp,
  Trophy,
  Settings,
  Megaphone,
  CheckCircle,
  ShoppingBag,
  Link2,
  Crown,
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af37]"></div>
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

  const isPremium = (user as any).is_premium;
  const firstName = user.full_name?.split(' ')[0] || user.phone;

  const quickActions = [
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
      icon: Users,
      label: 'Referral View',
      desc: 'View Referral Report',
    },
    {
      href: '/dashboard/wallet',
      icon: Wallet,
      label: 'Wallet',
      desc: 'Ledger & Transaction',
    },
  ];

  return (
    <div className="min-h-screen  text-slate-100 font-sans">
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
        {notice && notice.is_active && notice.content && (
          <div className="bg-[#022416] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start space-x-3.5 text-white">
            <div className="w-10 h-10 rounded-xl bg-[#01180f] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                {notice.title || 'Notice Board'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                {notice.content}
              </p>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
          </div>
        )}

        {/* ── 1. HERO HEADER SECTION ── */}
        <div className="relative overflow-hidden rounded-[24px] lg:rounded-[28px] bg-gradient-to-br from-[#012215] via-[#022e1d] to-[#01160d] border border-emerald-900/60 p-4 sm:p-5 lg:p-6 text-white shadow-xl">
          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-row items-center justify-between gap-4 lg:gap-6">
            {/* Left Info */}
            <div className="space-y-2 sm:space-y-2.5 max-w-md lg:max-w-xl">
              {/* Greeting & Name */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20" />
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                    Welcome Back
                  </p>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5 drop-shadow-sm">
                  <span>{firstName}</span>
                  <span className="text-base sm:text-lg">👋</span>
                </h1>
              </div>

              {/* Status & Wallet Badges */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {isPremium ? (
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-600/15 border border-[#d4af37]/60 text-[#fbbf24] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.15)] backdrop-blur-md">
                    <Crown className="w-3 h-3 fill-[#fbbf24] text-[#fbbf24]" />
                    <span>Premium</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                    <span>Standard</span>
                  </div>
                )}

                {user.wallet_balance !== undefined && (
                  <div className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                    <Wallet className="w-3 h-3 text-emerald-400" />
                    <span>৳{Number(user.wallet_balance).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total Earnings Stat Box */}
              <div className="pt-0.5">
                <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-emerald-500/20 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-sm">
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-[11px] font-semibold tracking-wide">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Earnings:</span>
                  </div>
                  <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 tracking-tight">
                    +12.48%
                  </span>
                  <span className="inline-flex items-center text-[9px] font-black bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1 py-0.2 rounded">
                    ▲ 24H
                  </span>
                </div>
              </div>

              {/* Account Activation button for unactivated users */}
              {user.status === 'DISABLED' && (
                <button
                  onClick={handleActivationRequest}
                  disabled={requestLoading}
                  className="mt-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 text-slate-950 font-black text-[11px] px-3.5 py-1.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{requestLoading ? 'Requesting...' : 'Activate Account'}</span>
                </button>
              )}
            </div>

            {/* Right: 3D Rising Pedestal Artwork */}
            <div className="w-32 h-24 sm:w-36 sm:h-28 lg:w-44 lg:h-36 relative shrink-0 flex items-center justify-center">
              <svg
                viewBox="0 0 200 160"
                className="w-full h-full drop-shadow-2xl overflow-visible"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="barG1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="barG2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  <linearGradient id="arrowG" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="60%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#a7f3d0" />
                  </linearGradient>
                  <linearGradient id="crownGoldG" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                  <linearGradient id="pedestalG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#064e3b" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                  <linearGradient id="avatarG" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#022c22" />
                  </linearGradient>
                </defs>

                {/* Pedestal Base */}
                <ellipse cx="100" cy="135" rx="85" ry="20" fill="url(#pedestalG)" stroke="#047857" strokeWidth="2" />
                <ellipse cx="100" cy="130" rx="75" ry="16" fill="#012217" opacity="0.8" />

                {/* Curved Arrow Rising */}
                <path
                  d="M 25 110 Q 55 50 115 25"
                  fill="none"
                  stroke="url(#arrowG)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 6px rgba(52,211,153,0.6))"
                />
                <polygon points="112,18 128,22 118,34" fill="#6ee7b7" />

                {/* Ascending 3D Columns */}
                {/* Bar 1 */}
                <g transform="translate(38, 90)">
                  <path d="M 0 10 L 0 35 A 10 5 0 0 0 20 35 L 20 10 Z" fill="url(#barG2)" />
                  <ellipse cx="10" cy="10" rx="10" ry="5" fill="#6ee7b7" />
                </g>
                {/* Bar 2 */}
                <g transform="translate(62, 70)">
                  <path d="M 0 10 L 0 55 A 11 5.5 0 0 0 22 55 L 22 10 Z" fill="url(#barG1)" />
                  <ellipse cx="11" cy="10" rx="11" ry="5.5" fill="#a7f3d0" />
                </g>
                {/* Bar 3 */}
                <g transform="translate(88, 48)">
                  <path d="M 0 10 L 0 78 A 12 6 0 0 0 24 78 L 24 10 Z" fill="url(#barG1)" />
                  <ellipse cx="12" cy="10" rx="12" ry="6" fill="#d1fae5" />
                </g>

                {/* User Token with Golden Crown */}
                <g transform="translate(120, 52)">
                  {/* Golden Crown */}
                  <path
                    d="M 12 3 L 18 12 L 28 0 L 38 12 L 44 3 L 40 16 L 16 16 Z"
                    fill="url(#crownGoldG)"
                    filter="drop-shadow(0 2px 5px rgba(251,191,36,0.8))"
                  />
                  {/* Token Disc */}
                  <circle cx="28" cy="38" r="24" fill="url(#avatarG)" stroke="#34d399" strokeWidth="2.5" />
                  <circle cx="28" cy="38" r="20" fill="#064e3b" />
                  {/* User Silhouette */}
                  <circle cx="28" cy="32" r="6" fill="#a7f3d0" />
                  <path d="M 18 46 A 10 10 0 0 1 38 46 Z" fill="#a7f3d0" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ── DESKTOP 2-COLUMN GRID / MOBILE SINGLE COLUMN ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* ── LEFT COLUMN (7 COLS ON DESKTOP): Charts & Referral Link ── */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* ── 2. MARKET OVERVIEW CARD ── */}
            <MarketOverviewChart />

            {/* ── 3. UNIQUE REFERRAL LINK CARD ── */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-3.5 text-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Green Squircle with Chain Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] flex items-center justify-center text-[#065f46] shrink-0 shadow-xs">
                    <Link2 className="w-6 h-6 rotate-[-45deg] stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      Your Unique Referral Link
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      Share your link to register new downlines into your tree network
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-[#eafaf1] text-[#059669] border border-[#bbf7d0] rounded-xl text-[11px] sm:text-xs font-mono font-extrabold shrink-0">
                  User Code: {user.referral_code}
                </span>
              </div>

              {/* Link Box and Copy Button */}
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex-1 bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2.5 text-[11px] sm:text-xs font-mono text-slate-700 truncate">
                  {referralLink}
                </div>
                <button
                  onClick={copyReferral}
                  className="w-10 h-10 bg-[#012b1d] hover:bg-[#02402b] text-[#10b981] rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm cursor-pointer"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (5 COLS ON DESKTOP): Quick Actions & Settings ── */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* ── 4. QUICK ACTIONS CARD ── */}
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
                    <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Quick Actions</h2>
                </div>

                <Link
                  href="/dashboard/wallet"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 3 Columns x 2 Rows Grid */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {quickActions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="relative overflow-hidden flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#032e1f] via-[#012216] to-[#01140c] border border-emerald-800/40 hover:border-emerald-500/60 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition-all group cursor-pointer"
                    >
                      {/* Subtle top inner glow */}
                      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                      
                      {/* Golden Icon */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#fbbf24] group-hover:scale-110 transition-transform mb-1.5">
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>

                      {/* Title with Chevron */}
                      <span className="text-[11px] sm:text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-center gap-0.5 leading-tight text-center">
                        <span>{item.label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-300 shrink-0" />
                      </span>

                      {/* Subtitle */}
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
                        {item.desc}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── 5. ACCOUNT SETTING ROW ── */}
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-between bg-[#e2f5ea] hover:bg-[#d8f0e2] border border-[#bbf0d0] rounded-2xl px-4 sm:px-5 py-3.5 shadow-xs transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#059669] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Settings className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Account Setting
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Profile & Security</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#059669] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

