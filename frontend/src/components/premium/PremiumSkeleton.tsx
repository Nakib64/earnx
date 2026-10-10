'use client';

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from '../design-system/ShimmerSkeleton';

export function PremiumSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Compact Header Skeleton (sitting directly on ambient canvas background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-2 max-w-2xl">
          <SkeletonLine width="130px" height="11px" className="rounded-sm" />
          <SkeletonLine width="420px" height="32px" className="rounded-md" />
          <SkeletonLine width="540px" height="16px" className="rounded-sm" />
          <div className="pt-1 flex items-center gap-2">
            <SkeletonLine width="160px" height="14px" className="rounded-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <SkeletonLine width="105px" height="34px" className="rounded-[8px]" />
          <SkeletonLine width="85px" height="34px" className="rounded-[8px]" />
        </div>
      </div>

      {/* Packages Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="relative bg-white border border-[#E5EBE7] rounded-[14px] p-6 flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-5">
              {/* Header: Title + Badge */}
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1.5 flex-1">
                  <SkeletonLine width="130px" height="22px" className="rounded-md" />
                  <SkeletonLine width="85%" height="13px" className="rounded-sm" />
                </div>
                <SkeletonLine width="64px" height="22px" className="rounded-[6px]" />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <SkeletonLine width="70px" height="12px" className="rounded-sm" />
                <div className="flex items-baseline gap-2">
                  <SkeletonLine width="120px" height="32px" className="rounded-md" />
                  <SkeletonLine width="60px" height="14px" className="rounded-sm" />
                </div>
              </div>

              {/* Daily Reward Pool */}
              <div className="space-y-1.5 pt-1">
                <SkeletonLine width="110px" height="12px" className="rounded-sm" />
                <SkeletonLine width="130px" height="26px" className="rounded-md" />
              </div>

              {/* Ad Metrics Rows */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <SkeletonLine width="95px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="45px" height="13px" className="rounded-sm" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonLine width="80px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="65px" height="13px" className="rounded-sm" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E5EBE7] my-3" />

              {/* Feature Inclusions (4 rows) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <SkeletonLine width="115px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="55px" height="13px" className="rounded-sm" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonLine width="125px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="50px" height="13px" className="rounded-sm" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonLine width="110px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="50px" height="13px" className="rounded-sm" />
                </div>
                <div className="flex justify-between items-center">
                  <SkeletonLine width="135px" height="13px" className="rounded-sm" />
                  <SkeletonLine width="65px" height="13px" className="rounded-sm" />
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-6 mt-6 border-t border-[#E5EBE7]">
              <SkeletonButton width="100%" height="52px" className="rounded-[10px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
