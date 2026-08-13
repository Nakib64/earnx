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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Designation Badges
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
            {designationsCount}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
          <Award className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#854D0E]">
            Max Depth Level Configured
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#854D0E] font-mono mt-0.5">
            Level {maxDepthLevel}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center text-[#854D0E] shrink-0">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
      </div>

      <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005A36]">
            Assigned Members
          </span>
          <div className="text-xl sm:text-2xl font-black text-primary font-mono mt-0.5">
            {totalAssignedMembers}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
