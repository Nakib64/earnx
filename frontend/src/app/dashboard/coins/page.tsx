'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { CoinInfo, CoinTransaction } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Coins,
  Lock,
  Unlock,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  History,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function UserCoinsPage() {
  const { refreshUserProfile } = useAuth();
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [buyAmount, setBuyAmount] = useState<number>(50);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [infoRes, txRes] = await Promise.all([
      apiFetch<CoinInfo>('/coins/info'),
      apiFetch<CoinTransaction[]>('/coins/transactions'),
    ]);

    if (infoRes.success && infoRes.data) {
      const data = (infoRes.data as any).data || infoRes.data;
      setCoinInfo(data);
    }
    if (txRes.success && txRes.data) {
      const data = (txRes.data as any).data || txRes.data;
      setTransactions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const handleBuyCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinInfo) return;
    if (buyAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid coin amount greater than 0.' });
      return;
    }

    const totalCost = buyAmount * coinInfo.coin_price;
    if (coinInfo.wallet_balance < totalCost) {
      setMessage({
        type: 'error',
        text: `Insufficient wallet balance. Total cost is ৳${totalCost.toLocaleString()}, but you only have ৳${coinInfo.wallet_balance.toLocaleString()}.`,
      });
      return;
    }

    setPurchasing(true);
    setMessage(null);

    const res = await apiFetch<{ amount: number; cost: number; new_coin_balance: number }>(
      '/coins/buy',
      {
        method: 'POST',
        body: JSON.stringify({ amount: buyAmount }),
      },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `Successfully purchased ${data.amount} coins for ৳${(data.cost || 0).toLocaleString()}!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to purchase coins.' });
    }
    setPurchasing(false);
  };

  const handleUnlockCoins = async () => {
    setUnlocking(true);
    setMessage(null);

    const res = await apiFetch<{ unlocked_amount: number; new_coin_balance: number }>(
      '/coins/unlock-premium',
      { method: 'POST' },
    );

    if (res.success && res.data) {
      const data = (res.data as any).data || res.data;
      setMessage({
        type: 'success',
        text: `🎉 Congratulations! You have unlocked ${data.unlocked_amount} premium bonus coins to your available balance!`,
      });
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to unlock coins.' });
    }
    setUnlocking(false);
  };

  const currentCoinPrice = coinInfo?.coin_price || 10;
  const totalBuyCost = (buyAmount || 0) * currentCoinPrice;
  const referralProgress = coinInfo
    ? Math.min(100, (coinInfo.active_referral_count / coinInfo.required_referral_count) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Asset Hub</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Coins & Bonus System</h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
            Earn, unlock, and purchase EarnX Coins using your wallet balance. Subscribe to Premium to claim locked bonus coins!
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 self-start sm:self-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center space-x-3">
            <Coins className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div>
              <p className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">Coin Market Rate</p>
              <p className="text-base font-bold text-white">৳{currentCoinPrice} / Coin</p>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Circle Background */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Available Coin Balance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Coins className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Available & Spendable
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Coin Balance</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : (coinInfo?.coin_balance ?? 0).toLocaleString()} <span className="text-amber-500 text-lg">Coins</span>
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Est. Value: ৳{((coinInfo?.coin_balance || 0) * currentCoinPrice).toLocaleString()} BDT</span>
            </p>
          </div>
        </div>

        {/* Card 2: Locked Premium Coins */}
        <div className="bg-white rounded-none border border-slate-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-none bg-yellow-50 border border-yellow-300 flex items-center justify-center text-[#854D0E]">
              <Lock className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-none text-xs font-bold bg-yellow-50 text-[#854D0E] border border-yellow-300">
              Referral Lock
            </span>
          </div>

          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Locked Premium Bonus Coins</p>
            <h2 className="text-3xl font-extrabold text-[#854D0E] mt-1">
              {loading ? '...' : (coinInfo?.locked_coin_balance ?? 0).toLocaleString()} <span className="text-[#854D0E] text-lg">Coins</span>
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {coinInfo?.is_premium_coins_unlocked
                ? '✅ Bonus fully unlocked & credited!'
                : `${coinInfo?.active_referral_count || 0} / ${coinInfo?.required_referral_count || 10} Active Referrals`}
            </p>
          </div>
        </div>

        {/* Card 3: Wallet Balance */}
        <div className="bg-white rounded-none border border-slate-200 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#005A36]">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-none text-xs font-bold bg-emerald-50 text-[#005A36] border border-emerald-200">
              Main Wallet
            </span>
          </div>

          <div>
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Available Wallet Balance</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              ৳{loading ? '...' : (coinInfo?.wallet_balance ?? 0).toLocaleString()}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Use your wallet balance to buy coins anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Locked Coins Banner / Premium Status Card */}
      <div className="bg-[#005A36] rounded-none p-6 sm:p-8 text-white shadow-xs relative overflow-hidden border-b-4 border-[#D4AF37]">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-none bg-black/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Premium Bonus Coins Rule</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {coinInfo?.is_premium
                ? coinInfo.is_premium_coins_unlocked
                  ? '🎉 Bonus Unlocked & Credited!'
                  : `🎁 ${coinInfo.locked_coin_balance ?? 0} Premium Bonus Coins Locked`
                : `🎁 Get ${coinInfo?.premium_free_coins || 100} Locked Free Coins with Premium`}
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              When you take a Premium membership, you are granted <strong>{coinInfo?.premium_free_coins || 100} Free Coins</strong> in a locked state. To unlock these coins into your spendable balance, you must refer at least <strong>{coinInfo?.required_referral_count || 10} active users</strong>.
            </p>

            {/* Active Referral Progress Bar */}
            <div className="pt-2 space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-emerald-100 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>Successful Active Referrals</span>
                </span>
                <span className="text-[#D4AF37] font-mono">
                  {coinInfo?.active_referral_count || 0} / {coinInfo?.required_referral_count || 10} Active Users
                </span>
              </div>
              <div className="w-full bg-[#044D2F] rounded-none h-3 border border-emerald-400/30 p-0.5 overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full rounded-none transition-all duration-500"
                  style={{ width: `${referralProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Box on the Right */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-none flex flex-col items-center text-center space-y-4">
            {!coinInfo?.is_premium ? (
              <>
                <div className="w-12 h-12 rounded-none bg-black/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Unlock Condition</p>
                  <p className="text-xs text-emerald-100/80 mt-1">Upgrade to Premium to receive your locked bonus coins.</p>
                </div>
              </>
            ) : coinInfo.is_premium_coins_unlocked ? (
              <>
                <div className="w-12 h-12 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#005A36]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-emerald-200">Unlocked & Claimed</p>
                  <p className="text-xs text-emerald-100/80 mt-1">Your premium coins have been credited to your balance.</p>
                </div>
              </>
            ) : coinInfo.can_unlock ? (
              <>
                <div className="w-12 h-12 rounded-none bg-black/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Unlock className="w-6 h-6" />
                </div>
                <button
                  onClick={handleUnlockCoins}
                  disabled={unlocking}
                  className="w-full py-3 px-6 bg-[#D4AF37] hover:bg-[#B89628] text-slate-950 font-extrabold text-sm rounded-none flex items-center justify-center space-x-2 shadow-xs transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{unlocking ? 'Unlocking...' : `Unlock ${coinInfo.locked_coin_balance ?? 0} Coins Now!`}</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-none bg-black/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#D4AF37]">Locked ({coinInfo.locked_coin_balance ?? 0} Coins)</p>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    Needs {(coinInfo.required_referral_count || 10) - (coinInfo.active_referral_count || 0)} more active referral(s) to unlock.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buy Coins Form Section */}
      <div className="bg-white rounded-none border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-[#005A36]" />
              <span>Purchase Coins with Wallet Balance</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Buy coins instantly using your available main wallet balance (৳{coinInfo?.wallet_balance.toLocaleString() || 0}).
            </p>
          </div>

          <span className="text-xs font-extrabold px-3 py-1.5 rounded-none bg-emerald-50 text-[#005A36] border border-emerald-200 flex items-center space-x-1.5 self-start sm:self-auto">
            <Coins className="w-3.5 h-3.5 text-[#005A36]" />
            <span>Rate: ৳{currentCoinPrice} / Coin</span>
          </span>
        </div>

        <form onSubmit={handleBuyCoins} className="space-y-6">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Quick Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[10, 50, 100, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBuyAmount(preset)}
                  className={`py-3 px-4 rounded-none border text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${
                    buyAmount === preset
                      ? 'bg-[#005A36] border-[#005A36] text-white border-b-2 border-[#D4AF37]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>+{preset} Coins</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input & Cost Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Number of Coins</label>
              <div className="relative">
                <Coins className="w-5 h-5 text-[#005A36] absolute left-4 top-3.5" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={buyAmount || ''}
                  onChange={(e) => setBuyAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Enter coin quantity..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] text-base"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-none p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Purchase Cost</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">৳{totalBuyCost.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-400">Wallet After Purchase</p>
                <p
                  className={`text-sm font-extrabold mt-0.5 font-mono ${
                    (coinInfo?.wallet_balance || 0) - totalBuyCost >= 0
                      ? 'text-[#005A36]'
                      : 'text-rose-700'
                  }`}
                >
                  ৳{((coinInfo?.wallet_balance || 0) - totalBuyCost).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={purchasing || buyAmount <= 0 || (coinInfo?.wallet_balance || 0) < totalBuyCost}
            className="w-full py-4 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-extrabold text-base rounded-none flex items-center justify-center space-x-2 border-b-4 border-[#D4AF37] transition-all cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
            <span>{purchasing ? 'Processing Purchase...' : `Confirm & Buy ${buyAmount} Coins`}</span>
          </button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-none border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
          <History className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Coin Transaction History</h2>
        </div>

        <div className="overflow-x-auto rounded-none border border-slate-200">
          <table className="w-full text-left text-[10px] sm:text-[11px]">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[9px] sm:text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Type & Coins</th>
                <th className="px-3 py-2.5">Balance</th>
                <th className="px-3 py-2.5 text-right">Note & Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    Loading coin transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    No coin transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-none text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider ${
                            tx.type === 'PURCHASE'
                              ? 'bg-emerald-50 text-[#005A36] border border-emerald-300'
                              : tx.type === 'PREMIUM_UNLOCKED'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : tx.type === 'PREMIUM_LOCKED_REWARD'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                        <span className="font-extrabold text-[11px] text-slate-900 font-mono">
                          +{Number(tx.amount).toLocaleString()} Coins
                        </span>
                        {tx.cost_bdt && (
                          <span className="text-[10px] text-[#005A36] font-extrabold">
                            (৳{Number(tx.cost_bdt).toLocaleString()})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-500 truncate max-w-[130px]">
                      {Number(tx.coins_before).toLocaleString()} → <strong className="text-slate-800">{Number(tx.coins_after).toLocaleString()}</strong>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="text-slate-700 text-[10px] font-medium truncate max-w-[160px] sm:max-w-[240px] ml-auto">
                        {tx.description || '-'}
                      </div>
                      <div className="text-slate-400 text-[9px] font-mono">
                        {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
