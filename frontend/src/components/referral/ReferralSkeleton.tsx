'use client';

import React from 'react';
import { ShimmerSkeleton, SkeletonLine, SkeletonBadge } from '../design-system';

export function ReferralSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Header Skeleton sitting directly on background */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-2 max-w-2xl w-full">
          <SkeletonLine className="w-28 h-3.5" rounded="rounded" />
          <SkeletonLine className="w-72 sm:w-96 h-8 sm:h-9" rounded="rounded-xl" />
          <SkeletonLine className="w-full sm:w-[480px] h-4" rounded="rounded" />
          <div className="pt-1 flex items-center gap-2">
            <ShimmerSkeleton className="w-2.5 h-2.5" rounded="rounded-full" />
            <SkeletonLine className="w-32 h-3.5" rounded="rounded" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <ShimmerSkeleton className="w-28 h-9" rounded="rounded-xl" />
          <ShimmerSkeleton className="w-28 h-9" rounded="rounded-xl" />
        </div>
      </div>

      {/* 4 Stat Boxes Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex justify-between items-center">
              <SkeletonLine className="w-24 h-3.5" rounded="rounded" />
              <ShimmerSkeleton className="w-4 h-4" rounded="rounded" />
            </div>
            <SkeletonLine className="w-24 sm:w-28 h-7 sm:h-8" rounded="rounded-md" />
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />

      {/* Table Card Skeleton */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100/80">
          <SkeletonLine className="w-40 h-5" rounded="rounded-md" />
          <SkeletonBadge className="w-24 h-5" rounded="rounded-full" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100/60">
              <div className="flex items-center gap-3">
                <ShimmerSkeleton className="w-9 h-9" rounded="rounded-xl" />
                <div className="space-y-1.5">
                  <SkeletonLine className="w-36 h-4" rounded="rounded" />
                  <SkeletonLine className="w-24 h-3" rounded="rounded" />
                </div>
              </div>
              <SkeletonLine className="w-24 h-4" rounded="rounded" />
              <SkeletonLine className="w-16 h-4" rounded="rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReferralSkeleton;
