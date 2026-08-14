'use client';

import React from 'react';
import { Award, Star, Users } from 'lucide-react';

interface DesignationStatsProps {
  designationsCount: number;
  maxDepthLevel: number;
  totalAssignedMembers: number;
}

export default function DesignationStats({
  designationsCount,
  maxDepthLevel,
  totalAssignedMembers,
}: DesignationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Designation Badges
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
            {designationsCount}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
          <Award className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-4 shadow-lg text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
            Max Depth Level Configured
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-100 font-mono mt-0.5">
            Level {maxDepthLevel}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-[#f3ba2f] shrink-0">
          <Star className="w-5 h-5 fill-[#f3ba2f] text-[#f3ba2f]" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#023322] to-[#011a12] border border-[#d4af37]/35 rounded-2xl p-4 shadow-lg text-white flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
            Assigned Members
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
            {totalAssignedMembers}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f] shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
