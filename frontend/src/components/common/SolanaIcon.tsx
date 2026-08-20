'use client';

import React from 'react';

interface SolanaIconProps {
  className?: string;
  size?: number;
}

export function SolanaIcon({ className = 'w-6 h-6 inline-block align-middle', size }: SolanaIconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      className={`${className} shrink-0 drop-shadow-sm`}
      style={style}
      viewBox="0 0 397 311"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="solanaGradTop" x1="391.25" y1="77.6" x2="10.84" y2="-0.1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id="solanaGradMid" x1="5.75" y1="117.1" x2="386.16" y2="194.8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient id="solanaGradBot" x1="391.25" y1="311.6" x2="10.84" y2="233.9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>

      <path
        d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        fill="url(#solanaGradTop)"
      />
      <path
        d="M332.4 120.9c-2.4-2.4-5.7-3.8-9.2-3.8H5.8c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        fill="url(#solanaGradMid)"
      />
      <path
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        fill="url(#solanaGradBot)"
      />
    </svg>
  );
}

export function SolanaCoinBadge({ className = 'w-7 h-7', size }: SolanaIconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <div
      style={style}
      className={`${className} shrink-0 rounded-full bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-md`}
    >
      <SolanaIcon className="w-full h-full" />
    </div>
  );
}

export function SolanaWelcomePedestal({ className = 'w-36 h-36' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
          <linearGradient id="solanaCoinFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#EAB308" />
            <stop offset="80%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#713F12" />
          </linearGradient>
          <linearGradient id="solanaMarkInside" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow base */}
        <ellipse cx="100" cy="180" rx="75" ry="12" fill="#000000" opacity="0.4" />

        {/* Pedestal Bottom */}
        <path d="M 30 155 Q 100 170 170 155 L 160 175 Q 100 188 40 175 Z" fill="url(#pedestalBase)" stroke="#334155" strokeWidth="1" />
        {/* Pedestal Gold Rim */}
        <ellipse cx="100" cy="155" rx="70" ry="12" fill="url(#goldRing)" stroke="#FDE047" strokeWidth="1.5" />
        <ellipse cx="100" cy="152" rx="64" ry="10" fill="#0F172A" />
        
        {/* Pedestal Tier 2 */}
        <path d="M 45 135 Q 100 148 155 135 L 150 150 Q 100 162 50 150 Z" fill="#1E293B" />
        <ellipse cx="100" cy="135" rx="55" ry="9" fill="url(#goldRing)" />
        <ellipse cx="100" cy="133" rx="50" ry="7" fill="#022C22" />

        {/* Outer Glow behind coin */}
        <circle cx="100" cy="85" r="48" fill="#10B981" opacity="0.15" filter="url(#glowEffect)" />

        {/* Coin Body */}
        <circle cx="100" cy="85" r="44" fill="url(#solanaCoinFace)" stroke="#FEF08A" strokeWidth="3" />
        <circle cx="100" cy="85" r="38" fill="#091E17" stroke="#CA8A04" strokeWidth="1.5" />

        {/* Solana Logo inside Coin */}
        <g transform="translate(73, 67) scale(0.135)">
          <path
            d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
            fill="url(#solanaMarkInside)"
          />
          <path
            d="M332.4 120.9c-2.4-2.4-5.7-3.8-9.2-3.8H5.8c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
            fill="url(#solanaMarkInside)"
          />
          <path
            d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
            fill="url(#solanaMarkInside)"
          />
        </g>

        {/* Shiny coin reflection */}
        <path d="M 62 70 A 38 38 0 0 1 138 70 A 38 38 0 0 0 62 70 Z" fill="#FFFFFF" opacity="0.25" />

        {/* Lock Icon Emblem hanging top-right */}
        <g transform="translate(122, 45)">
          <circle cx="15" cy="15" r="14" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
          <rect x="9" y="14" width="12" height="9" rx="2" fill="#F59E0B" />
          <path d="M 11 14 V 10 A 4 4 0 0 1 19 10 V 14" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default SolanaIcon;
