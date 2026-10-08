'use client';

import React from 'react';
import { Crown, Wallet, TrendingUp } from 'lucide-react';

interface DashboardHeroHeaderProps {
  firstName?: string | null;
  isPremium: boolean;
  walletBalance?: number | string;
}

export function DashboardHeroHeader({
  firstName,
  isPremium,
  walletBalance,
}: DashboardHeroHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] lg:rounded-[28px] bg-gradient-to-br from-[#012215] via-[#022e1d] to-[#01160d] border border-emerald-900/60 p-4 sm:p-5 lg:p-6 text-white shadow-xl">
      {/* Ambient Glows */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-row items-center justify-between gap-4 lg:gap-6">
        {/* Left Info */}
        <div className="space-y-2 sm:space-y-2.5 max-w-md lg:max-w-xl">
          {/* Greeting & Name */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20" />
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
                Welcome Back
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5 drop-shadow-sm">
              <span>{firstName}</span>
              <span className="text-base sm:text-lg">👋</span>
            </h1>
          </div>

          {/* Status & Wallet Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {isPremium ? (
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-600/15 border border-[#d4af37]/60 text-[#fbbf24] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.15)] backdrop-blur-md">
                <Crown className="w-3 h-3 fill-[#fbbf24] text-[#fbbf24]" />
                <span>Premium</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                <span>Standard</span>
              </div>
            )}

            {walletBalance !== undefined && (
              <div className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                <Wallet className="w-3 h-3 text-emerald-400" />
                <span>৳{Number(walletBalance).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Total Earnings Stat Box */}
          <div className="pt-0.5">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-emerald-500/20 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-sm">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-[11px] font-semibold tracking-wide">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>Earnings:</span>
              </div>
              <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 tracking-tight">
                +12.48%
              </span>
              <span className="inline-flex items-center text-[9px] font-black bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1 py-0.2 rounded">
                ▲ 24H
              </span>
            </div>
          </div>
        </div>

        {/* Right: 3D Rising Pedestal Artwork */}
        <div className="w-32 h-24 sm:w-36 sm:h-28 lg:w-44 lg:h-36 relative shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 160"
            className="w-full h-full drop-shadow-2xl overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="barG1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="barG2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="arrowG" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="60%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#a7f3d0" />
              </linearGradient>
              <linearGradient id="crownGoldG" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id="pedestalG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#064e3b" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
              <linearGradient id="avatarG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>

            {/* Pedestal Base */}
            <ellipse cx="100" cy="135" rx="85" ry="20" fill="url(#pedestalG)" stroke="#047857" strokeWidth="2" />
            <ellipse cx="100" cy="130" rx="75" ry="16" fill="#012217" opacity="0.8" />

            {/* Curved Arrow Rising */}
            <path
              d="M 25 110 Q 55 50 115 25"
              fill="none"
              stroke="url(#arrowG)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px rgba(52,211,153,0.6))"
            />
            <polygon points="112,18 128,22 118,34" fill="#6ee7b7" />

            {/* Ascending 3D Columns */}
            <g transform="translate(38, 90)">
              <path d="M 0 10 L 0 35 A 10 5 0 0 0 20 35 L 20 10 Z" fill="url(#barG2)" />
              <ellipse cx="10" cy="10" rx="10" ry="5" fill="#6ee7b7" />
            </g>
            <g transform="translate(62, 70)">
              <path d="M 0 10 L 0 55 A 11 5.5 0 0 0 22 55 L 22 10 Z" fill="url(#barG1)" />
              <ellipse cx="11" cy="10" rx="11" ry="5.5" fill="#a7f3d0" />
            </g>
            <g transform="translate(88, 48)">
              <path d="M 0 10 L 0 78 A 12 6 0 0 0 24 78 L 24 10 Z" fill="url(#barG1)" />
              <ellipse cx="12" cy="10" rx="12" ry="6" fill="#d1fae5" />
            </g>

            {/* User Token with Golden Crown */}
            <g transform="translate(120, 52)">
              <path
                d="M 12 3 L 18 12 L 28 0 L 38 12 L 44 3 L 40 16 L 16 16 Z"
                fill="url(#crownGoldG)"
                filter="drop-shadow(0 2px 5px rgba(251,191,36,0.8))"
              />
              <circle cx="28" cy="38" r="24" fill="url(#avatarG)" stroke="#34d399" strokeWidth="2.5" />
              <circle cx="28" cy="38" r="20" fill="#064e3b" />
              <circle cx="28" cy="32" r="6" fill="#a7f3d0" />
              <path d="M 18 46 A 10 10 0 0 1 38 46 Z" fill="#a7f3d0" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
