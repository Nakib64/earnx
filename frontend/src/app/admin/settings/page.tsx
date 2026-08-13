'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { SystemConfigMap } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { Settings, Save, RefreshCw, Search, Users, CheckSquare, Square, DollarSign, UserCheck, Lock, User } from 'lucide-react';

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

export default function AdminSettingsPage() {
  const { admin, refreshAdminProfile } = useAuth();

  // Admin Profile State
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);

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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submittingSelectedPayout, setSubmittingSelectedPayout] = useState(false);

  useEffect(() => {
    if (admin) setAdminName(admin.name || '');
    fetchSettings();
    fetchPremiumUsers();
  }, [admin]);

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

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    setMessage(null);

    const bodyData: any = { name: adminName.trim() };
    if (newPassword) {
      bodyData.current_password = currentPassword;
      bodyData.new_password = newPassword;
    }

    const res = await apiFetch('/admin/auth/profile', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(bodyData),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      await refreshAdminProfile();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to update admin profile' });
    }
    setSavingAdminProfile(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchPremiumUsers(q);
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === premiumUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(premiumUsers.map((u) => u.id));
    }
  };

  const handleToggleUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uId) => uId !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSave = async () => {
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
    if (results.every(r => r.success)) {
      setMessage({ type: 'success', text: 'All Global Settings updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update some settings' });
    }
    setSaving(false);
  };

  const handleTriggerPayouts = async () => {
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

  const handlePayoutSelected = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Are you sure you want to process ৳${weeklyPayout} payout for ${selectedUserIds.length} selected user(s)?`)) return;

    setSubmittingSelectedPayout(true);
    setMessage(null);

    const res = await apiFetch<{ processedCount: number; weeklyAmount: number }>(
      '/admin/premium/payout-selected',
      {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ user_ids: selectedUserIds }),
      },
    );

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Successfully processed weekly premium payout of ৳${res.data.weeklyAmount} for ${res.data.processedCount} selected user(s)!`,
      });
      setSelectedUserIds([]);
      fetchPremiumUsers(searchQuery);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process selected payouts' });
    }
    setSubmittingSelectedPayout(false);
  };

  const allSelected = premiumUsers.length > 0 && selectedUserIds.length === premiumUsers.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-emerald-700" />
            <span>Admin Settings & Profile</span>
          </h1>
          <p className="text-xs text-slate-500">Update your admin credentials and global system settings.</p>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Admin Profile Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-700" />
          <span>Admin Profile & Password</span>
        </h2>

        <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Name
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (Readonly)
              </label>
              <input
                type="text"
                disabled
                value={admin?.phone || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password (required to change)
              </label>
              <input
                type="password"
                placeholder="Current password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="New password (min. 6 chars)..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingAdminProfile}
            className="w-full py-3 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>{savingAdminProfile ? 'Saving Profile...' : 'Save Admin Profile'}</span>
          </button>
        </form>
      </div>

      {/* Global Premium Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Premium Package Weekly Payout Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Weekly Payout Amount Per Premium User (৳)
            </label>
            <p className="text-xs text-slate-500">
              Every active premium user will receive this exact amount every week for 1 year (52 weeks max).
            </p>
            <input
              type="number"
              value={weeklyPayout}
              onChange={(e) => setWeeklyPayout(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full py-3 px-6 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-secondary" />
              <span>{saving ? 'Saving...' : 'Save Global Settings'}</span>
            </button>
          </div>
        </div>

        {/* Manual Global Trigger Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Run Global Weekly Payout Process Now</h3>
            <p className="text-xs text-slate-500">
              Executes payouts for all active premium subscribers immediately. Resets 7-day timer for each user.
            </p>
          </div>
          <button
            onClick={handleTriggerPayouts}
            disabled={triggering}
            className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Executing Payouts...' : 'Trigger Global Payouts Now'}</span>
          </button>
        </div>
      </div>

      {/* Target / Specific User Payout Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Targeted / Specific User Weekly Payouts</span>
            </h2>
            <p className="text-xs text-slate-500">
              Search and select specific premium users to give them immediate weekly payouts (resets their 7-day timer).
            </p>
          </div>

          {selectedUserIds.length > 0 && (
            <button
              onClick={handlePayoutSelected}
              disabled={submittingSelectedPayout}
              className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-purple-600/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>
                {submittingSelectedPayout
                  ? 'Processing Payouts...'
                  : `Payout ৳${weeklyPayout} to Selected (${selectedUserIds.length})`}
              </span>
            </button>
          )}
        </div>

        {/* Search Bar & Filters */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search premium user by name, phone, or referral code..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
          />
        </div>

        {/* Table of Premium Users with Multi-Select Checkboxes */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleToggleSelectAll} type="button" className="text-slate-500 hover:text-slate-800">
                    {allSelected ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3">User</th>
                <th className="p-3">Referral Code</th>
                <th className="p-3">Wallet Balance</th>
                <th className="p-3">Payout Progress</th>
                <th className="p-3">Last Payout Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Loading premium users...
                  </td>
                </tr>
              ) : premiumUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No active premium users found.
                  </td>
                </tr>
              ) : (
                premiumUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleToggleUser(user.id)} type="button">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{user.full_name || 'Anonymous User'}</p>
                        <p className="text-slate-500 text-[11px]">{user.phone}</p>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{user.referral_code}</td>
                      <td className="p-3 font-bold text-emerald-600">
                        ৳{Number(user.wallet_balance).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                          {user.premium_payout_count} / 52 weeks
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {user.last_premium_payout_at
                          ? new Date(user.last_premium_payout_at).toLocaleDateString()
                          : 'Never'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
