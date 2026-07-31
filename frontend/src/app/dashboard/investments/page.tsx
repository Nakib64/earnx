'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function UserInvestmentsPage() {
  const { user, refreshUserProfile } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(10000);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, myRes] = await Promise.all([
      apiFetch<InvestmentPlan[]>('/investments/plans'),
      apiFetch<UserInvestment[]>('/investments/my'),
    ]);
    if (plansRes.success && plansRes.data) setPlans(plansRes.data);
    if (myRes.success && myRes.data) setMyInvestments(myRes.data);
    setLoading(false);
  };

  const handleOpenInvest = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setInvestAmount(Number(plan.min_amount));
    setMessage(null);
  };

  const handleInvest = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        planId: selectedPlan.id,
        amount: investAmount,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: 'Investment created successfully! Monthly dividends will be added to your wallet.',
      });
      setSelectedPlan(null);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit investment' });
    }
    setSubmitting(false);
  };

  const walletBal = user ? Number(user.wallet_balance) : 0;

  const tableColumns: ColumnDef<UserInvestment>[] = [
    {
      key: 'plan',
      header: 'Package / Plan',
      render: (inv) => <span className="font-semibold text-slate-900">{inv.plan?.title || 'Investment Plan'}</span>,
    },
    {
      key: 'amount',
      header: 'Invested Amount',
      render: (inv) => <span className="font-bold text-sky-600">৳{Number(inv.amount).toLocaleString()}</span>,
    },
    {
      key: 'monthly_return_percent',
      header: 'Return Rate',
      render: (inv) => <span className="font-medium text-emerald-600">{Number(inv.monthly_return_percent)}% / mo</span>,
    },
    {
      key: 'monthly_payout_amount',
      header: 'Monthly Payout',
      render: (inv) => <span className="font-bold text-slate-900">৳{Number(inv.monthly_payout_amount).toLocaleString()}</span>,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (inv) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          {inv.total_payouts_made} / {inv.max_payouts} payouts
        </span>
      ),
    },
    {
      key: 'next_payout_at',
      header: 'Next Payout',
      render: (inv) => (
        <span className="text-slate-500">
          {inv.next_payout_at ? new Date(inv.next_payout_at).toLocaleDateString() : 'Completed'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (inv) => <StatusBadge status={inv.status} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 p-6 sm:p-8 text-white shadow-xl shadow-sky-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-100 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Earn Monthly Dividends</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Investment & Wealth Growth
            </h1>
            <p className="text-sky-100 text-sm max-w-xl">
              Invest your funds securely to receive high-yield monthly returns automatically credited directly to your wallet balance.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center space-x-4 min-w-[220px]">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-sky-100">Available Wallet</p>
              <p className="text-2xl font-bold text-white">৳{walletBal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Investment Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <span>High-Yield Investment Packages</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">Admin Guaranteed Returns</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
            No investment plans available at the moment. Please check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const minAmt = Number(plan.min_amount);
              const maxAmt = Number(plan.max_amount);
              const returnPct = Number(plan.monthly_return_percent);
              const isPopular = returnPct >= 10;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
                    isPopular
                      ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/10'
                      : 'border-slate-200 shadow-sm'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-sky-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      Best Value
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.title}</h3>
                      <p className="text-xs text-slate-500">Fixed Monthly Dividend Package</p>
                    </div>

                    <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide">
                        Monthly Return
                      </span>
                      <span className="text-3xl font-extrabold text-sky-600">{returnPct}%</span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Min Investment:</span>
                        <span className="font-semibold text-slate-800">৳{minAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Max Investment:</span>
                        <span className="font-semibold text-slate-800">৳{maxAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-semibold text-slate-800">{plan.duration_months} Months</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleOpenInvest(plan)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                        isPopular
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/25'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Invest Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Investments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>My Active Investments & Returns</span>
        </h2>

        <DataTable<UserInvestment>
          data={myInvestments}
          columns={tableColumns}
          keyExtractor={(inv) => inv.id}
          loading={loading}
          emptyMessage="You don't have any active investments yet. Choose a package above to start earning!"
        />
      </div>

      {/* Invest Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Invest in {selectedPlan.title}</h3>
                <p className="text-xs text-slate-500">Monthly Return: {selectedPlan.monthly_return_percent}%</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Wallet Balance:</span>
                  <span className="font-bold text-slate-900">৳{walletBal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Allowed Range:</span>
                  <span className="font-bold text-slate-900">
                    ৳{Number(selectedPlan.min_amount).toLocaleString()} - ৳{Number(selectedPlan.max_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Enter Investment Amount (৳)</label>
                <input
                  type="number"
                  min={Number(selectedPlan.min_amount)}
                  max={Number(selectedPlan.max_amount)}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-slate-900"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-emerald-900">
                <span className="text-xs font-semibold">Estimated Monthly Dividend:</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ৳{((investAmount * Number(selectedPlan.monthly_return_percent)) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={submitting || investAmount > walletBal}
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-sky-600/25"
              >
                {submitting ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
