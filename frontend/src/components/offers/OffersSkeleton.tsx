'use client';

import React from 'react';
import { GlassCard } from '../design-system/GlassCard';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '../design-system/ShimmerSkeleton';

export function OffersSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header Skeleton */}
      <GlassCard className="p-6 sm:p-8 specular-rim" glow>
        <div className="space-y-2">
          <SkeletonLine width="140px" height="20px" className="rounded-full" />
          <SkeletonLine width="260px" height="28px" />
          <SkeletonLine width="380px" height="14px" />
        </div>
      </GlassCard>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="p-6 space-y-5 specular-rim flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SkeletonLine width="90px" height="22px" className="rounded-full" />
                <SkeletonLine width="70px" height="22px" />
              </div>
              <SkeletonLine width="80%" height="20px" />
              <div className="space-y-1.5">
                <SkeletonLine width="100%" height="12px" />
                <SkeletonLine width="90%" height="12px" />
                <SkeletonLine width="60%" height="12px" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60">
              <SkeletonButton width="100%" height="44px" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
