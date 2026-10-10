'use client';

import React from 'react';
import { SkeletonLine, SkeletonCircle } from '../design-system/ShimmerSkeleton';

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* 1. Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-2 max-w-2xl">
          <SkeletonLine width="130px" height="12px" className="rounded-md" />
          <SkeletonLine width="280px" height="32px" className="rounded-xl" />
          <SkeletonLine width="380px" height="16px" className="rounded-lg" />
          <div className="pt-1">
            <SkeletonLine width="180px" height="14px" className="rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <SkeletonLine width="110px" height="38px" className="rounded-xl" />
          <SkeletonLine width="110px" height="38px" className="rounded-xl" />
        </div>
      </div>

      {/* 2. 4 KPI Summary Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex justify-between items-center">
              <SkeletonLine width="80px" height="14px" />
              <SkeletonCircle size="w-4 h-4" />
            </div>
            <SkeletonLine width="120px" height="28px" className="rounded-lg" />
          </div>
        ))}
      </div>

      {/* 3. Top 3 Podium Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-end pt-3">
        {/* 2nd Place */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-6 space-y-4 text-center order-2 md:order-1">
          <SkeletonCircle size="w-20 h-20" className="mx-auto" />
          <div className="space-y-2">
            <SkeletonLine width="120px" height="18px" className="mx-auto" />
            <SkeletonLine width="90px" height="14px" className="mx-auto rounded-full" />
          </div>
          <div className="p-3 rounded-2xl bg-white/60 border border-slate-100 space-y-2">
            <SkeletonLine width="100px" height="12px" className="mx-auto" />
            <SkeletonLine width="80px" height="16px" className="mx-auto" />
          </div>
        </div>

        {/* 1st Place Champion */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-amber-300/60 shadow-[0_12px_40px_rgba(245,158,11,0.1)] rounded-2xl sm:rounded-3xl p-7 space-y-4 text-center order-1 md:order-2 md:-translate-y-3">
          <SkeletonCircle size="w-24 h-24" className="mx-auto" />
          <div className="space-y-2">
            <SkeletonLine width="140px" height="20px" className="mx-auto" />
            <SkeletonLine width="110px" height="16px" className="mx-auto rounded-full" />
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 space-y-2">
            <SkeletonLine width="110px" height="12px" className="mx-auto" />
            <SkeletonLine width="90px" height="18px" className="mx-auto" />
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-6 space-y-4 text-center order-3">
          <SkeletonCircle size="w-20 h-20" className="mx-auto" />
          <div className="space-y-2">
            <SkeletonLine width="120px" height="18px" className="mx-auto" />
            <SkeletonLine width="90px" height="14px" className="mx-auto rounded-full" />
          </div>
          <div className="p-3 rounded-2xl bg-white/60 border border-slate-100 space-y-2">
            <SkeletonLine width="100px" height="12px" className="mx-auto" />
            <SkeletonLine width="80px" height="16px" className="mx-auto" />
          </div>
        </div>
      </div>

      {/* 4. Grid Container Skeleton */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SkeletonLine width="180px" height="22px" />
        <SkeletonLine width="240px" height="40px" className="rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center space-x-3">
              <SkeletonCircle size="w-12 h-12" className="rounded-2xl" />
              <div className="space-y-1.5 flex-1">
                <SkeletonLine width="110px" height="16px" />
                <SkeletonLine width="80px" height="12px" />
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/60 border border-slate-100 flex justify-between">
              <SkeletonLine width="60px" height="14px" />
              <SkeletonLine width="70px" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
