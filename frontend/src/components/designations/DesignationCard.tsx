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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm hover:border-emerald-300 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">{designation.name}</h4>
            <div className="flex items-center space-x-0.5 mt-0.5">
              {Array.from({ length: designation.stars || 1 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(designation)}
              className="p-1.5 text-primary hover:bg-emerald-50 rounded-xl transition-colors"
              title="Edit Designation"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(designation.id)}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Designation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Earning Depth
            </span>
            <div className="font-mono font-extrabold text-slate-900 mt-0.5">
              Level {designation.max_level}
            </div>
          </div>

          <div className="bg-[#F2FBF6] p-3 rounded-xl border border-emerald-100/90">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Members
            </span>
            <div className="font-mono font-extrabold text-primary mt-0.5">
              {memberCount} Active
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpenAssignModal(designation)}
        className="w-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-primary py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-between px-4 transition-all shadow-xs group cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-primary" />
          <span>View Assigned Members ({memberCount})</span>
        </div>
        <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
