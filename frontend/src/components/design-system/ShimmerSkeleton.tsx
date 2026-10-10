'use client';

import React from 'react';

export interface ShimmerSkeletonProps {
  className?: string;
  rounded?: string;
  width?: string;
  height?: string;
}

export function ShimmerSkeleton({
  className = '',
  rounded = 'rounded-xl',
  width,
  height,
}: ShimmerSkeletonProps) {
  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden bg-slate-200/60 backdrop-blur-xs ${rounded} ${className}`}
    >
      {/* Sliding gradient wave overlay */}
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-wave pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

export function SkeletonLine({
  className = 'w-full h-4',
  rounded = 'rounded-md',
  width,
  height,
}: {
  className?: string;
  rounded?: string;
  width?: string;
  height?: string;
}) {
  return <ShimmerSkeleton className={className} rounded={rounded} width={width} height={height} />;
}

export function SkeletonCircle({
  size = 'w-10 h-10',
  className = '',
}: {
  size?: string;
  className?: string;
}) {
  const isDimension = size.startsWith('w-') || size.includes(' ');
  return (
    <ShimmerSkeleton
      className={`${isDimension ? size : ''} ${className}`}
      rounded="rounded-full"
      width={!isDimension ? size : undefined}
      height={!isDimension ? size : undefined}
    />
  );
}

export function SkeletonBadge({
  className = 'w-20 h-6',
  rounded = 'rounded-full',
  width,
  height,
}: {
  className?: string;
  rounded?: string;
  width?: string;
  height?: string;
}) {
  return <ShimmerSkeleton className={className} rounded={rounded} width={width} height={height} />;
}

export function SkeletonButton({
  className = 'w-full h-12',
  rounded = 'rounded-2xl',
  width,
  height,
}: {
  className?: string;
  rounded?: string;
  width?: string;
  height?: string;
}) {
  return <ShimmerSkeleton className={className} rounded={rounded} width={width} height={height} />;
}
