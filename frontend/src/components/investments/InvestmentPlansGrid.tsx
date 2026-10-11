'use client';

import React from 'react';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../types';
import { TrendingUp, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import { GlassCard, GlassButton, NumericAmount, ShimmerSkeleton, SkeletonLine, SkeletonBadge } from '../design-system';

interface InvestmentPlansGridProps {
  plans: InvestmentPlan[];
  activeInv?: UserInvestment;
  loading: boolean;
  onSelectPlan: (plan: InvestmentPlan) => void;
}

export function InvestmentPlansGrid({
  plans,
  activeInv,
  loading,
  onSelectPlan,
}: InvestmentPlansGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
          <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="truncate">Available Investment Packages</span>
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <GlassCard key={n} variant="standard" className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2">
                <SkeletonLine className="w-1/2 h-6" />
                <SkeletonLine className="w-3/4 h-3.5" />
              </div>
              <ShimmerSkeleton className="w-full h-20" rounded="rounded-2xl" />
              <div className="grid grid-cols-2 gap-3">
                <ShimmerSkeleton className="w-full h-14" rounded="rounded-2xl" />
                <ShimmerSkeleton className="w-full h-14" rounded="rounded-2xl" />
              </div>
              <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />
            </GlassCard>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <GlassCard variant="standard" className="p-8 text-center text-slate-500 font-bold">
          No investment plans available at the moment. Please check back soon!
        </GlassCard>
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
              <GlassCard
                key={plan.id}
                variant="standard"
                className="group relative flex flex-col justify-between p-5 sm:p-6 space-y-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                {/* Badge */}
                {isPopular ? (
                  <div className="absolute top-0 right-0 bg-amber-100 text-amber-900 border-l border-b border-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl shadow-2xs flex items-center space-x-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Best Yield</span>
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-emerald-50 border-l border-b border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl shrink-0">
                    <span>Guaranteed</span>
                  </div>
                )}

                <div className="space-y-4 min-w-0">
                  {/* Title & Subtitle */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                        {plan.title}
                      </h3>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80">
                      <span>Tenure:</span>
                      <strong className="text-slate-900">
                        {plan.is_lifetime ? 'Lifetime' : `${plan.duration_months || 3} Months`}
                      </strong>
                    </div>
                  </div>

                  {/* Min Investment Box */}
                  <div className="rounded-2xl p-4 flex items-center justify-between min-w-0 bg-white/80 border border-slate-200/90 text-slate-900 shadow-2xs specular-rim">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider block truncate text-slate-400">
                        Min. Investment Capital
                      </span>
                      <NumericAmount value={packageAmt} size="2xl" className=" text-slate-900" />
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#009F6B] shrink-0 shadow-2xs">
                      <TrendingUp className="w-5.5 h-5.5" />
                    </div>
                  </div>

                  {/* Return Rate & Dividend Metrics */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="border border-slate-200/80 p-3 rounded-2xl bg-white/70 min-w-0 space-y-0.5 specular-rim">
                      <span className="text-[10px] font-black uppercase tracking-wider block truncate text-slate-400">
                        Monthly Interest
                      </span>
                      <div className="text-base sm:text-lg font-black truncate text-[#009F6B] tabular-nums">
                        +{returnPct}% / mo
                      </div>
                    </div>

                    <div className="border border-slate-200/80 p-3 rounded-2xl bg-white/70 min-w-0 space-y-0.5 specular-rim">
                      <span className="text-[10px] font-black uppercase tracking-wider block truncate text-slate-400">
                        Total Yield
                      </span>
                      <div className="text-base sm:text-lg font-black truncate text-slate-900 tabular-nums">
                        +{returnPct * (plan.duration_months || 1)}% Total
                      </div>
                    </div>
                  </div>

                  {/* Package Rules & Safeguards */}
                  <div className="space-y-1.5 pt-0.5 text-[11px] font-medium text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="text-amber-600 font-bold">🔒</span>
                      <span>Capital locked for {plan.duration_months || 3} months</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <span className="text-[#009F6B] font-bold">⚡</span>
                      <span>Monthly return added to wallet directly</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isCurrentPackage ? (
                    <div className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 text-center tracking-wide shadow-2xs">
                      ✓ Active Package
                    </div>
                  ) : isHigherPackage ? (
                    <GlassButton
                      onClick={() => onSelectPlan(plan)}
                      disabled={activeInv?.status === RequestStatus.PENDING}
                      variant="primary"
                      fullWidth
                      icon={<ArrowUpRight className="w-4 h-4" />}
                    >
                      Upgrade Package
                    </GlassButton>
                  ) : (
                    <GlassButton
                      onClick={() => onSelectPlan(plan)}
                      disabled={!!activeInv}
                      variant="primary"
                      fullWidth
                      icon={<Zap className="w-4 h-4 fill-current" />}
                    >
                      Invest Now
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
