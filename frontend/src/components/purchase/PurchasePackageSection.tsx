'use client';

import React from 'react';
import { InvestmentPlan } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchasePackageSectionProps {
  packageType: 'PREMIUM' | 'INVESTMENT';
  setPackageType: (val: 'PREMIUM' | 'INVESTMENT') => void;
  premiumFee: number;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  activePlans: InvestmentPlan[];
  loadingPlans: boolean;
}

export function PurchasePackageSection({
  packageType,
  setPackageType,
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
          className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
        >
          <option value="PREMIUM">Premium VIP Membership (৳{premiumFee})</option>
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
            <div className="text-xs text-slate-400 italic">Loading active investment plans...</div>
          ) : activePlans.length > 0 ? (
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
            >
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} — ৳{Number(plan.amount).toLocaleString()} ({plan.monthly_return_percent}% Monthly Return{' '}
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
