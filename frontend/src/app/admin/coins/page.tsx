'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { SolanaLogo } from '../../../components/common/SolanaLogo';
import {
  Coins,
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
  ChevronRight,
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
}

interface UsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
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

  // Stats
  const [statsData, setStatsData] = useState<AdminCoinStats | null>(null);

  // Users infinite scroll state
  const [users, setUsers] = useState<AdminCoinUser[]>([]);
  const [usersMeta, setUsersMeta] = useState<UsersMeta | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Adjustment Modal State
  const [selectedUser, setSelectedUser] = useState<AdminCoinUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustIsLocked, setAdjustIsLocked] = useState<boolean>(false);
  const [adjustDescription, setAdjustDescription] = useState<string>('');

  useEffect(() => {
    fetchStats();
    fetchUsers(1, '');
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiFetch<AdminCoinStats>('/coins/admin/stats', { isAdmin: true });
    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setStatsData(data);
      if (data.configs) {
        setCoinPrice(String(data.configs.COIN_PRICE || 10));
        setPremiumFreeCoins(String(data.configs.PREMIUM_FREE_COINS || 100));
        setRequiredReferrals(String(data.configs.PREMIUM_FREE_COINS_REQUIRED_REFERRALS || 10));
      }
    }
    setLoading(false);
  };

  const fetchUsers = async (page: number, search: string, append = false) => {
    setUsersLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);

    const res = await apiFetch<{ data: AdminCoinUser[]; meta: UsersMeta }>(
      `/coins/admin/users?${params.toString()}`,
      { isAdmin: true },
    );

    if (res.success && res.data) {
      const responseData = (res.data as any).data || res.data;
      const usersArray = Array.isArray(responseData) ? responseData : responseData.data || [];
      const meta = (res.data as any).meta || responseData.meta;

      if (append) {
        setUsers((prev) => [...prev, ...usersArray]);
      } else {
        setUsers(usersArray);
      }
      if (meta) setUsersMeta(meta);
    }
    setUsersLoading(false);
  };

  // Infinite scroll sentinel ref callback
  const lastUserRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (usersLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && usersMeta?.hasMore) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchUsers(nextPage, searchQuery, true);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [usersLoading, usersMeta?.hasMore, currentPage, searchQuery],
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, value, false);
    }, 400);
  };

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setMessage(null);

    const res = await apiFetch('/coins/admin/configs', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({
        COIN_PRICE: parseFloat(coinPrice),
        PREMIUM_FREE_COINS: parseInt(premiumFreeCoins, 10),
        PREMIUM_FREE_COINS_REQUIRED_REFERRALS: parseInt(requiredReferrals, 10),
      }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Global coin configurations saved successfully!' });
      await fetchStats();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to save coin configurations.' });
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
        text: `Successfully adjusted ${adjustIsLocked ? 'locked' : 'available'} coins for ${selectedUser.full_name || selectedUser.phone}!`,
      });
      setSelectedUser(null);
      setAdjustAmount('');
      setAdjustDescription('');
      await fetchStats();
      setCurrentPage(1);
      await fetchUsers(1, searchQuery, false);
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to adjust user coins.' });
    }
    setAdjusting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Spendable Coins */}
        <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
            Spendable Coins <SolanaLogo size={20} />
          </span>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-[#d4af37]/60 bg-amber-500/10 flex items-center justify-center shrink-0">
              <SolanaLogo size={32} />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-1.5">
                {loading ? '...' : (statsData?.stats.total_available_coins || 0).toLocaleString()}
                <SolanaLogo size={24} />
              </div>
              <div className="text-xs font-bold text-slate-300">Total Available</div>
            </div>
          </div>
          <div className="pt-1 flex items-center space-x-1.5 text-xs font-extrabold text-[#10b981]">
            <TrendingUp className="w-4 h-4" />
            <span>{statsData?.stats.user_count || 0} system users</span>
          </div>
        </div>

        {/* Card 2: Locked Coins */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
            Locked Coins <SolanaLogo size={20} />
          </span>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-100 font-mono tracking-tight flex items-center gap-1.5">
                {loading ? '...' : (statsData?.stats.total_locked_coins || 0).toLocaleString()}
                <SolanaLogo size={24} />
              </div>
              <div className="text-xs font-bold text-amber-300">Premium Locked</div>
            </div>
          </div>
          <div className="pt-1">
            <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-[#3d2705] text-amber-200 border border-amber-500/40 font-mono inline-flex items-center gap-1">
              ৳{coinPrice} / <SolanaLogo size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Global Coin Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">Global Coin Parameters</h2>
            <p className="text-xs font-bold text-slate-400">Configure pricing, premium rewards, and referral requirements</p>
          </div>
        </div>

        <form onSubmit={handleSaveConfigs} className="space-y-4">
          {/* Config Item 1 */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-extrabold text-slate-800">Coin Market Price (৳)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Price in BDT per coin when user purchases using wallet balance.</p>
            <div className="relative">
              <DollarSign className="w-5 h-5 text-[#01281a] absolute left-3.5 top-3" />
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={coinPrice}
                onChange={(e) => setCoinPrice(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] text-sm"
              />
            </div>
          </div>

          {/* Config Item 2 */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
            <div className="flex items-center space-x-3">
              <Coins className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-extrabold text-slate-800">Premium Free Bonus Coins</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Amount of coins granted in locked state when user takes Premium.</p>
            <div className="relative">
              <Coins className="w-5 h-5 text-primary absolute left-3.5 top-3" />
              <input
                type="number"
                step="1"
                min="0"
                value={premiumFreeCoins}
                onChange={(e) => setPremiumFreeCoins(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Config Item 3 */}
          <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-extrabold text-slate-800">Required Active Referrals to Unlock</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Number of active direct referrals required to unlock locked coins.</p>
            <div className="relative">
              <Users className="w-5 h-5 text-primary absolute left-3.5 top-3" />
              <input
                type="number"
                step="1"
                min="1"
                value={requiredReferrals}
                onChange={(e) => setRequiredReferrals(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingConfig}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>{savingConfig ? 'Saving Configurations...' : 'Save System Configurations'}</span>
          </button>
        </form>
      </div>

      {/* User Coin Balances & Adjustments */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">User Coin Balances</h2>
              <p className="text-[11px] font-medium text-slate-400">View and adjust user coin balances</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search name, phone, code..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">User & Ref</th>
                <th className="px-4 py-3">Coins & Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    Loading user coin records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    No users found matching your search query.
                  </td>
                </tr>
              ) : (
                users.map((u, index) => {
                  const isLast = index === users.length - 1;
                  return (
                    <tr
                      key={u.id}
                      ref={isLast ? lastUserRef : null}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-extrabold text-slate-900 text-[11px] truncate max-w-[130px] sm:max-w-[180px]">
                          {u.full_name || u.phone}
                        </p>
                        <p className="text-slate-500 font-mono text-[9px]">
                          {u.phone} <span className="text-primary font-bold">• {u.referral_code}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="font-extrabold text-primary">
                            {Number(u.coin_balance).toLocaleString()} Avail
                          </span>
                          <span className="font-bold text-[#854D0E]">
                            ({Number(u.locked_coin_balance).toLocaleString()} Locked)
                          </span>
                          {u.is_premium_coins_unlocked ? (
                            <span className="inline-flex items-center text-primary font-extrabold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Unlocked
                            </span>
                          ) : Number(u.locked_coin_balance) > 0 ? (
                            <span className="inline-flex items-center text-amber-800 font-extrabold text-[9px] bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-200">
                              <Lock className="w-3 h-3 mr-0.5" /> Locked
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustAmount('');
                            setAdjustIsLocked(false);
                            setAdjustDescription('');
                          }}
                          className="py-1.5 px-3 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-[10px] rounded-xl shadow-sm transition-all"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              {/* Infinite scroll loading indicator */}
              {usersLoading && users.length > 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-extrabold">
                      <div className="w-4 h-4 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
                      <span>Loading more users...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Meta Info */}
        {usersMeta && (
          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pt-1">
            <span>Showing {users.length} of {usersMeta.total} users</span>
            <span>Page {usersMeta.page} of {usersMeta.totalPages}</span>
          </div>
        )}
      </div>

      {/* Manual Coin Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl relative border border-slate-200/90">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Adjust User Coins</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <p className="font-extrabold text-slate-800">{selectedUser.full_name || 'Anonymous User'}</p>
              <p className="text-slate-500 font-mono">Phone: {selectedUser.phone} | Code: {selectedUser.referral_code}</p>
              <div className="pt-2 flex justify-between font-extrabold border-t border-slate-200 mt-2 font-mono">
                <span className="text-primary">Available: {Number(selectedUser.coin_balance)} Coins</span>
                <span className="text-[#854D0E]">Locked: {Number(selectedUser.locked_coin_balance)} Coins</span>
              </div>
            </div>

            <form onSubmit={handleAdjustCoins} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Adjustment Target</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustIsLocked(false)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all ${!adjustIsLocked
                      ? 'bg-[#005A36] border-[#005A36] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Available Coins
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustIsLocked(true)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold transition-all ${adjustIsLocked
                      ? 'bg-amber-100 border-amber-300 text-[#854D0E]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    Locked Coins
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Adjustment Amount</label>
                <p className="text-[11px] text-slate-400 font-medium">Use positive to add (e.g. 50) or negative to deduct (e.g. -20).</p>
                <div className="relative">
                  <Coins className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 50 or -20"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Reason / Description</label>
                <input
                  type="text"
                  placeholder="Admin adjustment reason..."
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-1 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting || !adjustAmount}
                  className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
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
