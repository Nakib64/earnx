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
      const amt = Number(selectedPlan.amount || selectedPlan.min_amount);
      setMessage({
        type: 'success',
        text: `Investment activated! ৳${amt.toLocaleString()} has been deducted from your account balance.`,
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

    const targetAmt = Number(selectedPlan.amount || selectedPlan.min_amount);
    const remainingToPay = targetAmt - Number(activeInv.amount);

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
        text: `Package upgraded to ${selectedPlan.title}! ৳${remainingToPay.toLocaleString()} has been deducted from your account balance.`,
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

  // Handle Capital Withdrawal (Direct & Instant 100% Wallet Refund)
  const handleWithdrawCapital = async () => {
    if (!activeInv) return;
    setSubmitting(true);
    setMessage(null);

    const totalAmt = Number(activeInv.amount);
    const planTitle = activeInv.plan?.title || 'Investment Package';

    const res = await apiFetch<UserInvestment>('/investments/withdraw-capital', {
      method: 'POST',
      body: JSON.stringify({
        investmentId: activeInv.id,
        amount: totalAmt,
      }),
    });

    if (res.success) {
      setMessage({
        type: 'success',
        text: `Capital withdrawal complete! ৳${totalAmt.toLocaleString()} has been refunded directly to your account balance, and the ${planTitle} package has been closed.`,
      });
      setShowWithdrawModal(false);
      await refreshUserProfile();
      await fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to withdraw capital' });
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
    
      {/* Active Investment Status Banner Card (if user has active investment) */}
      {activeInv && (
        <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="bg-white/10 border border-[#d4af37]/40 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-amber-200 shrink-0">
                  Active Package
                </span>
                <StatusBadge status={activeInv.status} />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white truncate">
                {activeInv.plan?.title || 'Investment Package'} — ৳{Number(activeInv.amount).toLocaleString()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
                Monthly Return: <strong className="text-[#f3ba2f] font-mono">{Number(activeInv.monthly_return_percent)}%</strong> (৳{Number(activeInv.monthly_payout_amount).toLocaleString()} / mo)
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {activeInv.status === RequestStatus.APPROVED && (
                <button
                  onClick={() => handleOpenWithdrawCapital(activeInv)}
                  className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <MinusCircle className="w-4 h-4 shrink-0 text-slate-950" />
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
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
            <TrendingUp className="w-5 h-5 text-[#01281a] shrink-0" />
            <span className="truncate">Available Investment Packages</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-[#d4af37]/35 bg-gradient-to-br from-[#023322] via-[#012418] to-[#011a12] p-5 sm:p-6 space-y-5 animate-pulse shadow-xl"
              >
                <div className="space-y-2">
                  <div className="h-6 w-1/2 bg-[#03442e] rounded-lg"></div>
                  <div className="h-3.5 w-3/4 bg-[#03442e]/60 rounded-md"></div>
                </div>
                <div className="h-20 bg-[#011f15] border border-[#d4af37]/25 rounded-2xl p-4 flex justify-between items-center">
                  <div className="space-y-2 w-1/2">
                    <div className="h-3 w-1/3 bg-[#03442e] rounded"></div>
                    <div className="h-7 w-2/3 bg-[#03442e] rounded-lg"></div>
                  </div>
                  <div className="w-10 h-10 bg-[#03442e] border border-[#d4af37]/30 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-14 bg-[#011a12] border border-[#d4af37]/20 rounded-2xl"></div>
                  <div className="h-14 bg-[#011a12] border border-[#d4af37]/20 rounded-2xl"></div>
                </div>
                <div className="h-12 bg-gradient-to-r from-amber-400/20 to-amber-500/20 rounded-2xl border border-amber-400/30"></div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-3xl p-8 text-center text-slate-300 font-bold shadow-lg">
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
                  className="group relative rounded-3xl border border-[#d4af37]/45 bg-gradient-to-br from-[#023322] via-[#012418] to-[#011a12] text-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d4af37] flex flex-col justify-between overflow-hidden p-5 sm:p-6 space-y-5 min-w-0 shadow-xl"
                >
                  {/* Badge */}
                  {isPopular ? (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl shadow-md flex items-center space-x-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>Best Value</span>
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 bg-[#013825] border-l border-b border-[#d4af37]/40 text-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl shrink-0">
                      <span>Guaranteed Yield</span>
                    </div>
                  )}

                  <div className="space-y-4 min-w-0">
                    {/* Title & Subtitle */}
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                        {plan.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 truncate">
                        Guaranteed Monthly Dividend Package
                      </p>
                    </div>

                    {/* Price Tag Box */}
                    <div className="rounded-2xl p-4 flex items-center justify-between min-w-0 border bg-[#011f15] border-[#d4af37]/35 text-white shadow-inner">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest block truncate text-amber-200">
                          Package Price
                        </span>
                        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight truncate block text-white">
                          ৳{packageAmt.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-11 h-11 rounded-xl border border-[#d4af37]/50 bg-[#023322] flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-md">
                        <TrendingUp className="w-5.5 h-5.5" />
                      </div>
                    </div>

                    {/* Return Rate & Dividend Metrics */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="border border-[#d4af37]/30 p-3 rounded-2xl bg-[#011a12] min-w-0 space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider block truncate text-amber-300">
                          Monthly Return
                        </span>
                        <div className="text-base sm:text-lg font-black font-mono truncate text-amber-200">
                          {returnPct}% / mo
                        </div>
                      </div>

                      <div className="border border-[#d4af37]/30 p-3 rounded-2xl bg-[#011a12] min-w-0 space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider block truncate text-amber-300">
                          Est. Dividend
                        </span>
                        <div className="text-base sm:text-lg font-black font-mono truncate text-white">
                          ৳{monthlyDividend.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Plan Duration Badge */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#d4af37]/30 bg-[#011f15] text-xs font-bold min-w-0">
                      <span className="text-slate-300 font-medium shrink-0">Plan Duration:</span>
                      {plan.is_lifetime ? (
                        <span className="font-black text-amber-200 bg-[#023322] border border-[#d4af37]/40 px-2.5 py-0.5 rounded-lg text-[11px] shrink-0">
                          Lifetime Payouts
                        </span>
                      ) : (
                        <span className="font-black font-mono truncate text-white">
                          {plan.duration_months} Months
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCurrentPackage ? (
                      <div className="w-full py-3.5 px-4 rounded-2xl font-black text-xs bg-[#023322] text-amber-200 border border-[#d4af37]/50 text-center tracking-wide shadow-md">
                        ✓ Active Package
                      </div>
                    ) : isHigherPackage ? (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={activeInv?.status === RequestStatus.PENDING}
                        className="w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        <ArrowUpRight className="w-4 h-4 text-slate-950 shrink-0" />
                        <span className="truncate">Upgrade Package</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenInvestOrUpgrade(plan)}
                        disabled={!!activeInv}
                        className="w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 disabled:opacity-40 cursor-pointer shadow-md"
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-4 overflow-hidden">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
          <ShieldCheck className="w-5 h-5 text-[#01281a] shrink-0" />
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
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">Subscribe to {selectedPlan.title}</h3>
                <p className="text-xs text-slate-500 font-semibold truncate">Fixed Package Subscription</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold shrink-0 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 truncate">
                  <span className="shrink-0 font-bold">Package Amount:</span>
                  <span className="font-black text-slate-900 text-base font-mono truncate">
                    ৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 truncate">
                  <span className="shrink-0 font-bold">Your Account Balance:</span>
                  <span className="font-black text-primary font-mono truncate">
                    ৳{walletBal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 truncate pt-1 border-t border-slate-200">
                  <span className="shrink-0 font-bold">Monthly Return Rate:</span>
                  <span className="font-black text-[#01281a] font-mono truncate">
                    {Number(selectedPlan.monthly_return_percent)}% / month
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 p-4 rounded-xl flex items-center justify-between text-white min-w-0 shadow-md">
                <span className="text-xs font-bold text-slate-300 shrink-0">Estimated Monthly Dividend:</span>
                <span className="text-lg font-black text-amber-200 font-mono truncate">
                  ৳{((Number(selectedPlan.amount || selectedPlan.min_amount) * Number(selectedPlan.monthly_return_percent)) / 100).toLocaleString()}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-semibold italic">
                * ৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()} will be deducted directly from your account balance to activate this investment.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-black text-xs text-slate-700 hover:bg-slate-100 truncate cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={submitting || walletBal < Number(selectedPlan.amount || selectedPlan.min_amount)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 truncate cursor-pointer"
              >
                {submitting ? 'Processing...' : walletBal < Number(selectedPlan.amount || selectedPlan.min_amount) ? 'Insufficient Account Balance' : 'Confirm & Deduct Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Upgrade Modal */}
      {selectedPlan && showUpgradeModal && activeInv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">Upgrade Package</h3>
                <p className="text-xs text-slate-500 font-semibold truncate">Upgrade from {activeInv.plan?.title || 'Current Package'} to {selectedPlan.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setShowUpgradeModal(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold shrink-0 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 truncate">
                  <span className="text-slate-600 font-bold truncate">Current ({activeInv.plan?.title}):</span>
                  <span className="font-black text-slate-900 font-mono truncate">৳{Number(activeInv.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 truncate">
                  <span className="text-[#854D0E] font-bold truncate">Target ({selectedPlan.title}):</span>
                  <span className="font-black text-[#854D0E] font-mono truncate">৳{Number(selectedPlan.amount || selectedPlan.min_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Remaining Amount Highlight Card */}
              <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 text-white p-4 rounded-xl space-y-1 shadow-md">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                  Upgrade Cost (Deducted from Wallet)
                </span>
                <p className="text-3xl font-black font-mono truncate text-white">
                  ৳{(Number(selectedPlan.amount || selectedPlan.min_amount) - Number(activeInv.amount)).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-300 font-medium">
                  This remaining upgrade cost will be deducted directly from your account balance (Current Balance: ৳{walletBal.toLocaleString()}).
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-black text-xs text-slate-700 hover:bg-slate-100 truncate cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 truncate cursor-pointer"
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
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">Withdraw Total Invested Capital</h3>
                <p className="text-xs text-slate-500 font-semibold truncate">Refund 100% of your invested capital to your wallet</p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold shrink-0 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Total Capital Refund Highlight Card */}
              <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 text-white p-5 rounded-2xl space-y-2 shadow-md">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                  Total Active Invested Capital
                </span>
                <p className="text-3xl font-black font-mono truncate text-white">
                  ৳{Number(activeInv.amount).toLocaleString()}
                </p>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  100% of this invested capital (৳{Number(activeInv.amount).toLocaleString()}) will be refunded directly to your account balance instantly upon confirmation, and your investment package will be deleted.
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-[#854D0E] text-xs font-semibold space-y-1">
                <p className="font-extrabold text-[#854D0E]">
                  ⚡ Direct & Instant Refund:
                </p>
                <p className="text-[11px] leading-snug">
                  Capital withdrawal refunds 100% of your active invested principal to your account balance immediately. Your active package will be deleted.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-black text-xs text-slate-700 hover:bg-slate-100 truncate cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawCapital}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md disabled:opacity-50 truncate cursor-pointer"
              >
                {submitting ? 'Processing Refund...' : 'Confirm & Refund 100% Capital'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
