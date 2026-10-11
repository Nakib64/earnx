'use client';

import React, { useState } from 'react';
import { RefreshCw, HelpCircle, X, Check } from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { usePremiumOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import {
  PremiumDailyTaskCard,
  PremiumPackagesGrid,
  PremiumAdModal,
  PremiumSubscribeModal,
  PremiumSkeleton,
} from '../../../components/premium';

export default function PremiumDashboardPage() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const {
    state: {
      packages,
      dailyTask,
      loading,
      subscribingId,
      alertMsg,
      adModalOpen,
      adCountdown,
      adCompleted,
      recordingAd,
      claiming,
      selectedPkgForModal,
      subscribeError,
    },
    computed: { user },
    actions: {
      setAlertMsg,
      handleStartWatchAd,
      handleFinishAd,
      handleCompleteVideoAd,
      handleCancelVideoAd,
      handleClaimReward,
      handleOpenSubscribeModal,
      handleCloseSubscribeModal,
      handleConfirmSubscribe,
      fetchPackagesAndTask,
    },
  } = usePremiumOrchestrator();

  if (forceSkeletonLoading || (loading && packages.length === 0)) {
    return (
      <div className="relative z-10 min-h-full text-[#111827] pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          <PremiumSkeleton />
        </div>
      </div>
    );
  }

  const isUserPremium = !!(user?.is_premium || dailyTask?.is_premium);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Compact, Clearly Structured Page Header (sitting directly on background) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Small eyebrow label with subtle letter spacing, no decorative pill background */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Premium Memberships
            </div>

            {/* Prominent main heading (~30-32px on desktop) */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900  leading-tight">
              Premium Memberships &amp; Daily Ad Rewards
            </h1>

            {/* Supporting description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Explore membership packages, compare daily ad allowances, and understand the rewards available under each plan.
            </p>

            {/* Account status indicator */}
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span
                  className={`w-2 h-2 rounded-full ${isUserPremium ? 'bg-[#009F6B]' : 'bg-slate-400'
                    }`}
                />
                Status:{' '}
                <strong className="text-slate-900 font-semibold">
                  {isUserPremium ? 'VIP Member' : 'Standard Account'}
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions: Refresh and View Reward Rules */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-white border border-[#E5EBE7] text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Reward Rules</span>
            </button>

            <button
              type="button"
              onClick={fetchPackagesAndTask}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-white border border-[#E5EBE7] text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh package data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {alertMsg && (
          <AlertBanner
            type={alertMsg.type}
            message={alertMsg.text}
            onClose={() => setAlertMsg(null)}
          />
        )}

        {/* Daily Watch-to-Earn Ads Tracker (Rendered only for active VIP members, zero banner clutter for standard users) */}
        <PremiumDailyTaskCard
          dailyTask={dailyTask}
          claiming={claiming}
          onClaim={handleClaimReward}
          onStartWatchAd={handleStartWatchAd}
        />

        {/* Redesigned Membership Pricing Cards */}
        <PremiumPackagesGrid
          packages={packages}
          loading={loading}
          subscribingId={subscribingId}
          currentPackageId={user?.premium_package?.id}
          onSubscribe={handleOpenSubscribeModal}
        />

        {/* Subscribe Confirmation & Referrer Modal */}
        <PremiumSubscribeModal
          isOpen={!!selectedPkgForModal}
          pkg={selectedPkgForModal}
          subscribing={!!subscribingId}
          error={subscribeError}
          onClose={handleCloseSubscribeModal}
          onConfirm={handleConfirmSubscribe}
        />

        {/* Ad Player Modal */}
        <PremiumAdModal
          isOpen={adModalOpen}
          adCompleted={adCompleted}
          recordingAd={recordingAd}
          rewardPerAd={dailyTask?.reward_per_ad}
          onFinishAd={handleFinishAd}
          onCompleteAd={handleCompleteVideoAd}
          onCancelAd={handleCancelVideoAd}
        />

        {/* Restrained Reward Rules Modal */}
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
            <div
              className="relative w-full max-w-lg bg-white rounded-[14px] border border-[#E5EBE7] p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#E5EBE7] pb-3">
                <h3 className="text-base font-bold text-slate-900 ">
                  VIP Membership &amp; Reward Rules
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="p-1 rounded-[6px] hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#009F6B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p>
                    <strong className="text-slate-900">Instant Fractional Payouts:</strong> Each sponsored ad watched immediately credits your wallet account balance. You do not have to finish the entire daily quota to receive your daily earnings.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#009F6B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p>
                    <strong className="text-slate-900">365 Days Validity:</strong> All VIP packages remain active for 365 calendar days from the date of activation with guaranteed daily ad slots.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#009F6B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p>
                    <strong className="text-slate-900">Feature Access:</strong> Active VIP packages unlock peer-to-peer coin transfer capabilities and higher-tier investment portfolio plans.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EBE7] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 rounded-[8px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
