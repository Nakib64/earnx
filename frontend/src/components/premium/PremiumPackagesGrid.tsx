'use client';

import React from 'react';
import { ArrowRight, RefreshCw, Check } from 'lucide-react';
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
  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <RefreshCw className="w-7 h-7 animate-spin text-[#009F6B]" />
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-white border border-[#E5EBE7] rounded-[14px] p-12 text-center">
        <p className="text-base font-semibold text-slate-700">No packages configured yet</p>
        <p className="text-xs text-slate-400 mt-1">Please check back soon or contact support.</p>
      </div>
    );
  }

  return (
    <div id="packages" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {packages.map((pkg) => {
          const isCurrent = currentPackageId === pkg.id;
          const isSubscribing = subscribingId === pkg.id;
          const rewardPerAd =
            pkg.daily_ads_count && pkg.daily_ads_count > 0
              ? Number((Number(pkg.daily_reward_amount) / pkg.daily_ads_count).toFixed(2))
              : 0;

          return (
            <div
              key={pkg.id}
              className={`premium-card relative bg-white border border-[#E5EBE7] rounded-[14px] p-6 flex flex-col justify-between shadow-2xs ${isCurrent ? 'ring-2 ring-[#009F6B]/30 border-[#009F6B]' : ''
                }`}
            >
              {/* Top Section: Title, Price, Reward Pool, Details */}
              <div className="space-y-5">
                {/* Header: Title and Discount / Active Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                      {pkg.title}
                    </h3>
                    {pkg.description && (
                      <p className="text-xs text-slate-500 font-normal mt-0.5 line-clamp-2">
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  {isCurrent ? (
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-[6px]">
                      Active Plan
                    </span>
                  ) : pkg.discount_percent && pkg.discount_percent > 0 ? (
                    <span className="shrink-0 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-[6px]">
                      {pkg.discount_percent}% OFF
                    </span>
                  ) : null}
                </div>

                {/* Membership Price — Sitting directly within the card, NO nested rounded white box */}
                <div className="space-y-1">
                  {pkg.original_price && Number(pkg.original_price) > Number(pkg.price) && (
                    <div className="text-xs text-slate-400 line-through ">
                      ৳{Number(pkg.original_price).toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-slate-900  tracking-tight">
                      ৳{Number(pkg.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      / 365 days
                    </span>
                  </div>
                </div>

                {/* Daily Reward Pool Highlight */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Daily Reward Pool
                  </div>
                  <div className="text-2xl font-semibold text-[#009F6B]  tracking-tight">
                    ৳{Number(pkg.daily_reward_amount).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-slate-500 font-sans">/ day</span>
                  </div>
                </div>

                {/* Ad Metrics Rows (Clean label-value structure) */}
                <div className="space-y-2 pt-1 text-[13px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Daily ads quota</span>
                    <span className="font-semibold text-slate-900">{pkg.daily_ads_count} ads</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Reward rate</span>
                    <span className="font-semibold text-slate-900 ">
                      ৳{rewardPerAd.toFixed(2)} / ad
                    </span>
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="border-t border-[#E5EBE7] my-3" />

                {/* Feature Inclusions (Clean label-value rows, no repetitive green circles) */}
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Membership validity</span>
                    <span className="font-medium text-slate-800">365 days</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Coin transfer access</span>
                    <span className="font-medium text-emerald-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Investment access</span>
                    <span className="font-medium text-emerald-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-normal">Instant fractional payout</span>
                    <span className="font-medium text-emerald-700">Earn per ad</span>
                  </div>
                </div>
              </div>

              {/* Bottom Subscription Action Button */}
              <div className="pt-6 mt-6 border-t border-[#E5EBE7]">
                <button
                  type="button"
                  onClick={() => onSubscribe(pkg)}
                  disabled={isCurrent || isSubscribing}
                  className={
                    isCurrent
                      ? 'w-full h-[52px] rounded-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2'
                      : 'premium-subscribe-btn group'
                  }
                >
                  {isSubscribing ? (
                    <span className="flex items-center gap-2 text-white">
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      <span className="premium-subscribe-btn__label">Processing...</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Currently Subscribed</span>
                    </span>
                  ) : (
                    <>
                      <span className="premium-subscribe-btn__label">
                        Subscribe for ৳{Number(pkg.price).toLocaleString()}
                      </span>
                      <span className="premium-subscribe-btn__icon" aria-hidden="true">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
