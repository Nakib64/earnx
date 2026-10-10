'use client';

import React from 'react';
import { GlassCard, ShimmerSkeleton, SkeletonLine, SkeletonBadge } from '../design-system';

export function DepositSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Skeleton */}
      <GlassCard variant="elevated" className="p-6 sm:p-8 space-y-3">
        <SkeletonBadge className="w-32 h-6" />
        <SkeletonLine className="w-48 h-8" rounded="rounded-xl" />
        <SkeletonLine className="w-72 h-4" />
      </GlassCard>

      {/* 2-Col Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard variant="standard" className="lg:col-span-5 p-6 space-y-4">
          <SkeletonLine className="w-40 h-5" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <ShimmerSkeleton key={i} className="w-full h-24" rounded="rounded-2xl" />
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="standard" className="lg:col-span-7 p-6 space-y-4">
          <SkeletonLine className="w-48 h-5" />
          <div className="space-y-3">
            <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />
            <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />
            <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />
            <ShimmerSkeleton className="w-full h-12" rounded="rounded-2xl" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
