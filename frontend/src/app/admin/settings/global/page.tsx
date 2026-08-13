'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';
import { SystemConfigMap } from '../../../../types';
import { AlertBanner } from '../../../../components/common/AlertBanner';
import {
  Globe,
  Save,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  ArrowLeft,
  Eye,
  X,
  Coins,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface PremiumUser {
  id: string;
  full_name: string | null;
  phone: string;
  referral_code: string;
  wallet_balance: number | string;
  is_premium: boolean;
  premium_payout_count: number;
  last_premium_payout_at: string | null;
  premium_expires_at: string | null;
}

export default function GlobalSettingsPage() {
  // System Config State
  const [weeklyPayout, setWeeklyPayout] = useState('100');
  const [coinPrice, setCoinPrice] = useState('10');
  const [premiumFreeCoins, setPremiumFreeCoins] = useState('100');
  const [requiredReferrals, setRequiredReferrals] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Targeted User Payout State
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // View Detail Modal State
  const [viewUser, setViewUser] = useState<PremiumUser | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchPremiumUsers();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await apiFetch<SystemConfigMap>('/admin/system-config', { isAdmin: true });
    if (res.success && res.data) {
      if (res.data.PREMIUM_WEEKLY_PAYOUT_AMOUNT) setWeeklyPayout(res.data.PREMIUM_WEEKLY_PAYOUT_AMOUNT);
      if (res.data.COIN_PRICE) setCoinPrice(res.data.COIN_PRICE);
      if (res.data.PREMIUM_FREE_COINS) setPremiumFreeCoins(res.data.PREMIUM_FREE_COINS);
      if (res.data.PREMIUM_FREE_COINS_REQUIRED_REFERRALS) setRequiredReferrals(res.data.PREMIUM_FREE_COINS_REQUIRED_REFERRALS);
    }
    setLoading(false);
  };

  const fetchPremiumUsers = async (query = '') => {
    setLoadingUsers(true);
    const res = await apiFetch<PremiumUser[]>(
      `/admin/premium/users?search=${encodeURIComponent(query)}`,
      { isAdmin: true },
    );
    if (res.success && res.data) {
      setPremiumUsers(res.data);
    }
    setLoadingUsers(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchPremiumUsers(q);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const requests = [
      apiFetch('/admin/system-config', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ key: 'PREMIUM_WEEKLY_PAYOUT_AMOUNT', value: weeklyPayout }),
      }),
      apiFetch('/admin/system-config', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ key: 'COIN_PRICE', value: coinPrice }),
      }),
      apiFetch('/admin/system-config', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ key: 'PREMIUM_FREE_COINS', value: premiumFreeCoins }),
      }),
      apiFetch('/admin/system-config', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ key: 'PREMIUM_FREE_COINS_REQUIRED_REFERRALS', value: requiredReferrals }),
      }),
    ];

    const results = await Promise.all(requests);
    if (results.every((r) => r.success)) {
      setMessage({ type: 'success', text: 'Global system configurations saved successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update some global settings' });
    }
    setSaving(false);
  };

  const handleTriggerGlobalPayouts = async () => {
    setTriggering(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number; weeklyAmount: number }>(
      '/admin/premium/trigger-payouts',
      { method: 'POST', isAdmin: true },
    );

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Processed weekly premium payout of ৳${res.data.weeklyAmount} for ${res.data.processedCount} users!`,
      });
      fetchPremiumUsers(searchQuery);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to trigger payouts' });
    }
    setTriggering(false);
  };

  const handlePayoutSingleUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to process ৳${weeklyPayout} payout for ${userName}?`)) return;

    setSubmittingPayout(true);
    setMessage(null);

    const res = await apiFetch<{ processedCount: number; weeklyAmount: number }>(
      '/admin/premium/payout-selected',
      {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ user_ids: [userId] }),
      },
    );

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Successfully processed weekly payout of ৳${res.data.weeklyAmount} for ${userName}!`,
      });
      setViewUser(null);
      fetchPremiumUsers(searchQuery);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process payout' });
    }
    setSubmittingPayout(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Back Link */}
      <Link
        href="/admin/settings"
        className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-slate-400 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Settings</span>
      </Link>

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Global System Settings
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Configure system-wide parameters, premium weekly returns, and trigger payouts.
            </p>
          </div>
        </div>

        {/* Global Payout Trigger Button */}
        <div className="border-t border-emerald-700/60 pt-3 flex flex-wrap gap-2">
          <button
            onClick={handleTriggerGlobalPayouts}
            disabled={triggering}
            className="py-2 px-4 bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Processing Payouts...' : 'Trigger Global Weekly Payouts'}</span>
          </button>
        </div>
      </div>

      {/* Global Configuration Parameters Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">System Parameters</h2>
            <p className="text-[11px] font-medium text-slate-400">Set weekly payout amounts and coin pricing</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Weekly Payout Amount (৳)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                <input
                  type="number"
                  value={weeklyPayout}
                  onChange={(e) => setWeeklyPayout(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Weekly return per active premium member (52 weeks max).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Coin Market Rate (৳ / Coin)
              </label>
              <div className="relative">
                <Coins className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="0.01"
                  value={coinPrice}
                  onChange={(e) => setCoinPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Price per coin when user purchases via wallet balance.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Premium Free Bonus Coins
              </label>
              <input
                type="number"
                value={premiumFreeCoins}
                onChange={(e) => setPremiumFreeCoins(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              />
              <p className="text-[10px] text-slate-400 font-medium">Locked coins granted upon premium subscription.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Required Active Referrals
              </label>
              <input
                type="number"
                value={requiredReferrals}
                onChange={(e) => setRequiredReferrals(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              />
              <p className="text-[10px] text-slate-400 font-medium">Number of active referrals needed to unlock locked coins.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10 mt-2"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>{saving ? 'Saving System Settings...' : 'Save System Settings'}</span>
          </button>
        </form>
      </div>

      {/* Premium Users Weekly Payout Section — Max 3 Columns Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Premium Member Payouts</h2>
              <p className="text-[11px] font-medium text-slate-400">View progress and process individual weekly payouts</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, phone, code..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>

        {/* Max 3 Columns Table: User, Progress & Balance, Actions */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-2.5 py-2">User</th>
                <th className="px-2.5 py-2">Progress & Balance</th>
                <th className="px-2.5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loadingUsers ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400 text-xs">
                    Loading premium members...
                  </td>
                </tr>
              ) : premiumUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400 text-xs">
                    No active premium members found.
                  </td>
                </tr>
              ) : (
                premiumUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    {/* Column 1: User */}
                    <td className="px-2.5 py-2">
                      <p className="font-extrabold text-slate-900 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">
                        {user.full_name || user.phone}
                      </p>
                      <p className="text-slate-500 font-mono text-[9px]">{user.phone}</p>
                    </td>

                    {/* Column 2: Progress & Balance */}
                    <td className="px-2.5 py-2">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="font-extrabold text-primary font-mono text-[10px] sm:text-xs">
                          ৳{Number(user.wallet_balance).toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-lg bg-emerald-50 text-primary border border-emerald-200 font-extrabold text-[9px]">
                          {user.premium_payout_count}/52 wks
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Actions (Payout + View Icons) */}
                    <td className="px-2.5 py-2 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handlePayoutSingleUser(user.id, user.full_name || user.phone)}
                          disabled={submittingPayout}
                          title="Process Payout"
                          className="p-1.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white rounded-lg shadow-xs transition-all"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-secondary" />
                        </button>
                        <button
                          onClick={() => setViewUser(user)}
                          title="View Details"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== VIEW MEMBER DETAIL MODAL ===== */}
      {viewUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Member Details</h3>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Info */}
            <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Premium Member</span>
              <p className="font-extrabold text-slate-900 text-sm">{viewUser.full_name || 'Anonymous'}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {viewUser.phone} <span className="text-primary font-bold">• {viewUser.referral_code}</span>
              </p>
            </div>

            {/* Financial & Payout Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Wallet Balance</p>
                <p className="text-sm font-black text-primary font-mono mt-0.5">
                  ৳{Number(viewUser.wallet_balance).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Payout Progress</p>
                <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
                  {viewUser.premium_payout_count} / 52 wks
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 font-mono">
              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Last Payout</span>
                {viewUser.last_premium_payout_at ? new Date(viewUser.last_premium_payout_at).toLocaleDateString() : 'Never'}
              </div>
              <div>
                <span className="font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Subscription Expires</span>
                {viewUser.premium_expires_at ? new Date(viewUser.premium_expires_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <button
                onClick={() => handlePayoutSingleUser(viewUser.id, viewUser.full_name || viewUser.phone)}
                disabled={submittingPayout}
                className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
              >
                <DollarSign className="w-4 h-4 text-secondary" />
                <span>{submittingPayout ? 'Processing...' : `Process Weekly Payout (৳${weeklyPayout})`}</span>
              </button>

              <button
                onClick={() => setViewUser(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
