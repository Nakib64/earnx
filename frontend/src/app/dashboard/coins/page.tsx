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


      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 sm:gap-6">
        {/* Card 1: Available Coin Balance */}
        <div className="bg-white rounded-none border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Available Coins
            </span>

          </div>

          <div className="">
            <div className='flex gap-4 justify-start items-center '>
              <h2 className="text-4xl sm:text-4xl font-black text-primary/80 font-mono tracking-tight">
                {loading ? '...' : (coinInfo?.coin_balance ?? 0).toLocaleString()}
              </h2>
              <Coins className="text-4xl text-primary/50" />
            </div>

            <p className="text-[14px] sm:text-sm text-slate-500 mt-1 flex items-center space-x-1 font-mono truncate">
              <TrendingUp className="text-4xl text-primary/50 shrink-0" />
              <span className='text-primary/80 font-extrabold'>Est: {((coinInfo?.coin_balance || 0) * currentCoinPrice).toLocaleString()} BDT</span>
            </p>
          </div>
        </div>

        {/* Card 2: Locked Premium Coins */}
        <div className="bg-white rounded-none border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Locked Bonus
            </span>
          </div>

          <div className="">
            <div className="flex gap-4 justify-start items-center">
              <h2 className="text-4xl sm:text-4xl font-black text-amber-800/80 font-mono tracking-tight">
                {loading ? '...' : (coinInfo?.locked_coin_balance ?? 0).toLocaleString()}
              </h2>
              <Lock className="text-4xl text-amber-800/50" />
            </div>

            <p className="text-[14px] sm:text-sm text-slate-500 mt-1 flex items-center space-x-1 font-mono truncate">
              <span className="text-amber-800/80 font-extrabold truncate">
                {coinInfo?.is_premium_coins_unlocked
                  ? '✅ Unlocked!'
                  : `${coinInfo?.active_referral_count || 0}/${coinInfo?.required_referral_count || 10} Referrals`}
              </span>
            </p>
          </div>
        </div>

        {/* Card 3: Wallet Balance */}
        <div className="bg-white rounded-none border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider truncate">
              Main Wallet
            </span>
          </div>

          <div className="">
            <div className="flex gap-4 justify-start items-center">
              <h2 className="text-3xl sm:text-3xl font-black text-primary/80 font-mono tracking-tight">
                 {loading ? '...' : (coinInfo?.wallet_balance ?? 0).toLocaleString()}
              </h2>
              <Wallet className="text-3xl text-primary/50" />
            </div>

            <p className="text-[14px] sm:text-sm text-slate-500 mt-1 flex items-center space-x-1 font-mono truncate">
              <span className="text-primary/80 font-extrabold">Available Wallet Balance</span>
            </p>
          </div>
        </div>
      </div>

      {/* Locked Coins Banner / Premium Status Card */}
      <div className="bg-primary rounded-none p-4 sm:p-8 text-white shadow-xs relative overflow-hidden ">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">


            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {coinInfo?.is_premium
                ? coinInfo.is_premium_coins_unlocked
                  ? '🎉 Bonus Unlocked & Credited!'
                  : `🎁 ${coinInfo.locked_coin_balance ?? 0} Premium Bonus Coins Locked`
                : `🎁 Get ${coinInfo?.premium_free_coins || 100} Locked Free Coins with Premium`}
            </h3>


            {/* Active Referral Progress Bar */}
            <div className="pt-2 space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-emerald-100 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>Successful Active Referrals</span>
                </span>
                <span className="text-secondary font-mono">
                  {coinInfo?.active_referral_count || 0} / {coinInfo?.required_referral_count || 10} Active Users
                </span>
              </div>
              <div className="w-full bg-[#044D2F] rounded-none h-3 border border-emerald-400/30 p-0.5 overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-none transition-all duration-500"
                  style={{ width: `${referralProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Coins Form Section */}
      <div className="bg-white rounded-none border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <ShoppingCart className="text-3xl text-primary/70" />
              <span>Purchase Coins</span>
            </h2>
          </div>

          <span className="text-xs font-extrabold px-3 py-1.5 rounded-none bg-emerald-50 text-primary border border-emerald-200 flex items-center space-x-1.5 self-start sm:self-auto">
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
                  className={`py-3 px-4 rounded-none border text-sm font-extrabold transition-all flex items-center justify-center space-x-2 ${buyAmount === preset
                    ? 'bg-primary/80 border-primary/50 text-white'
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
                <Coins className="w-5 h-5 text-primary absolute left-4 top-3.5" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={buyAmount || ''}
                  onChange={(e) => setBuyAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="Enter coin quantity..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-none font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-base"
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
                  className={`text-sm font-extrabold mt-0.5 font-mono ${(coinInfo?.wallet_balance || 0) - totalBuyCost >= 0
                    ? 'text-primary'
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
            className="w-full py-4 bg-primary hover:bg-[#044D2F] disabled:opacity-50 text-white font-extrabold text-base rounded-none flex items-center justify-center space-x-2  transition-all cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-secondary" />
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
                <th className="px-3 py-2.5">Coins</th>
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

                        <span className="font-extrabold text-[11px] text-slate-900 font-mono">
                          +{Number(tx.amount).toLocaleString()} Coins
                        </span>
                        {tx.cost_bdt && (
                          <span className="text-[10px] text-primary font-extrabold">
                            (৳{Number(tx.cost_bdt).toLocaleString()})
                          </span>
                        )}
                      </div>
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
