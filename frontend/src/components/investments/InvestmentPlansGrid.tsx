'use client';

import React from 'react';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../types';
import { TrendingUp, Sparkles, ArrowUpRight, Zap } from 'lucide-react';

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
                      onClick={() => onSelectPlan(plan)}
                      disabled={activeInv?.status === RequestStatus.PENDING}
                      className="w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 text-slate-950 shrink-0" />
                      <span className="truncate">Upgrade Package</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectPlan(plan)}
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
  );
}
