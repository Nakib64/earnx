'use client';

import React from 'react';
import { GlassCard } from '../design-system/GlassCard';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '../design-system/ShimmerSkeleton';

export function MarketplaceSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 animate-fade-in">
      {/* Feed Header Skeleton */}
      <GlassCard className="p-5 sm:p-6 flex items-center justify-between specular-rim" glow>
        <div className="flex items-center space-x-3.5">
          <SkeletonCircle size="w-11 h-11" className="rounded-2xl" />
          <div className="space-y-1.5">
            <SkeletonLine width="200px" height="22px" />
            <SkeletonLine width="260px" height="14px" />
          </div>
        </div>
        <SkeletonCircle size="w-9 h-9" className="rounded-xl" />
      </GlassCard>

      {/* Composer Skeleton */}
      <GlassCard className="p-5 sm:p-6 space-y-4 specular-rim">
        <div className="flex items-start space-x-3">
          <SkeletonCircle size="w-10 h-10" />
          <SkeletonLine width="100%" height="70px" className="rounded-2xl" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
          <SkeletonLine width="100px" height="36px" className="rounded-xl" />
          <SkeletonButton width="90px" height="38px" />
        </div>
      </GlassCard>

      {/* Post Cards Skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <GlassCard key={i} className="p-5 space-y-4 specular-rim">
          <div className="flex items-center space-x-3">
            <SkeletonCircle size="w-10 h-10" />
            <div className="space-y-1.5 flex-1">
              <SkeletonLine width="140px" height="16px" />
              <SkeletonLine width="80px" height="12px" />
            </div>
          </div>
          <div className="space-y-2">
            <SkeletonLine width="95%" height="14px" />
            <SkeletonLine width="80%" height="14px" />
          </div>
          {i === 1 && (
            <SkeletonLine width="100%" height="220px" className="rounded-2xl" />
          )}
          <div className="pt-2 border-t border-slate-200/60 flex justify-around">
            <SkeletonLine width="60px" height="20px" />
            <SkeletonLine width="60px" height="20px" />
            <SkeletonLine width="60px" height="20px" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
