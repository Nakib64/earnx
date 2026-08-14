'use client';

import React from 'react';

interface GoldenCoinsIconProps {
  className?: string;
  size?: number;
}

export function GoldenCoinsIcon({ className = 'w-5 h-5 inline-block align-middle', size }: GoldenCoinsIconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      className={`${className} shrink-0 drop-shadow-sm`}
      style={style}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Back Coin Gradient */}
        <linearGradient id="goldBackCoin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4B8" />
          <stop offset="35%" stopColor="#F5C542" />
          <stop offset="70%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6B0A" />
        </linearGradient>
        {/* Front Coin Gradient */}
        <linearGradient id="goldFrontCoin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#FFF1AA" />
          <stop offset="55%" stopColor="#F3BA2F" />
          <stop offset="85%" stopColor="#C49B18" />
          <stop offset="100%" stopColor="#755B04" />
        </linearGradient>
        {/* Shimmer Highlight */}
        <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Second / Back Golden Coin */}
      <g transform="translate(10, 2)">
        <circle cx="13" cy="13" r="11" fill="url(#goldBackCoin)" stroke="#FFE899" strokeWidth="1.2" />
        <circle cx="13" cy="13" r="8.5" stroke="#785C05" strokeWidth="0.8" strokeDasharray="2 1" />
        <text x="13" y="16.5" textAnchor="middle" fill="#423201" fontSize="10" fontWeight="900" fontFamily="sans-serif">৳</text>
      </g>

      {/* 2. Main / Front Golden Coin */}
      <g transform="translate(2, 10)">
        <circle cx="12" cy="12" r="11.5" fill="url(#goldFrontCoin)" stroke="#FFFDF0" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="9" stroke="#6E5404" strokeWidth="0.9" />
        {/* Shiny Edge Highlight */}
        <path d="M 4.5 12 A 7.5 7.5 0 0 1 19.5 12" stroke="url(#goldHighlight)" strokeWidth="1.2" fill="none" />
        <text x="12" y="15.8" textAnchor="middle" fill="#362900" fontSize="11" fontWeight="900" fontFamily="sans-serif">৳</text>
      </g>
    </svg>
  );
}

export default GoldenCoinsIcon;
