'use client';

import React from 'react';
import Link from 'next/link';
import { UserInvestment, RequestStatus } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  Wallet,
  Crown,
} from 'lucide-react';
import { useInvestmentOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import {
  InvestmentActiveBanner,
  InvestmentPlansGrid,
  InvestmentSubscribeModal,
  InvestmentUpgradeModal,
  InvestmentWithdrawModal,
} from '../../../components/investments';
import { ShimmerSkeleton, SkeletonLine } from '../../../components/design-system';

export function InvestmentPageSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Header Skeleton sitting directly on background */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-2 max-w-2xl w-full">
          <SkeletonLine className="w-28 h-3.5" rounded="rounded" />
          <SkeletonLine className="w-72 sm:w-96 h-8 sm:h-9" rounded="rounded-xl" />
          <SkeletonLine className="w-full sm:w-[480px] h-4" rounded="rounded" />
          <div className="pt-1 flex items-center gap-2">
            <ShimmerSkeleton className="w-2.5 h-2.5" rounded="rounded-full" />
            <SkeletonLine className="w-48 h-3.5" rounded="rounded" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <ShimmerSkeleton className="w-28 h-9" rounded="rounded-xl" />
          <ShimmerSkeleton className="w-28 h-9" rounded="rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Boxes Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex justify-between items-center">
              <SkeletonLine className="w-24 h-3.5" rounded="rounded" />
              <ShimmerSkeleton className="w-4 h-4" rounded="rounded" />
            </div>
            <SkeletonLine className="w-24 sm:w-28 h-7 sm:h-8" rounded="rounded-md" />
          </div>
        ))}
      </div>

      {/* Plans Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4"
          >
            <SkeletonLine className="w-1/2 h-6" rounded="rounded-md" />
            <ShimmerSkeleton className="w-full h-16" rounded="rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <ShimmerSkeleton className="w-full h-12" rounded="rounded-xl" />
              <ShimmerSkeleton className="w-full h-12" rounded="rounded-xl" />
            </div>
            <ShimmerSkeleton className="w-full h-11" rounded="rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserInvestmentsPage() {
  const { isLoading: isSkeletonReviewMode } = useDesignSystem();
  const {
    state: {
      plans,
      myInvestments,
      loading,
      submitting,
      selectedPlan,
      showUpgradeModal,
      showWithdrawModal,
      message,
      customInvestAmount,
      selectedDuration,
    },
    computed: {
      user,
      activeInv,
    },
    actions: {
      setSelectedPlan,
      setShowUpgradeModal,
      setShowWithdrawModal,
      setMessage,
      setCustomInvestAmount,
      setSelectedDuration,
      handleOpenInvestOrUpgrade,
      handleOpenWithdrawCapital,
      handleInvest,
      handleUpgrade,
      handleWithdraw: handleWithdrawCapital,
    },
  } = useInvestmentOrchestrator();

  const walletBal = user ? Number(user.wallet_balance) : 0;
  const activePrincipal = activeInv ? Number(activeInv.amount || 0) : 0;
  const monthlyReturnPct = activeInv ? Number(activeInv.monthly_return_percent || 0) : 0;
  const payoutsCount = activeInv ? activeInv.total_payouts_made : 0;

  if (isSkeletonReviewMode || (loading && plans.length === 0)) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
        <InvestmentPageSkeleton />
      </div>
    );
  }

  const tableColumns: ColumnDef<UserInvestment>[] = [
    {
      key: 'package_amount',
      header: 'Package & Invested',
      render: (inv) => (
        <div className="min-w-0">
          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[180px]">
            {inv.plan?.title || 'Investment Package'}
          </div>
          <div className="text-xs text-emerald-700 font-semibold truncate tabular-nums">
            ৳{Number(inv.amount).toLocaleString()} Invested
          </div>
          {inv.request_type === 'UPGRADE' && inv.pending_plan ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md block truncate max-w-[130px] mt-0.5">
              Upgrading: {inv.pending_plan.title}
            </span>
          ) : inv.request_type === 'WITHDRAWAL' ? (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md block truncate max-w-[130px] mt-0.5">
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
          <div className="flex items-center space-x-1 text-xs truncate">
            <span className="text-emerald-700 font-bold tabular-nums">+{Number(inv.monthly_return_percent)}%/mo</span>
            <span className="text-slate-500 font-medium truncate tabular-nums">
              (৳{Number(inv.monthly_payout_amount).toLocaleString()})
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
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
          {inv.next_payout_at && (
            <div className="text-[10px] text-slate-400 tabular-nums">
              Next: {new Date(inv.next_payout_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto text-slate-900 pb-16 animate-fade-in select-none font-[family-name:var(--font-montserrat)]">
      {/* 1. Compact, Clearly Structured Page Header (sitting directly on background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Investments &amp; Dividends
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900  leading-tight">
            Fixed-Term Investments &amp; Yields
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
            Lock capital into verified fractional investment plans, earn scheduled monthly dividends, and track payouts.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${activeInv ? 'bg-[#009F6B]' : 'bg-slate-400'}`} />
              Status:{' '}
              <strong className="text-slate-900 font-semibold">
                {activeInv ? 'Active Investment Plan' : 'No Active Plan'}
              </strong>
            </span>
          </div>
        </div>

        {/* Secondary Actions with Liquid Glassmorphism */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Wallet className="w-3.5 h-3.5 text-[#009F6B]" />
            <span>Cash Wallet</span>
          </Link>

          <Link
            href="/dashboard/premium"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Membership</span>
          </Link>
        </div>
      </div>

      {/* Global alert feedback */}
      {message && (
        <AlertBanner
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* 2. KPI Summary Cards (Max 2 Content Rule: Top Label + Icon, Bottom Value) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Active Invested Capital */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Capital</span>
            <TrendingUp className="w-4 h-4 text-[#009F6B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            ৳{activePrincipal.toLocaleString()}
          </span>
        </div>

        {/* Box 2: Monthly Yield */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Yield</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
            {monthlyReturnPct > 0 ? `+${monthlyReturnPct}%/mo` : '0%/mo'}
          </span>
        </div>

        {/* Box 3: Total Payouts Disbursed */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Payouts Made</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {payoutsCount} {payoutsCount === 1 ? 'Month' : 'Months'}
          </span>
        </div>

        {/* Box 4: Available Wallet Balance */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Wallet Liquidity</span>
            <Wallet className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            ৳{walletBal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Active Investment Status Banner Card (if active investment exists) */}
      {activeInv && (
        <InvestmentActiveBanner
          activeInv={activeInv}
          onOpenWithdrawCapital={handleOpenWithdrawCapital}
        />
      )}

      {/* 4. Investment Plans Grid (Liquid Glassmorphism) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 ">
            Available Investment Plans
          </h2>
          <span className="text-xs font-semibold text-slate-400">Guaranteed Dividends</span>
        </div>

        <InvestmentPlansGrid
          plans={plans}
          activeInv={activeInv}
          loading={loading && plans.length === 0}
          onSelectPlan={handleOpenInvestOrUpgrade}
        />
      </div>

      {/* 5. Active Investments History Table (Liquid Glass Container) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 overflow-hidden">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2  truncate">
          <ShieldCheck className="w-5 h-5 text-[#009F6B] shrink-0" />
          <span className="truncate">Investment History &amp; Dividends</span>
        </h2>

        <DataTable<UserInvestment>
          data={myInvestments}
          columns={tableColumns}
          keyExtractor={(inv) => inv.id}
          loading={loading && myInvestments.length === 0}
          emptyMessage="You don't have any active investments yet. Choose a package above to start earning!"
        />
      </div>

      {/* New Investment Modal */}
      {selectedPlan && !showUpgradeModal && (
        <InvestmentSubscribeModal
          selectedPlan={selectedPlan}
          customInvestAmount={customInvestAmount}
          setCustomInvestAmount={setCustomInvestAmount}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          walletBal={walletBal}
          submitting={submitting}
          onClose={() => setSelectedPlan(null)}
          onConfirm={handleInvest}
        />
      )}

      {/* Package Upgrade Modal */}
      {selectedPlan && showUpgradeModal && activeInv && (
        <InvestmentUpgradeModal
          selectedPlan={selectedPlan}
          activeInv={activeInv}
          walletBal={walletBal}
          submitting={submitting}
          onClose={() => {
            setSelectedPlan(null);
            setShowUpgradeModal(false);
          }}
          onConfirm={handleUpgrade}
        />
      )}

      {/* Capital Withdrawal Modal */}
      {showWithdrawModal && activeInv && (
        <InvestmentWithdrawModal
          activeInv={activeInv}
          submitting={submitting}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={() => handleWithdrawCapital()}
        />
      )}
    </div>
  );
}
