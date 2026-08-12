'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { SystemConfigMap } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Coins,
  Settings,
  Save,
  Search,
  Users,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AdminCoinUser {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  coin_balance: number | string;
  locked_coin_balance: number | string;
  is_premium: boolean;
  premium_coins_granted: boolean;
  is_premium_coins_unlocked: boolean;
}

interface AdminCoinStats {
  configs: {
    COIN_PRICE: number;
    PREMIUM_FREE_COINS: number;
    PREMIUM_FREE_COINS_REQUIRED_REFERRALS: number;
  };
  stats: {
    total_available_coins: number;
    total_locked_coins: number;
    user_count: number;
  };
  users: AdminCoinUser[];
}

export default function AdminCoinsPage() {
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Config Form State
  const [coinPrice, setCoinPrice] = useState('10');
  const [premiumFreeCoins, setPremiumFreeCoins] = useState('100');
  const [requiredReferrals, setRequiredReferrals] = useState('10');

  // Stats & Users State
  const [statsData, setStatsData] = useState<AdminCoinStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<AdminCoinUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustIsLocked, setAdjustIsLocked] = useState<boolean>(false);
  const [adjustDescription, setAdjustDescription] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiFetch<AdminCoinStats>('/coins/admin/stats', { isAdmin: true });
    if (res.success && res.data) {
      setStatsData(res.data);
      if (res.data.configs) {
        setCoinPrice(String(res.data.configs.COIN_PRICE || 10));
        setPremiumFreeCoins(String(res.data.configs.PREMIUM_FREE_COINS || 100));
        setRequiredReferrals(
          String(res.data.configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || 10),
        );
      }
    }
    setLoading(false);
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage(null);

    const requests = [
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
        body: JSON.stringify({
          key: 'PREMIUM_FREE_COINS_REQUIRED_REFERRALS',
          value: requiredReferrals,
        }),
      }),
    ];

    const results = await Promise.all(requests);
    const allSuccessful = results.every((r) => r.success);

    if (allSuccessful) {
      setMessage({
        type: 'success',
        text: 'Coin system configuration saved successfully!',
      });
      await fetchStats();
    } else {
      setMessage({
        type: 'error',
        text: 'Failed to update some coin configurations. Please try again.',
      });
    }
    setSavingConfig(false);
  };

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;

    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      setMessage({ type: 'error', text: 'Please enter a non-zero adjustment amount.' });
      return;
    }

    setAdjusting(true);
    setMessage(null);

    const res = await apiFetch('/coins/admin/adjust', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        user_id: selectedUser.id,
        amount: amountNum,
        is_locked: adjustIsLocked,
        description: adjustDescription || 'Admin manual adjustment',
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Successfully adjusted ${adjustIsLocked ? 'locked' : 'available'} coins for ${
          selectedUser.full_name || selectedUser.phone
        }!`,
      });
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustDescription('');
      await fetchStats();
    } else {
      setMessage({
        type: 'error',
        text: res.error?.message || 'Failed to adjust user coins.',
      });
    }
    setAdjusting(false);
  };

  const filteredUsers = (statsData?.users || []).filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      u.phone.toLowerCase().includes(q) ||
      u.referral_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span>Coin Management & Global Rules</span>
          </h1>
          <p className="text-xs text-slate-500">
            Set coin market rates, free premium rewards, required referral counts, and view/adjust user coin balances.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Rate: ৳{coinPrice} / Coin</span>
          </span>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* System Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spendable Coins</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {loading ? '...' : (statsData?.stats.total_available_coins || 0).toLocaleString()} Coins
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Locked Premium Coins</p>
            <h2 className="text-2xl font-extrabold text-purple-900 mt-0.5">
              {loading ? '...' : (statsData?.stats.total_locked_coins || 0).toLocaleString()} Coins
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Users Count</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {loading ? '...' : (statsData?.stats.user_count || 0).toLocaleString()} Users
            </h2>
          </div>
        </div>
      </div>

      {/* Global Coin Configuration Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-sky-600" />
          <span>Global Coin Parameters</span>
        </h2>

        <form onSubmit={handleSaveConfigs} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Coin Market Price (৳)</label>
            <p className="text-xs text-slate-500">Price in BDT per coin when user purchases using wallet balance.</p>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={coinPrice}
                onChange={(e) => setCoinPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Premium Free Bonus Coins</label>
            <p className="text-xs text-slate-500">Amount of coins granted in locked state when user takes Premium.</p>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-500 absolute left-4 top-3.5" />
              <input
                type="number"
                step="1"
                min="0"
                value={premiumFreeCoins}
                onChange={(e) => setPremiumFreeCoins(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Required Active Referrals to Unlock</label>
            <p className="text-xs text-slate-500">Number of active direct referrals required to unlock locked coins.</p>
            <div className="relative">
              <Users className="w-4 h-4 text-purple-500 absolute left-4 top-3.5" />
              <input
                type="number"
                step="1"
                min="1"
                value={requiredReferrals}
                onChange={(e) => setRequiredReferrals(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="py-3 px-8 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center space-x-2 shadow-md shadow-sky-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'Saving Configurations...' : 'Save System Configurations'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* User Coin Balances & Adjustments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span>User Coin Balances & Manual Adjustments</span>
            </h2>
            <p className="text-xs text-slate-500">
              View user available and locked coin balances. Perform manual coin additions or deductions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Referral Code</th>
                <th className="p-3.5">Available Coins</th>
                <th className="p-3.5">Locked Coins</th>
                <th className="p-3.5">Premium Status</th>
                <th className="p-3.5">Unlock Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading user coin records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No users found matching your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{u.full_name || 'Anonymous User'}</p>
                      <p className="text-slate-500 text-[11px]">{u.phone}</p>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{u.referral_code}</td>
                    <td className="p-3.5 font-extrabold text-amber-600 text-sm">
                      {Number(u.coin_balance).toLocaleString()} Coins
                    </td>
                    <td className="p-3.5 font-bold text-purple-700">
                      {Number(u.locked_coin_balance).toLocaleString()} Coins
                    </td>
                    <td className="p-3.5">
                      {u.is_premium ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                          Premium
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {u.is_premium_coins_unlocked ? (
                        <span className="inline-flex items-center text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Unlocked
                        </span>
                      ) : Number(u.locked_coin_balance) > 0 ? (
                        <span className="inline-flex items-center text-amber-600 font-bold">
                          <Lock className="w-3.5 h-3.5 mr-1" /> Locked
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setAdjustAmount('');
                          setAdjustIsLocked(false);
                          setAdjustDescription('');
                        }}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all"
                      >
                        Adjust Coins
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Coin Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span>Adjust User Coins</span>
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-xs">
              <p className="font-bold text-slate-800">{selectedUser.full_name || 'Anonymous User'}</p>
              <p className="text-slate-500">Phone: {selectedUser.phone} | Code: {selectedUser.referral_code}</p>
              <div className="pt-2 flex justify-between font-semibold border-t border-slate-200 mt-2">
                <span>Available: {Number(selectedUser.coin_balance)} Coins</span>
                <span>Locked: {Number(selectedUser.locked_coin_balance)} Coins</span>
              </div>
            </div>

            <form onSubmit={handleAdjustCoins} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adjustment Target</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustIsLocked(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !adjustIsLocked
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Available Coins
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustIsLocked(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      adjustIsLocked
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Locked Coins
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adjustment Amount</label>
                <p className="text-[11px] text-slate-400">Use positive numbers to add coins (e.g. 50) or negative numbers to deduct (e.g. -20).</p>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 50 or -20"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reason / Description</label>
                <input
                  type="text"
                  placeholder="Admin adjustment reason..."
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !adjustAmount}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-md"
                >
                  {adjusting ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
