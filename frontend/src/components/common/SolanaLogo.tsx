'use client';

import React from 'react';

interface SolanaLogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'badge';
}

export function SolanaLogo({ className = 'w-5 h-5 inline-block align-middle', size, variant = 'badge' }: SolanaLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  if (variant === 'badge') {
    return (
      <svg
        className={`${className} shrink-0 drop-shadow-sm`}
        style={style}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="solBadgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0b2e" />
            <stop offset="50%" stopColor="#0b1b17" />
            <stop offset="100%" stopColor="#05120e" />
          </linearGradient>
          <linearGradient id="solGradBadge" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="50%" stopColor="#03E1FF" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="solBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC1FFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00FFA3" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Circular Outer Coin Base */}
        <circle cx="18" cy="18" r="16.5" fill="url(#solBadgeBg)" stroke="url(#solBorderGrad)" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="14" stroke="#00FFA3" strokeWidth="0.5" strokeOpacity="0.3" />

        {/* Solana 3-Stripe Emblem */}
        <g transform="translate(8, 9) scale(0.05)">
          <path
            d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
            fill="url(#solGradBadge)"
          />
          <path
            d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
            fill="url(#solGradBadge)"
          />
          <path
            d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
            fill="url(#solGradBadge)"
          />
        </g>
      </svg>
    );
  }

  // Pure SVG Mark
  return (
    <svg
      className={`${className} shrink-0`}
      style={style}
      viewBox="0 0 397 311"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="solGradMark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="50%" stopColor="#03E1FF" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      <path
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        fill="url(#solGradMark)"
      />
      <path
        d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        fill="url(#solGradMark)"
      />
      <path
        d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        fill="url(#solGradMark)"
      />
    </svg>
  );
}

export default SolanaLogo;
