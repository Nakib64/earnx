'use client';

import React from 'react';

export function AmbientCanvas() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* Primary Emerald Depth Orb (8% opacity, blur-3xl) */}
      <div
        className="absolute -top-24 -left-20 w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] lg:w-[720px] lg:h-[720px] rounded-full bg-emerald-500/[0.08] blur-[120px] transition-transform duration-1000 ease-out"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />

      {/* Secondary Sky Blue Refraction Orb (6% opacity, blur-3xl) */}
      <div
        className="absolute top-1/3 -right-24 w-[380px] h-[380px] sm:w-[520px] sm:h-[520px] lg:w-[680px] lg:h-[680px] rounded-full bg-sky-500/[0.06] blur-[140px] transition-transform duration-1000 ease-out"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />

      {/* Subtle Bottom Ambient Glow */}
      <div
        className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-400/[0.05] blur-[140px]"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      />
    </div>
  );
}
