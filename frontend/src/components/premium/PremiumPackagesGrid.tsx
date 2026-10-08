'use client';

import React from 'react';
import { Crown, Check, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { PremiumPackage } from '../../types';

interface PremiumPackagesGridProps {
  packages: PremiumPackage[];
  loading: boolean;
  subscribingId: string | null;
  currentPackageId?: string;
  onSubscribe: (pkg: PremiumPackage) => void;
}

export function PremiumPackagesGrid({
  packages,
  loading,
  subscribingId,
  currentPackageId,
  onSubscribe,
}: PremiumPackagesGridProps) {
  return (
    <div id="packages" className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Available Premium Packages</h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Higher tier packages provide more daily ads and larger daily payouts
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#005A36]" />
        </div>
      ) : packages.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Crown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-black text-slate-600">No packages configured yet</p>
          <p className="text-xs text-slate-400">Admin will add packages soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isCurrent = currentPackageId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#005A36] ring-2 ring-[#005A36] shadow-lg shadow-emerald-950/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#005A36] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Active Package
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{pkg.title}</h3>
                    {pkg.description && (
                      <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      One-time Fee
                    </span>
                    <div className="flex items-baseline gap-1 text-slate-900 font-black">
                      <span className="text-2xl sm:text-3xl">৳{Number(pkg.price).toLocaleString()}</span>
                      <span className="text-xs text-slate-500 font-bold">/ membership</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Daily Return:{' '}
                        <strong className="text-[#005A36] font-black">
                          ৳{Number(pkg.daily_reward_amount).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Daily Ads to Watch:{' '}
                        <strong className="text-slate-900 font-black">{pkg.daily_ads_count} Ads</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full Access to Coin Transfer Hub</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full Access to Investment Packages</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <button
                    onClick={() => onSubscribe(pkg)}
                    disabled={isCurrent || subscribingId === pkg.id}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-[#005A36] hover:bg-[#044D2F] text-white shadow-md shadow-emerald-950/15'
                    }`}
                  >
                    {subscribingId === pkg.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isCurrent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Currently Subscribed</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe for ৳{Number(pkg.price).toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
