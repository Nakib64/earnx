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

  const referralLink = typeof window !== 'undefined'
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

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-xl shadow-sky-500/20">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user.full_name || user.phone}!
            </h1>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {user.status}
            </span>
          </div>
          <p className="text-sky-100 text-sm">
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
            className="bg-white text-sky-600 hover:bg-sky-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-sky-600" />
            <span>{requestLoading ? 'Submitting...' : 'Request Activation'}</span>
          </button>
        )}

        {user.status === 'ACTIVE' && (
          <button
            onClick={handlePremiumRequest}
            disabled={requestLoading}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Star className="w-4 h-4 fill-slate-900" />
            <span>{requestLoading ? 'Submitting...' : 'Request Premium Status'}</span>
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Wallet Balance Card */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cached Wallet Balance
            </span>
            <div className="p-2 bg-sky-100 rounded-xl text-sky-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              ${Number(user.wallet_balance).toFixed(2)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Backed by ACID transaction ledger</p>
          </div>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>View Ledger Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Earning Designation Badge */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Earning Designation Depth
            </span>
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {user.designation?.name || 'No Badge Assigned'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unlocks up to Level {user.designation?.max_level || 1} downline commissions
            </p>
          </div>
          <Link
            href="/dashboard/referral"
            className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>View Referral Tree</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Direct Referrer Info */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Direct Referrer (Sponsor)
            </span>
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {user.referred_by?.full_name || user.referred_by?.phone || 'Direct Signup / Admin'}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {user.referred_by?.referral_code ? `Code: ${user.referred_by.referral_code}` : 'Root Level Node'}
            </p>
          </div>
          <span className="text-xs text-slate-400">Direct upline node</span>
        </div>
      </div>

      {/* Referral Link Copy Section */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Your Unique Referral Link</h3>
            <p className="text-xs text-slate-500">
              Share your link to register new downlines into your tree network
            </p>
          </div>
          <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-mono font-bold">
            {user.referral_code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-700 focus:outline-none"
          />
          <button
            onClick={copyReferral}
            className="sky-gradient-btn px-5 py-3 rounded-xl font-bold text-xs flex items-center space-x-1.5 flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/dashboard/referral"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-300 transition-colors"
        >
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Referral Tree</span>
        </Link>

        <Link
          href="/dashboard/wallet"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-300 transition-colors"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Wallet & Withdraw</span>
        </Link>

        <Link
          href="/dashboard/offers"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-300 transition-colors"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Offers & Tasks</span>
        </Link>

        <Link
          href="/dashboard/approvals"
          className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2 hover:border-sky-300 transition-colors"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">Approve Downlines</span>
        </Link>
      </div>
    </div>
  );
}
