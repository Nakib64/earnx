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
  ArrowUpRight,
  MinusCircle,
  Clock,
} from 'lucide-react';

export default function UserInvestmentsPage() {
  const { user, refreshUserProfile } = useAuth();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [myInvestments, setMyInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
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

  // Identify primary active or pending investment
  const activeInv = myInvestments.find(
    (inv) => inv.status === RequestStatus.APPROVED || inv.status === RequestStatus.PENDING,
  );

  const handleOpenInvestOrUpgrade = (plan: InvestmentPlan) => {
    setSelectedPlan(plan);
    setMessage(null);

    const targetAmt = Number(plan.amount || plan.min_amount);
    const currentAmt = activeInv ? Number(activeInv.amount) : 0;

    if (activeInv && targetAmt > currentAmt) {
      setShowUpgradeModal(true);
    } else {
      setShowUpgradeModal(false);
    }
  };

  // Handle New Investment Subscription
  const handleInvest = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        planId: selectedPlan.id,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: 'Investment request submitted successfully! It is now pending admin approval.',
      });
      setSelectedPlan(null);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit investment' });
    }
    setSubmitting(false);
  };

  // Handle Package Upgrade Request
  const handleUpgrade = async () => {
    if (!selectedPlan || !activeInv) return;
    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        currentInvestmentId: activeInv.id,
        targetPlanId: selectedPlan.id,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: 'Upgrade request submitted successfully! Please complete the remaining payment. Admin will update your status upon verification.',
      });
      setSelectedPlan(null);
      setShowUpgradeModal(false);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit package upgrade request' });
    }
    setSubmitting(false);
  };

  // Open Capital Withdrawal Modal
  const handleOpenWithdrawCapital = (inv: UserInvestment) => {
    setSelectedPlan(null);
    setShowUpgradeModal(false);
    setWithdrawAmount(Number(inv.amount));
    setShowWithdrawModal(true);
    setMessage(null);
  };

  // Handle Capital Withdrawal Request
  const handleWithdrawCapital = async () => {
    if (!activeInv) return;
    setSubmitting(true);
    setMessage(null);

    const res = await apiFetch<UserInvestment>('/investments/withdraw-capital', {
      method: 'POST',
      body: JSON.stringify({
        investmentId: activeInv.id,
        amount: withdrawAmount,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: 'Capital withdrawal request submitted! Your invested principal will decrease once approved by Admin. Main wallet balance is untouched.',
      });
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to submit capital withdrawal request' });
    }
    setSubmitting(false);
  };

  const walletBal = user ? Number(user.wallet_balance) : 0;

  const tableColumns: ColumnDef<UserInvestment>[] = [
    {
      key: 'package_amount',
      header: 'Package & Invested',
      render: (inv) => (
        <div>
          <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[130px] sm:max-w-[180px]">
            {inv.plan?.title || 'Investment Package'}
          </div>
          <div className="text-[9px] font-mono text-[#005A36] font-bold">
            ৳{Number(inv.amount).toLocaleString()} Invested
          </div>
          {inv.request_type === 'UPGRADE' && inv.pending_plan ? (
            <span className="text-[8px] font-extrabold text-[#854D0E] bg-yellow-50 border border-yellow-300 px-1 py-0.5 rounded-none block truncate max-w-[130px] mt-0.5">
              Upgrading: {inv.pending_plan.title}
            </span>
          ) : inv.request_type === 'WITHDRAWAL' ? (
            <span className="text-[8px] font-extrabold text-[#854D0E] bg-yellow-50 border border-yellow-300 px-1 py-0.5 rounded-none block truncate max-w-[130px] mt-0.5">
              Withdraw: ৳{Number(inv.pending_amount || 0).toLocaleString()}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'financials_progress',
      header: 'Payout & Progress',
      render: (inv) => (
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1 font-mono text-[10px]">
            <span className="text-emerald-700 font-extrabold">{Number(inv.monthly_return_percent)}%/mo</span>
            <span className="text-slate-500 font-bold">(৳{Number(inv.monthly_payout_amount).toLocaleString()})</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400">
            {inv.is_lifetime || inv.plan?.is_lifetime
              ? `${inv.total_payouts_made} Payouts (Lifetime)`
              : `${inv.total_payouts_made} / ${inv.max_payouts || 12} Payouts`}
          </div>
        </div>
      ),
    },
    {
      key: 'status_next',
      header: 'Status & Next Date',
      align: 'right',
      render: (inv) => (
        <div className="text-right space-y-0.5">
          <StatusBadge status={inv.status} />
          <div className="text-slate-400 text-[9px] font-mono">
            {inv.next_payout_at
              ? new Date(inv.next_payout_at).toLocaleDateString()
              : inv.status === RequestStatus.PENDING
              ? 'Pending Approval'
              : 'Completed'}
          </div>
        </div>
      ),
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
              <span>Fixed Package Investment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Investment & Wealth Growth
            </h1>
            <p className="text-sky-100 text-sm max-w-xl">
              Subscribe to guaranteed monthly return packages. Upgrade packages anytime or withdraw invested capital safely.
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

      {/* Active Investment Banner & Capital Withdrawal Button */}
      {activeInv && (
        <div className="bg-white rounded-3xl border border-sky-200 p-6 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                  Current Investment Package
                </span>
                <StatusBadge status={activeInv.status} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {activeInv.plan?.title || 'Investment Package'} — ৳{Number(activeInv.amount).toLocaleString()}
              </h2>
              <p className="text-xs text-slate-500">
                Monthly Dividend Return: <span className="font-bold text-emerald-600">{Number(activeInv.monthly_return_percent)}%</span> (৳{Number(activeInv.monthly_payout_amount).toLocaleString()} / mo)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {activeInv.status === RequestStatus.APPROVED && (
                <button
                  onClick={() => handleOpenWithdrawCapital(activeInv)}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-amber-500/20 transition-all"
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Withdraw Capital</span>
                </button>
              )}
            </div>
          </div>

          {/* Pending Alert Banners */}
          {activeInv.status === RequestStatus.PENDING && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start space-x-3 text-purple-900">
              <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {activeInv.request_type === 'UPGRADE'
                    ? `Package Upgrade Pending Admin Approval`
                    : activeInv.request_type === 'WITHDRAWAL'
                    ? `Capital Withdrawal Pending Admin Approval`
                    : `New Investment Package Pending Admin Approval`}
                </p>
                <p className="text-purple-700">
                  {activeInv.request_type === 'UPGRADE'
                    ? `Upgrading to ${activeInv.pending_plan?.title || 'Target Package'}. Remaining amount to pay: ৳${Number(activeInv.pending_amount || 0).toLocaleString()}.`
                    : activeInv.request_type === 'WITHDRAWAL'
                    ? `Requested capital withdrawal of ৳${Number(activeInv.pending_amount || 0).toLocaleString()} from your invested principal.`
                    : `Your package subscription of ৳${Number(activeInv.amount).toLocaleString()} is awaiting verification by Admin.`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Investment Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <span>High-Yield Investment Packages</span>
          </h2>
          <span className="text-xs font-medium text-slate-500">Fixed Package Amount</span>
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
              const packageAmt = Number(plan.amount || plan.min_amount);
              const returnPct = Number(plan.monthly_return_percent);
              const monthlyDividend = (packageAmt * returnPct) / 100;
              const isPopular = returnPct >= 10;

              const activeAmt = activeInv ? Number(activeInv.amount) : 0;
              const isCurrentPackage = activeInv && activeInv.plan_id === plan.id;
              const isHigherPackage = activeInv && packageAmt > activeAmt;

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
                        Package Amount
                      </span>
                      <span className="text-2xl font-extrabold text-sky-700">৳{packageAmt.toLocaleString()}</span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Monthly Return:</span>
                        <span className="font-bold text-emerald-600">{returnPct}% / month</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Est. Dividend:</span>
                        <span className="font-bold text-slate-900">৳{monthlyDividend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Duration:</span>
                        {plan.is_lifetime ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                            Lifetime
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">{plan.duration_months} Months</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {isCurrentPackage ? (
                      <div className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 text-center">
                        Active Package
                      </div>
                    ) : isHigherPackage ? (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={activeInv?.status === RequestStatus.PENDING}
                        className="w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/25 disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Upgrade Package</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={!!activeInv}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-40 ${
                          isPopular
                            ? 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md shadow-sky-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Invest Now</span>
                      </button>
                    )}
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
          <span>My Investment History & Returns</span>
        </h2>

        <DataTable<UserInvestment>
          data={myInvestments}
          columns={tableColumns}
          keyExtractor={(inv) => inv.id}
          loading={loading}
          emptyMessage="You don't have any active investments yet. Choose a package above to start earning!"
        />
      </div>

      {/* New Investment Modal */}
      {selectedPlan && !showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Subscribe to {selectedPlan.title}</h3>
                <p className="text-xs text-slate-500">Fixed Package Subscription</p>
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
                  <span>Package Amount:</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    ৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Monthly Return Rate:</span>
                  <span className="font-bold text-emerald-600">
                    {Number(selectedPlan.monthly_return_percent)}% / month
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between text-emerald-900">
                <span className="text-xs font-semibold">Estimated Monthly Dividend:</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ৳{((Number(selectedPlan.amount || selectedPlan.min_amount) * Number(selectedPlan.monthly_return_percent)) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-600/25"
              >
                {submitting ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Upgrade Modal */}
      {selectedPlan && showUpgradeModal && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Upgrade Package</h3>
                <p className="text-xs text-slate-500">Upgrade from {activeInv.plan?.title || 'Current Package'} to {selectedPlan.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setShowUpgradeModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">Current Package ({activeInv.plan?.title}):</span>
                  <span className="font-bold text-slate-900">৳{Number(activeInv.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-purple-700 font-medium">Target Package ({selectedPlan.title}):</span>
                  <span className="font-bold text-purple-950">৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Remaining Amount Highlight Card */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                  Remaining Amount to Pay
                </span>
                <p className="text-3xl font-extrabold">
                  ৳{(Number(selectedPlan.amount || selectedPlan.min_amount) - Number(activeInv.amount)).toLocaleString()}
                </p>
                <p className="text-[11px] text-purple-100">
                  Pay this remaining amount to Admin to activate your upgraded {selectedPlan.title} package.
                </p>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: Your upgrade request will be set to Pending. Admin will verify your payment and update your active package status.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-600/25"
              >
                {submitting ? 'Submitting Request...' : 'Confirm Upgrade Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capital Withdrawal Modal */}
      {showWithdrawModal && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Withdraw Invested Capital</h3>
                <p className="text-xs text-slate-500">Reduce your active investment principal</p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Current Invested Capital:</span>
                  <span>৳{Number(activeInv.amount).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Withdrawal reduces your invested package capital. This will not touch your main wallet balance.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Enter Withdrawal Amount (৳)</label>
                <input
                  type="number"
                  min={1}
                  max={Number(activeInv.amount)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between text-slate-700 font-medium">
                <span>Remaining Capital After Withdrawal:</span>
                <span className="font-bold text-slate-900">
                  ৳{Math.max(0, Number(activeInv.amount) - withdrawAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawCapital}
                disabled={submitting || withdrawAmount <= 0 || withdrawAmount > Number(activeInv.amount)}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-600/25"
              >
                {submitting ? 'Submitting...' : 'Confirm Withdrawal Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
