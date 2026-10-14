'use client';

import React from 'react';
import { InvestmentPlan, MemberPackage } from '../../hooks/orchestrators/usePurchaseOrchestrator';
import { Crown, Sparkles, Tv, Clock, Gift, ShieldCheck } from 'lucide-react';

interface PurchasePackageSectionProps {
  packageType: 'PREMIUM' | 'INVESTMENT';
  setPackageType: (val: 'PREMIUM' | 'INVESTMENT') => void;
  memberPackages: MemberPackage[];
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  loadingPackages: boolean;
  selectedMemberPackage: MemberPackage | null;
  premiumFee: number;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  activePlans: InvestmentPlan[];
  loadingPlans: boolean;
}

export function PurchasePackageSection({
  packageType,
  setPackageType,
  memberPackages,
  selectedPackageId,
  setSelectedPackageId,
  loadingPackages,
  selectedMemberPackage,
  premiumFee,
  selectedPlanId,
  setSelectedPlanId,
  activePlans,
  loadingPlans,
}: PurchasePackageSectionProps) {
  // Determine select value
  const selectValue =
    packageType === 'INVESTMENT' ? 'INVESTMENT' : selectedPackageId || 'PREMIUM';

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'INVESTMENT') {
      setPackageType('INVESTMENT');
    } else {
      setPackageType('PREMIUM');
      setSelectedPackageId(val);
    }
  };

  return (
    <div className="space-y-4">
      {/* Package Type Dropdown with all member packages */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
          Select Package Type <span className="text-rose-500">*</span>
        </label>
        <select
          value={selectValue}
          onChange={handleSelectChange}
          className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
        >
          {loadingPackages ? (
            <option disabled value="">
              Loading member packages...
            </option>
          ) : memberPackages.length > 0 ? (
            memberPackages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title} (৳{Number(pkg.price).toLocaleString()})
              </option>
            ))
          ) : (
            <option value="PREMIUM">Premium VIP Membership (৳{premiumFee})</option>
          )}

          <option value="INVESTMENT">Investment Package Plan</option>
        </select>
      </div>

      {/* Selected Member Package Feature Highlights Card */}
      {packageType === 'PREMIUM' && selectedMemberPackage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/80 to-emerald-50/40 border border-emerald-500/25 shadow-xs space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/15">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {selectedMemberPackage.title}
                </h4>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Official VIP Membership Subscription
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-black text-emerald-900">
                  ৳{Number(selectedMemberPackage.price).toLocaleString()}
                </span>
                {selectedMemberPackage.original_price &&
                  Number(selectedMemberPackage.original_price) >
                    Number(selectedMemberPackage.price) && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      ৳{Number(selectedMemberPackage.original_price).toLocaleString()}
                    </span>
                  )}
              </div>
              {selectedMemberPackage.discount_percent ? (
                <span className="inline-block text-[10px] font-black uppercase text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                  {selectedMemberPackage.discount_percent}% Discount Applied
                </span>
              ) : null}
            </div>
          </div>

          {/* Quick Perks Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center space-x-2">
              <Tv className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Daily Ads
                </span>
                <span className="font-extrabold text-slate-800">
                  {selectedMemberPackage.daily_ads_count} Ads / day
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center space-x-2">
              <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Daily Reward
                </span>
                <span className="font-extrabold text-emerald-800">
                  ৳{Number(selectedMemberPackage.daily_reward_amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Validity
                </span>
                <span className="font-extrabold text-slate-800">
                  {selectedMemberPackage.duration_days} Days
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Sponsor Bonus
                </span>
                <span className="font-extrabold text-slate-800">
                  {Number(selectedMemberPackage.direct_referral_commission || 0) > 0
                    ? `৳${Number(selectedMemberPackage.direct_referral_commission).toLocaleString()}`
                    : 'Level 1 Tier'}
                </span>
              </div>
            </div>
          </div>

          {selectedMemberPackage.description && (
            <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
              {selectedMemberPackage.description}
            </p>
          )}
        </div>
      )}

      {/* Investment Plans List Dropdown */}
      {packageType === 'INVESTMENT' && (
        <div className="space-y-1.5 animate-fade-in">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Select Investment Plan <span className="text-rose-500">*</span>
          </label>
          {loadingPlans ? (
            <div className="text-xs text-slate-400 italic">
              Loading active investment plans...
            </div>
          ) : activePlans.length > 0 ? (
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
            >
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} — ৳{Number(plan.amount).toLocaleString()} (
                  {plan.monthly_return_percent}% Monthly Return{' '}
                  {plan.is_lifetime ? '• Lifetime' : `• ${plan.duration_months} Months`})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-rose-500 font-bold">
              No active investment plans available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
