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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Designation Badges
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {designationsCount}
          </div>
        </div>
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Award className="w-6 h-6" />
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Max Depth Level Configured
          </span>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">
            Level {maxDepthLevel}
          </div>
        </div>
        <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
          <Star className="w-6 h-6" />
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assigned Members
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {totalAssignedMembers}
          </div>
        </div>
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
