'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';

interface ActiveNotice {
  id: string;
  title: string;
  content: string;
  is_active?: boolean;
}

interface DashboardNoticeBannerProps {
  notice: ActiveNotice | null;
}

export function DashboardNoticeBanner({ notice }: DashboardNoticeBannerProps) {
  if (!notice || !notice.is_active || !notice.content) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#01281a] via-[#023b26] to-[#011c12] border border-[#d4af37]/45 p-4 sm:p-5 shadow-xl text-white">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex items-start space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/30">
          <Megaphone className="w-5 h-5 text-slate-950" />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Official Announcement
            </span>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
              {notice.title || 'Official Announcement'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
            {notice.content}
          </p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0 mt-2 mr-1" />
      </div>
    </div>
  );
}
