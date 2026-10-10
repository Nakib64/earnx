'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShimmerSkeleton, SkeletonLine, SkeletonBadge } from '../design-system';

export function DashboardSkeleton() {
  const { user } = useAuth();
  const isSubscribed = Boolean(user?.is_premium);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full select-none">
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

      {/* FULL WIDTH: Chart Card Skeleton (Liquid Glassmorphism) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100/80 pb-4">
          <div className="flex items-center gap-2">
            <SkeletonLine className="w-44 h-5" rounded="rounded-md" />
            <SkeletonBadge className="w-16 h-5" rounded="rounded-full" />
          </div>
          <div className="flex gap-2">
            <ShimmerSkeleton className="w-28 h-8" rounded="rounded-xl" />
            <ShimmerSkeleton className="w-32 h-8" rounded="rounded-xl" />
          </div>
        </div>
        <ShimmerSkeleton className="w-full h-64 sm:h-76" rounded="rounded-2xl" />
      </div>

      {/* Subscribed Package Card Skeleton (Exact 1:1 match if user is premium - Max 2 Content) */}
      {isSubscribed && (
        <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ShimmerSkeleton className="w-11 h-11" rounded="rounded-2xl" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <SkeletonLine className="w-40 h-5" rounded="rounded-md" />
                <SkeletonBadge className="w-14 h-4" rounded="rounded-full" />
              </div>
              <SkeletonLine className="w-36 h-3" rounded="rounded" />
            </div>
          </div>
          <ShimmerSkeleton className="w-32 h-11" rounded="rounded-xl" />
        </div>
      )}

      {/* 4 Stat Boxes Skeleton (Max 2 Content: Label + Big Number) */}
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

      {/* Platform Shortcuts Skeleton (Liquid Glassmorphism) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 w-full">
        <div className="flex justify-between items-center border-b border-slate-100/80 pb-4">
          <div className="flex items-center space-x-2.5">
            <ShimmerSkeleton className="w-8 h-8" rounded="rounded-xl" />
            <SkeletonLine className="w-32 h-5" rounded="rounded-md" />
          </div>
          <SkeletonLine className="w-16 h-4" rounded="rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] shadow-2xs flex flex-col items-center text-center space-y-2 min-h-[92px] justify-center"
            >
              <ShimmerSkeleton className="w-9 h-9" rounded="rounded-xl" />
              <SkeletonLine className="w-20 h-3" rounded="rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Account Settings Bar Skeleton (Liquid Glassmorphism) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShimmerSkeleton className="w-9 h-9" rounded="rounded-xl" />
          <SkeletonLine className="w-48 h-4" rounded="rounded" />
        </div>
        <ShimmerSkeleton className="w-4 h-4" rounded="rounded-full" />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
