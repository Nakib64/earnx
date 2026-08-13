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
  Wallet,
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
        <div className="min-w-0">
          <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[130px] sm:max-w-[180px]">
            {inv.plan?.title || 'Investment Package'}
          </div>
          <div className="text-[9px] font-mono text-primary font-bold truncate">
            ৳{Number(inv.amount).toLocaleString()} Invested
          </div>
          {inv.request_type === 'UPGRADE' && inv.pending_plan ? (
            <span className="text-[8px] font-extrabold text-[#854D0E] bg-amber-50 border border-amber-200 px-1 py-0.5 rounded-md block truncate max-w-[130px] mt-0.5">
              Upgrading: {inv.pending_plan.title}
            </span>
          ) : inv.request_type === 'WITHDRAWAL' ? (
            <span className="text-[8px] font-extrabold text-[#854D0E] bg-amber-50 border border-amber-200 px-1 py-0.5 rounded-md block truncate max-w-[130px] mt-0.5">
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
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center space-x-1 font-mono text-[10px] truncate">
            <span className="text-primary font-extrabold">{Number(inv.monthly_return_percent)}%/mo</span>
            <span className="text-slate-500 font-bold truncate">(৳{Number(inv.monthly_payout_amount).toLocaleString()})</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 truncate">
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
        <div className="text-right space-y-0.5 min-w-0">
          <StatusBadge status={inv.status} />
          <div className="text-slate-400 text-[9px] font-mono truncate">
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
        {/* Card 1: Available Wallet Balance */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Available Wallet
          </span>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight truncate">
                ৳{walletBal.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-primary truncate">Main Wallet</div>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-slate-500 truncate">
            <span className="truncate">invest & upgrade</span>
          </div>
        </div>

        {/* Card 2: Active Invested Capital */}
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-sm min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Active Investment
          </span>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shrink-0">
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-3xl font-black text-[#854D0E] font-mono tracking-tight truncate">
                ৳{activeInv ? Number(activeInv.amount).toLocaleString() : 0}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#854D0E] truncate">
                {activeInv ? activeInv.plan?.title || 'Invested Package' : 'No Package'}
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-[#854D0E] truncate">
            <span className="truncate">Monthly Return: {activeInv ? `${activeInv.monthly_return_percent}%` : '0%'}</span>
          </div>
        </div>
      </div>

      {/* Active Investment Status Banner Card (if user has active investment) */}
      {activeInv && (
        <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white shrink-0">
                  Active Package
                </span>
                <StatusBadge status={activeInv.status} />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white truncate">
                {activeInv.plan?.title || 'Investment Package'} — ৳{Number(activeInv.amount).toLocaleString()}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium truncate">
                Monthly Return: <strong className="text-secondary font-mono">{Number(activeInv.monthly_return_percent)}%</strong> (৳{Number(activeInv.monthly_payout_amount).toLocaleString()} / mo)
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {activeInv.status === RequestStatus.APPROVED && (
                <button
                  onClick={() => handleOpenWithdrawCapital(activeInv)}
                  className="py-2.5 px-4 bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <MinusCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">Withdraw Capital</span>
                </button>
              )}
            </div>
          </div>

          {/* Pending Alert Banners */}
          {activeInv.status === RequestStatus.PENDING && (
            <div className="bg-emerald-950/60 border border-emerald-600/40 rounded-xl p-4 flex items-start space-x-3 text-emerald-100 min-w-0">
              <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 min-w-0">
                <p className="font-extrabold text-secondary truncate">
                  {activeInv.request_type === 'UPGRADE'
                    ? `Package Upgrade Pending Admin Approval`
                    : activeInv.request_type === 'WITHDRAWAL'
                      ? `Capital Withdrawal Pending Admin Approval`
                      : `New Investment Package Pending Admin Approval`}
                </p>
                <p className="text-emerald-100/90 leading-relaxed">
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
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2 truncate">
            <span className="truncate">Investment Plans</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/90 text-slate-500 shadow-sm">
            No investment plans available at the moment. Please check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  className={`group relative bg-white/95 backdrop-blur-xl rounded-3xl border transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden p-5 sm:p-6 space-y-5 min-w-0 ${
                    isPopular
                      ? 'border-primary/80 shadow-[0_12px_30px_rgba(0,90,54,0.1)] hover:shadow-[0_20px_45px_rgba(0,90,54,0.18)]'
                      : 'border-slate-200/90 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_35px_rgba(0,0,0,0.08)]'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-[#005A36] text-secondary text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl shadow-sm flex items-center space-x-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-secondary" />
                      <span>Best Value</span>
                    </div>
                  )}

                  <div className="space-y-4 min-w-0">
                    {/* Title & Category */}
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        Guaranteed Monthly Return Plan
                      </p>
                    </div>

                    {/* Price Card Tag */}
                    <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between min-w-0 shadow-xs">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest block truncate">
                          Package Price
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-tight truncate block">
                          ৳{packageAmt.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="bg-slate-50/90 border border-slate-100 p-3 rounded-2xl min-w-0 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                          Monthly Return
                        </span>
                        <div className="text-base sm:text-lg font-black text-primary font-mono truncate">
                          {returnPct}% / mo
                        </div>
                      </div>

                      <div className="bg-slate-50/90 border border-slate-100 p-3 rounded-2xl min-w-0 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                          Est. Dividend
                        </span>
                        <div className="text-base sm:text-lg font-black text-slate-900 font-mono truncate">
                          ৳{monthlyDividend.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Duration Info Row */}
                    <div className="flex items-center justify-between bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 min-w-0">
                      <span className="text-slate-400 font-medium shrink-0">Plan Duration:</span>
                      {plan.is_lifetime ? (
                        <span className="font-extrabold text-primary bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px] shrink-0">
                          Lifetime Payouts
                        </span>
                      ) : (
                        <span className="font-extrabold text-slate-900 font-mono truncate">
                          {plan.duration_months} Months
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCurrentPackage ? (
                      <div className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-emerald-100/90 text-primary border border-emerald-200 text-center tracking-wide shadow-xs">
                        ✓ Active Package
                      </div>
                    ) : isHigherPackage ? (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={activeInv?.status === RequestStatus.PENDING}
                        className="w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer group-hover:scale-[1.01]"
                      >
                        <ArrowUpRight className="w-4 h-4 text-slate-950 shrink-0" />
                        <span className="truncate">Upgrade Package</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={!!activeInv}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer group-hover:scale-[1.01] ${
                          isPopular
                            ? 'bg-[#005A36] hover:bg-[#044D2F] text-white shadow-md shadow-emerald-950/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current shrink-0" />
                        <span className="truncate">Invest Now</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Investments History Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 overflow-hidden">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2 truncate">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <span className="truncate">My Investment History & Returns</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 truncate">Subscribe to {selectedPlan.title}</h3>
                <p className="text-xs text-slate-500 truncate">Fixed Package Subscription</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 truncate">
                  <span className="shrink-0">Package Amount:</span>
                  <span className="font-black text-slate-900 text-base font-mono truncate">
                    ৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 truncate">
                  <span className="shrink-0">Monthly Return Rate:</span>
                  <span className="font-extrabold text-primary font-mono truncate">
                    {Number(selectedPlan.monthly_return_percent)}% / month
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 min-w-0">
                <span className="text-xs font-semibold shrink-0">Estimated Monthly Dividend:</span>
                <span className="text-lg font-black text-primary font-mono truncate">
                  ৳{((Number(selectedPlan.amount || selectedPlan.min_amount) * Number(selectedPlan.monthly_return_percent)) / 100).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 hover:bg-slate-100 truncate"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white disabled:opacity-50 font-extrabold text-xs shadow-sm truncate"
              >
                {submitting ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Upgrade Modal */}
      {selectedPlan && showUpgradeModal && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 truncate">Upgrade Package</h3>
                <p className="text-xs text-slate-500 truncate">Upgrade from {activeInv.plan?.title || 'Current Package'} to {selectedPlan.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setShowUpgradeModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 truncate">
                  <span className="text-slate-600 font-medium truncate">Current ({activeInv.plan?.title}):</span>
                  <span className="font-extrabold text-slate-900 font-mono truncate">৳{Number(activeInv.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 truncate">
                  <span className="text-[#854D0E] font-medium truncate">Target ({selectedPlan.title}):</span>
                  <span className="font-extrabold text-[#854D0E] font-mono truncate">৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Remaining Amount Highlight Card */}
              <div className="bg-[#005A36] text-white p-4 rounded-xl space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-secondary">
                  Remaining Amount to Pay
                </span>
                <p className="text-3xl font-black font-mono truncate">
                  ৳{(Number(selectedPlan.amount || selectedPlan.min_amount) - Number(activeInv.amount)).toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-100">
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
                className="flex-1 py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 hover:bg-slate-100 truncate"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#854D0E] font-extrabold text-xs disabled:opacity-50 truncate"
              >
                {submitting ? 'Submitting Request...' : 'Confirm Upgrade Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capital Withdrawal Modal */}
      {showWithdrawModal && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 truncate">Withdraw Invested Capital</h3>
                <p className="text-xs text-slate-500 truncate">Reduce your active investment principal</p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-[#854D0E] text-xs space-y-1">
                <div className="flex justify-between font-extrabold truncate">
                  <span>Current Invested Capital:</span>
                  <span className="font-mono">৳{Number(activeInv.amount).toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-[#854D0E]">
                  Withdrawal reduces your invested package capital. This will not touch your main wallet balance.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700">Enter Withdrawal Amount (৳)</label>
                <input
                  type="number"
                  min={1}
                  max={Number(activeInv.amount)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary font-extrabold text-slate-900 text-sm font-mono"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between text-slate-700 font-medium truncate">
                <span className="shrink-0">Remaining Capital:</span>
                <span className="font-extrabold text-slate-900 font-mono truncate">
                  ৳{Math.max(0, Number(activeInv.amount) - withdrawAmount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-extrabold text-xs text-slate-700 hover:bg-slate-100 truncate"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawCapital}
                disabled={submitting || withdrawAmount <= 0 || withdrawAmount > Number(activeInv.amount)}
                className="flex-1 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[#854D0E] font-extrabold text-xs disabled:opacity-50 truncate"
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
