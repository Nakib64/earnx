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

      {/* Account Status Banner Card */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white">
                Account Status: {user.status}
              </span>
              {isPremium && (
                <span className="bg-secondary text-slate-950 px-3 py-1 rounded-xl text-xs font-black flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>PREMIUM MEMBER</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-2xl leading-relaxed">
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
              className="w-full sm:w-auto bg-white text-primary hover:bg-emerald-50 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-primary" />
              <span>{requestLoading ? 'Submitting...' : 'Request Activation'}</span>
            </button>
          )}

          {user.status === 'ACTIVE' && !isPremium && (
            <button
              onClick={handlePremiumRequest}
              disabled={requestLoading}
              className="w-full sm:w-auto bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>{requestLoading ? 'Submitting...' : 'Request Premium Upgrade'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Card 1: Main Wallet Balance */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Main Wallet Balance
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                ৳{Number(user.wallet_balance || 0).toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-primary">Available Balance</div>
            </div>
          </div>

          <Link
            href="/dashboard/wallet"
            className="w-full bg-emerald-100/60 hover:bg-emerald-100 text-primary font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>View Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Earning Designation */}
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-sm">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Earning Designation
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-[#854D0E] truncate max-w-[140px] sm:max-w-[180px]">
                {user.designation?.name || 'Member'}
              </div>
              <div className="text-xs font-extrabold text-amber-800/80">
                Level {user.designation?.max_level || 1} Depth
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/referral"
            className="w-full bg-[#FFF0E5] hover:bg-[#FFE5D2] text-[#854D0E] font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1"
          >
            <span>Referral Tree</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Direct Sponsor Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 col-span-2 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Direct Sponsor
          </span>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                {user.referred_by?.full_name || user.referred_by?.phone || 'Direct Signup / Admin'}
              </div>
              <p className="text-xs font-mono text-slate-500 font-semibold mt-0.5">
                {user.referred_by?.referral_code
                  ? `Code: ${user.referred_by.referral_code}`
                  : 'Root Node'}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-400">Direct upline sponsor node</span>
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
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Link
            href="/dashboard/coins"
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/80">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">Coins Wallet</span>
          </Link>

          <Link
            href="/dashboard/investments"
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/80">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">Invest & Grow</span>
          </Link>

          <Link
            href="/dashboard/leaderboard"
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-secondary transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#854D0E] flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-200/80">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">Top 100</span>
          </Link>

          <Link
            href="/dashboard/referral"
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/80">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">Referral Tree</span>
          </Link>

          <Link
            href="/dashboard/wallet"
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-200/80">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">Wallet</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
