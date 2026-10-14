'use client';

import React from 'react';
import { ArrowRight, ShoppingCart, Wallet } from 'lucide-react';
import { usePurchaseOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import { GlassCard } from '../../../components/design-system/GlassCard';
import { GlassButton } from '../../../components/design-system/GlassButton';
import { NumericAmount } from '../../../components/design-system/NumericAmount';
import {
  PurchaseTargetSection,
  PurchasePackageSection,
  PurchaseReferrerSection,
  PurchaseModal,
  PurchaseSkeleton,
} from '../../../components/purchase';

export default function PurchasePage() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const {
    state: {
      packageType,
      memberPackages,
      selectedPackageId,
      loadingPackages,
      selectedPlanId,
      activePlans,
      loadingPlans,
      targetQuery,
      targetResults,
      searchingTarget,
      selectedTargetUser,
      showTargetDropdown,
      referrerQuery,
      referrerResults,
      searchingReferrer,
      selectedReferrerUser,
      showReferrerDropdown,
      submitting,
      modalState,
      premiumFee,
    },
    computed: {
      currentPrice,
      payerBalance,
      selectedMemberPackage,
      selectedInvestmentPlan,
    },
    actions: {
      setPackageType,
      setSelectedPackageId,
      setSelectedPlanId,
      setTargetQuery,
      setSelectedTargetUser,
      setShowTargetDropdown,
      setReferrerQuery,
      setSelectedReferrerUser,
      setShowReferrerDropdown,
      setModalState,
      handleSelectTargetUser,
      handleSelectSelfAsTarget,
      handleSelectReferrerUser,
      handleSelectSelfAsReferrer,
      handleSelectTargetSponsorAsReferrer,
      handleInitiatePurchase,
      handleExecutePurchase,
    },
  } = usePurchaseOrchestrator();

  if (forceSkeletonLoading) {
    return <PurchaseSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Top Banner Header */}
      <GlassCard
        className="p-5 sm:p-6 relative overflow-hidden specular-rim flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        glow
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <ShoppingCart className="w-3.5 h-3.5" />
            Checkout Portal
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 ">Package &amp; Plan Purchase</h1>
          <p className="text-xs text-slate-500 font-medium max-w-lg">
            Acquire VIP Premium Subscriptions or High-Yield Investment Plans directly using your account balance.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-white/95 px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-2.5 self-start sm:self-center">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Balance</span>
            <NumericAmount amount={payerBalance} variant="gain" size="sm" />
          </div>
        </div>
      </GlassCard>

      {/* Main Generic Form */}
      <GlassCard className="p-6 sm:p-8 specular-rim">
        <form onSubmit={handleInitiatePurchase} className="space-y-6">
          {/* 1. Target User Section */}
          <PurchaseTargetSection
            targetQuery={targetQuery}
            setTargetQuery={setTargetQuery}
            targetResults={targetResults}
            searchingTarget={searchingTarget}
            selectedTargetUser={selectedTargetUser}
            setSelectedTargetUser={setSelectedTargetUser}
            showTargetDropdown={showTargetDropdown}
            setShowTargetDropdown={setShowTargetDropdown}
            onSelectTargetUser={handleSelectTargetUser}
            onSelectSelfAsTarget={handleSelectSelfAsTarget}
          />

          {/* 2. Package & Investment Plans Section */}
          <PurchasePackageSection
            packageType={packageType}
            setPackageType={setPackageType}
            memberPackages={memberPackages}
            selectedPackageId={selectedPackageId}
            setSelectedPackageId={setSelectedPackageId}
            loadingPackages={loadingPackages}
            selectedMemberPackage={selectedMemberPackage}
            premiumFee={premiumFee}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            activePlans={activePlans}
            loadingPlans={loadingPlans}
          />

          {/* 3. Referrer Section (only for PREMIUM) */}
          <PurchaseReferrerSection
            packageType={packageType}
            selectedTargetUser={selectedTargetUser}
            referrerQuery={referrerQuery}
            setReferrerQuery={setReferrerQuery}
            referrerResults={referrerResults}
            searchingReferrer={searchingReferrer}
            selectedReferrerUser={selectedReferrerUser}
            setSelectedReferrerUser={setSelectedReferrerUser}
            showReferrerDropdown={showReferrerDropdown}
            setShowReferrerDropdown={setShowReferrerDropdown}
            onSelectReferrerUser={handleSelectReferrerUser}
            onSelectSelfAsReferrer={handleSelectSelfAsReferrer}
            onSelectTargetSponsorAsReferrer={handleSelectTargetSponsorAsReferrer}
          />

          {/* Total Cost & Submit */}
          <div className="pt-5 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 self-start sm:self-center">
              <span className="text-slate-500 block text-xs font-semibold">Total Package Fee:</span>
              <NumericAmount amount={currentPrice} variant="neutral" size="xl" />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto gap-2 px-8 shadow-lg shadow-emerald-950/15"
            >
              <span>Buy Package Now</span>
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {/* Confirmation & Status Modal */}
      <PurchaseModal
        modalState={modalState}
        submitting={submitting}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecutePurchase}
      />
    </div>
  );
}
