'use client';

import React from 'react';
import { GlassCard } from '../design-system/GlassCard';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '../design-system/ShimmerSkeleton';

export function PurchaseSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Top Banner Header Skeleton */}
      <GlassCard className="p-5 sm:p-6 flex items-center justify-between gap-4 specular-rim" glow>
        <div className="space-y-2">
          <SkeletonLine width="180px" height="24px" />
          <SkeletonLine width="280px" height="14px" />
        </div>
        <SkeletonLine width="130px" height="34px" className="rounded-xl" />
      </GlassCard>

      {/* Main Generic Form Skeleton */}
      <GlassCard className="p-6 sm:p-8 space-y-6 specular-rim">
        {/* Target User Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <SkeletonLine width="120px" height="14px" />
            <SkeletonLine width="100px" height="14px" />
          </div>
          <SkeletonLine width="100%" height="44px" className="rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/50 border border-slate-200/60">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonLine width="80px" height="10px" />
                <SkeletonLine width="100%" height="32px" className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Package Section */}
        <div className="space-y-3">
          <SkeletonLine width="140px" height="14px" />
          <SkeletonLine width="100%" height="44px" className="rounded-xl" />
        </div>

        {/* Referrer Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200/60">
          <div className="flex justify-between items-center">
            <SkeletonLine width="160px" height="14px" />
            <SkeletonLine width="110px" height="14px" />
          </div>
          <SkeletonLine width="100%" height="44px" className="rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/50 border border-slate-200/60">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonLine width="80px" height="10px" />
                <SkeletonLine width="100%" height="32px" className="rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Total Cost & Submit */}
        <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <SkeletonLine width="100px" height="12px" />
            <SkeletonLine width="120px" height="28px" />
          </div>
          <SkeletonButton width="180px" height="48px" />
        </div>
      </GlassCard>
    </div>
  );
}
