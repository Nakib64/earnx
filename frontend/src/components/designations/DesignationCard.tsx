'use client';

import React from 'react';
import { Star, Edit2, Trash2, Users } from 'lucide-react';

interface DesignationCardProps {
  designation: {
    id: string;
    name: string;
    stars: number;
    max_level: number;
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
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-sky-300 transition-colors">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">{designation.name}</h4>
            <div className="flex items-center space-x-1 mt-0.5">
              {Array.from({ length: designation.stars || 1 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(designation)}
              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Edit Designation"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(designation.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Delete Designation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Earning Depth
            </span>
            <div className="font-extrabold text-sky-700 mt-0.5">
              Up to Level {designation.max_level}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Assigned Members
            </span>
            <div className="font-extrabold text-purple-700 mt-0.5">
              {designation._count?.users || 0} Members
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpenAssignModal(designation)}
        className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span>Setup / Assign Users</span>
      </button>
    </div>
  );
}
