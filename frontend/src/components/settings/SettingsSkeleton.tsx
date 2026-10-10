'use client';

import React from 'react';
import { GlassCard } from '../design-system/GlassCard';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '../design-system/ShimmerSkeleton';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header Profile Card Skeleton */}
      <GlassCard className="p-6 sm:p-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 specular-rim" glow>
        <div className="space-y-3 w-full sm:w-auto">
          <SkeletonLine width="220px" height="32px" />
          <SkeletonLine width="150px" height="22px" className="rounded-full" />
          <SkeletonLine width="160px" height="18px" />
        </div>
        <SkeletonCircle size="w-32 h-32 sm:w-36 sm:h-36" />
      </GlassCard>

      {/* Main Settings Form Skeleton */}
      <GlassCard className="p-6 sm:p-8 space-y-6 specular-rim">
        <div className="p-4 rounded-2xl bg-white/50 border border-slate-200/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SkeletonCircle size="w-10 h-10" className="rounded-xl" />
            <div className="space-y-1">
              <SkeletonLine width="130px" height="16px" />
              <SkeletonLine width="180px" height="12px" />
            </div>
          </div>
          <SkeletonButton width="140px" height="38px" />
        </div>

        <div className="space-y-4 pt-2">
          <SkeletonLine width="180px" height="20px" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonLine width="90px" height="12px" />
                <SkeletonLine width="100%" height="44px" className="rounded-2xl" />
              </div>
            ))}
            <div className="sm:col-span-2 space-y-2">
              <SkeletonLine width="160px" height="12px" />
              <SkeletonLine width="100%" height="44px" className="rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <SkeletonLine width="220px" height="20px" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonLine width="100px" height="12px" />
                <SkeletonLine width="100%" height="44px" className="rounded-2xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200/60">
          <SkeletonButton width="220px" height="48px" />
        </div>
      </GlassCard>
    </div>
  );
}
