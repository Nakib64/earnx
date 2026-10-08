'use client';

import React from 'react';
import { UserInvestment, RequestStatus } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { ShieldCheck } from 'lucide-react';
import { useInvestmentOrchestrator } from '../../../hooks/orchestrators';
import {
  InvestmentActiveBanner,
  InvestmentPlansGrid,
  InvestmentSubscribeModal,
  InvestmentUpgradeModal,
  InvestmentWithdrawModal,
} from '../../../components/investments';

export default function UserInvestmentsPage() {
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
            <span className="text-slate-500 font-bold truncate">
              (৳{Number(inv.monthly_payout_amount).toLocaleString()})
            </span>
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
      {message && (
        <AlertBanner
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Active Investment Status Banner Card (if user has active investment) */}
      {activeInv && (
        <InvestmentActiveBanner
          activeInv={activeInv}
          onOpenWithdrawCapital={handleOpenWithdrawCapital}
        />
      )}

      {/* Investment Plans Grid */}
      <InvestmentPlansGrid
        plans={plans}
        activeInv={activeInv}
        loading={loading}
        onSelectPlan={handleOpenInvestOrUpgrade}
      />

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
