'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import {
  Wallet,
  Users,
  Copy,
  Check,
  Zap,
  ChevronRight,
  Gift,
  Clock,
  Star,
  Award,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Coins,
  Settings,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, refreshUserProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        text: 'Activation request submitted! Waiting for approval from your referrer or admin.',
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">


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

      {/* Account Status Banner Card — Dark Emerald & Gold Luxury Header */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/10 border border-[#d4af37]/40 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-amber-200">
                Account Status: {user.status}
              </span>
              {isPremium && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>PREMIUM MEMBER</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-2xl leading-relaxed">
              {user.status === 'ACTIVE'
                ? 'Your account is fully active! Earn multi-level commissions by sharing your referral tree link.'
                : 'Your account is currently DISABLED. Request activation from your referrer or admin to start earning.'}
            </p>
          </div>

          {/* Actions */}
          {user.status === 'DISABLED' && (
            <button
              onClick={handleActivationRequest}
              disabled={requestLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{requestLoading ? 'Submitting...' : 'Request Activation'}</span>
            </button>
          )}

          {user.status === 'ACTIVE' && !isPremium && (
            <button
              onClick={handlePremiumRequest}
              disabled={requestLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{requestLoading ? 'Submitting...' : 'Request Premium Upgrade'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Main Wallet Balance */}
        <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-200 uppercase tracking-widest truncate">
            Main Wallet Balance
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-[#d4af37]/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                ৳{Number(user.wallet_balance || 0).toFixed(2)}
              </div>
              <div className="text-xs font-bold text-slate-300">Available Balance</div>
            </div>
          </div>

          <Link
            href="/dashboard/wallet"
            className="w-full bg-[#03442e] hover:bg-[#04593d] text-amber-200 border border-[#d4af37]/30 font-black text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>View Ledger</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>

        {/* Card 2: Earning Designation */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest truncate">
            Earning Designation
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-amber-100 truncate max-w-[140px] sm:max-w-[180px]">
                {user.designation?.name || 'Member'}
              </div>
              <div className="text-xs font-bold text-amber-300">
                Level {user.designation?.max_level || 1} Depth
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/referral"
            className="w-full bg-[#3d2705] hover:bg-[#4d3207] text-amber-200 border border-amber-500/40 font-black text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Referral Tree</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
          </Link>
        </div>

        {/* Card 3: Direct Sponsor Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Direct Sponsor
          </span>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 truncate">
                {user.referred_by?.full_name || user.referred_by?.phone || 'Direct Signup / Admin'}
              </div>
              <p className="text-xs font-mono text-slate-500 font-bold mt-0.5">
                {user.referred_by?.referral_code
                  ? `Code: ${user.referred_by.referral_code}`
                  : 'Root Node'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400">Direct upline sponsor node</span>
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
            {user.referral_code}
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
            className="bg-[#005A36] hover:bg-[#044D2F] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 shrink-0 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Quick Access Navigation Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { href: '/dashboard/coins', icon: Coins, label: 'Coins Wallet', desc: 'Spendable & Lock' },
            { href: '/dashboard/investments', icon: TrendingUp, label: 'Invest & Grow', desc: 'Plans & dividends' },
            { href: '/dashboard/leaderboard', icon: Trophy, label: 'Top 100', desc: 'Leaderboard ranking' },
            { href: '/dashboard/referral', icon: Users, label: 'Referral Tree', desc: 'Team lead report' },
            { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet', desc: 'Ledger & transfers' },
            { href: '/dashboard/settings', icon: Settings, label: 'Account Setting', desc: 'Profile & security' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all hover:border-[#d4af37] group shadow-2xs"
              >
                <div className="w-11 h-11 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] group-hover:scale-105 transition-all shadow-sm mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-900 group-hover:text-[#01281a] transition-colors leading-tight truncate max-w-full">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-500 font-bold truncate max-w-full mt-0.5">
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
