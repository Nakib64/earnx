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
  ArrowUpRight,
  Gift,
  Clock,
  ShieldCheck,
  Star,
  Award,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, refreshUserProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
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
  const payoutCount = (user as any).premium_payout_count || 0;

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary rounded-none p-4 sm:p-6 text-white shadow-xs ">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight break-words">
              Hello, {user.full_name || user.phone}!
            </h1>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-none text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
              {user.status}
            </span>
            {isPremium && (
              <span className="bg-secondary text-slate-950 px-2.5 py-0.5 rounded-none text-[10px] sm:text-xs font-black flex items-center space-x-1">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
                <span>PREMIUM</span>
              </span>
            )}
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm">
            {user.status === 'ACTIVE'
              ? 'Your account is fully activated. Earn multi-level commissions by sharing your link!'
              : 'Your account is currently DISABLED. Request activation to start earning.'}
          </p>
        </div>

        {/* Action Button depending on status */}
        {user.status === 'DISABLED' && (
          <button
            onClick={handleActivationRequest}
            disabled={requestLoading}
            className="w-full md:w-auto bg-white text-primary hover:bg-emerald-50 font-extrabold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-none shadow-xs transition-all flex items-center justify-center space-x-2 shrink-0 border-b-2 border-secondary"
          >
            <Zap className="w-4 h-4 fill-primary" />
            <span>{requestLoading ? 'Submitting...' : 'Request Activation'}</span>
          </button>
        )}

        {user.status === 'ACTIVE' && !isPremium && (
          <button
            onClick={handlePremiumRequest}
            disabled={requestLoading}
            className="w-full md:w-auto bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-none shadow-xs transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Star className="w-4 h-4 fill-slate-950" />
            <span>{requestLoading ? 'Submitting...' : 'Request Premium Status'}</span>
          </button>
        )}
      </div>


      {/* Alert Messages */}
      {message && (
        <div
          className={`p-3.5 sm:p-4 rounded-none text-xs sm:text-sm font-medium flex items-center space-x-2 border ${message.type === 'success'
            ? 'bg-emerald-50 text-primary border-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Wallet Balance Card */}
        <div className="glass-card rounded-none p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Main Wallet Balance
            </span>
            <div className="p-2 bg-emerald-50 rounded-none text-primary shrink-0 border border-emerald-200">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              ৳{Number(user.wallet_balance || 0).toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Backed by ACID transaction ledger</p>
          </div>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center text-xs font-extrabold text-primary hover:text-[#044D2F]"
          >
            <span>View Ledger Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Earning Designation Badge */}
        {
          user.designation ?

            <div className="glass-card rounded-none p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Earning Designation Depth
                </span>
                <div className="p-2 bg-yellow-50 rounded-none text-[#854D0E] shrink-0 border border-yellow-300">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-primary truncate">
                  {user.designation?.name || 'No Badge Assigned'}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Unlocks up to Level {user.designation?.max_level || 1} downline commissions
                </p>
              </div>
              <Link
                href="/dashboard/referral"
                className="inline-flex items-center text-xs font-extrabold text-primary hover:text-[#044D2F]"
              >
                <span>View Referral Tree</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div> : null}

        {/* Direct Referrer Info */}
        <div className="glass-card rounded-none p-4 sm:p-5 flex flex-col justify-between space-y-3 sm:space-y-4 bg-white border border-slate-200 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Direct Referrer (Sponsor)
            </span>
            <div className="p-2 bg-emerald-50 rounded-none text-primary shrink-0 border border-emerald-200">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {user.referred_by?.full_name || user.referred_by?.phone || 'Direct Signup / Admin'}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              {user.referred_by?.referral_code
                ? `Code: ${user.referred_by.referral_code}`
                : 'Root Level Node'}
            </p>
          </div>
          <span className="text-[11px] text-slate-400">Direct upline sponsor node</span>
        </div>
      </div>

      {/* Referral Link Copy Section */}
      <div className="glass-card rounded-none p-4 sm:p-6 space-y-3.5 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Your Unique Referral Link</h3>
            <p className="text-xs text-slate-500">
              Share your link to register new downlines into your tree network
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-primary border border-emerald-200 rounded-none text-xs font-mono font-extrabold self-start sm:self-auto">
            {user.referral_code}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-none px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:outline-none truncate"
          />
          <button
            onClick={copyReferral}
            className="emerald-gold-btn px-5 py-2.5 rounded-none font-extrabold text-xs flex items-center justify-center space-x-1.5 shrink-0 active:scale-98"
          >
            {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        <Link
          href="/dashboard/investments"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-primary rounded-none border border-emerald-200">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Investments</span>
        </Link>

        <Link
          href="/dashboard/leaderboard"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-secondary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-yellow-50 text-[#854D0E] rounded-none border border-yellow-300">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Top 100</span>
        </Link>

        <Link
          href="/dashboard/referral"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-primary rounded-none border border-emerald-200">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Referral Tree</span>
        </Link>

        <Link
          href="/dashboard/wallet"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-emerald-50 text-primary rounded-none border border-emerald-200">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Wallet</span>
        </Link>

        <Link
          href="/dashboard/offers"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-secondary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-yellow-50 text-[#854D0E] rounded-none border border-yellow-300">
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Offers</span>
        </Link>

        <Link
          href="/dashboard/approvals"
          className="glass-card p-3.5 sm:p-4 rounded-none flex flex-col items-center justify-center text-center space-y-2 hover:border-primary transition-colors bg-white border border-slate-200"
        >
          <div className="p-2.5 sm:p-3 bg-slate-100 text-slate-700 rounded-none border border-slate-200">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">Approvals</span>
        </Link>
      </div>
    </div>
  );
}
