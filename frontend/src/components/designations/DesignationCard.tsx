'use client';

import React from 'react';
import { Star, Edit2, Trash2, Users, ChevronRight } from 'lucide-react';
import { DesignationUser } from '../../hooks/useDesignations';

interface DesignationCardProps {
  designation: {
    id: string;
    name: string;
    stars: number;
    max_level: number;
    users?: DesignationUser[];
    _count?: {
      users: number;
    };
  };
  onEdit: (des: any) => void;
  onDelete: (id: string) => void;
  onOpenAssignModal: (des: any) => void;
}

export default function DesignationCard({
  designation,
  onEdit,
  onDelete,
  onOpenAssignModal,
}: DesignationCardProps) {
  const memberCount = designation._count?.users ?? designation.users?.length ?? 0;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between hover:border-[#009F6B]/40 hover:shadow-md transition-all group select-none space-y-4">
      <div className="space-y-3.5">
        {/* Top Header Row */}
        <div className="flex items-start justify-between border-b border-slate-100/80 pb-3.5 gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base leading-tight group-hover:text-[#009F6B] transition-colors">
                {designation.name}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                {designation.stars}★ Rank
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1.5">
              {Array.from({ length: designation.stars || 1 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onEdit(designation)}
              className="p-2 text-slate-400 hover:text-[#009F6B] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="Edit Designation Badge"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(designation.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Delete Designation Badge"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Depth & Members Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Earning Depth
            </span>
            <div className="font-bold text-slate-900 text-sm mt-0.5">
              Level {designation.max_level}
            </div>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/90">
            <span className="text-[10px] text-[#009F6B] font-bold uppercase tracking-wider block">
              Active Members
            </span>
            <div className="font-bold text-[#009F6B] text-sm mt-0.5">
              {memberCount} Assigned
            </div>
          </div>
        </div>
      </div>

      {/* View Assigned Members CTA */}
      <button
        onClick={() => onOpenAssignModal(designation)}
        className="w-full bg-emerald-50/70 hover:bg-[#009F6B] border border-emerald-200/80 hover:border-[#009F6B] text-[#009F6B] hover:text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-between px-4 transition-all shadow-2xs group/btn cursor-pointer active:scale-[0.98]"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>View Assigned Members ({memberCount})</span>
        </div>
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
