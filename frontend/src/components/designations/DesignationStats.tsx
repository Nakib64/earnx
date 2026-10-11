'use client';

import React from 'react';
import { Award, Layers, Users } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 select-none">
      {/* Box 1: Configured Badges */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Designation Badges</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {designationsCount}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Configured star rank tiers
          </span>
        </div>
      </div>

      {/* Box 2: Max Earning Depth */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Max Tree Depth</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
            Level {maxDepthLevel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Deepest unlocked commission level
          </span>
        </div>
      </div>

      {/* Box 3: Assigned Leaders */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Assigned Leaders</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
            {totalAssignedMembers}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
            Active badged community members
          </span>
        </div>
      </div>
    </div>
  );
}
