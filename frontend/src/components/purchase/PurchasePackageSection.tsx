'use client';

import React from 'react';
import { InvestmentPlan } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchasePackageSectionProps {
  packageType: 'ACTIVATION' | 'PREMIUM' | 'INVESTMENT';
  setPackageType: (val: 'ACTIVATION' | 'PREMIUM' | 'INVESTMENT') => void;
  activationFee: number;
  premiumFee: number;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  activePlans: InvestmentPlan[];
  loadingPlans: boolean;
}

export function PurchasePackageSection({
  packageType,
  setPackageType,
  activationFee,
  premiumFee,
  selectedPlanId,
  setSelectedPlanId,
  activePlans,
  loadingPlans,
}: PurchasePackageSectionProps) {
  return (
    <div className="space-y-4">
      {/* Package Type Dropdown */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
          Select Package Type <span className="text-rose-500">*</span>
        </label>
        <select
          value={packageType}
          onChange={(e) => setPackageType(e.target.value as any)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] cursor-pointer"
        >
          <option value="ACTIVATION">Account Activation Package (৳{activationFee})</option>
          <option value="PREMIUM">Premium Subscription Package (৳{premiumFee})</option>
          <option value="INVESTMENT">Investment Package Plan</option>
        </select>
      </div>

      {/* Investment Plans List Dropdown */}
      {packageType === 'INVESTMENT' && (
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Select Investment Plan <span className="text-rose-500">*</span>
          </label>
          {loadingPlans ? (
            <div className="text-xs text-slate-400 italic">Loading active plans...</div>
          ) : activePlans.length > 0 ? (
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36] cursor-pointer"
            >
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} — ৳{Number(plan.amount)} ({plan.monthly_return_percent}% Monthly Return{' '}
                  {plan.is_lifetime ? '• Lifetime' : `• ${plan.duration_months} Months`})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-rose-500 font-bold">No active investment plans available.</div>
          )}
        </div>
      )}
    </div>
  );
}
