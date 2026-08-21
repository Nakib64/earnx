'use client';

import React, { useEffect, useState } from 'react';

interface PageRenderAnimationProps {
  /** Total duration in milliseconds before fading out (default: 1400ms) */
  duration?: number;
  /** Optional custom logo url (default: /logo.png) */
  logoSrc?: string;
  /** Whether the component should only render standalone inside a container instead of a full-screen overlay */
  standalone?: boolean;
}

export function LogoGlassyWaveMask({ logoSrc = '/logo.png', className = '' }: { logoSrc?: string; className?: string }) {
  // Generate exactly 100 small glassy divs (20 columns x 5 rows)
  const totalDivs = 100;
  const cols = 20;
  const rows = 5;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background Soft Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/25 via-[#d4af37]/35 to-emerald-500/25 blur-xl rounded-full animate-pulse-glow" />

      {/* Dimmed Base Silhouette for depth */}
      <img
        src={logoSrc}
        alt="EarnX"
        className="w-72 sm:w-88 h-20 sm:h-24 object-contain opacity-20 filter brightness-150 select-none pointer-events-none"
      />

      {/* Mask Container: Same exact width and height of the logo */}
      <div
        className="absolute inset-0 w-72 sm:w-88 h-20 sm:h-24 mx-auto my-auto overflow-hidden select-none pointer-events-none"
        style={{
          maskImage: `url('${logoSrc}')`,
          WebkitMaskImage: `url('${logoSrc}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        {/* Transparent Glassy Wrapper */}
        <div className="w-full h-full backdrop-blur-md bg-white/10 border border-white/30 rounded-2xl shadow-[0_8px_32px_0_rgba(0,255,150,0.15)] p-1 flex items-center justify-center">
          {/* 100 Glassy Divs with Left-to-Right Wave Animation */}
          <div
            className="w-full h-full grid gap-[2px] sm:gap-1 p-0.5"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalDivs }).map((_, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              // Wave moving left to right with slight vertical offset
              const delay = col * 0.065 + row * 0.02;

              return (
                <div
                  key={index}
                  className="w-full h-full rounded-[2px] sm:rounded-[3px] border border-white/40 bg-white/20 backdrop-blur-sm shadow-sm animate-glassy-wave"
                  style={{
                    animationDelay: `${delay.toFixed(3)}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageRenderAnimation({
  duration = 1400,
  logoSrc = '/logo.png',
  standalone = false,
}: PageRenderAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    const removeTimer = setTimeout(() => {
      setRemoved(true);
    }, duration + 700); // Wait for transition fade out to complete

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  if (!mounted || removed) return null;

  if (standalone) {
    return <LogoGlassyWaveMask logoSrc={logoSrc} />;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#01281a] via-[#011a12] to-[#000f0a] transition-all duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none scale-105 blur-sm'
      }`}
    >
      {/* Ambient background particles/glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-72 h-72 bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none -top-10" />

      {/* Center 100-Div Glassy Logo Wave Mask */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <LogoGlassyWaveMask logoSrc={logoSrc} />

        {/* Shimmering branding line */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-black tracking-widest text-[#d4af37] uppercase animate-pulse">
            <span>EarnX Capital</span>
          </div>

          <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden border border-white/10">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-[glassyWave_1.5s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
