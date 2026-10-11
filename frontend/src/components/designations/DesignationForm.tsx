'use client';

import React from 'react';
import { Award, Plus, Save, RotateCcw } from 'lucide-react';

interface DesignationFormProps {
  editingId: string | null;
  name: string;
  stars: number;
  maxLevel: number;
  saving: boolean;
  onNameChange: (val: string) => void;
  onStarsChange: (val: number) => void;
  onMaxLevelChange: (val: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export default function DesignationForm({
  editingId,
  name,
  stars,
  maxLevel,
  saving,
  onNameChange,
  onStarsChange,
  onMaxLevelChange,
  onSubmit,
  onCancelEdit,
}: DesignationFormProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-slate-100/80 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {editingId ? 'Edit Designation Badge' : 'Create New Designation Badge'}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Define the star rating badge and the maximum referral tree depth it unlocks for earners.
            </p>
          </div>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-end">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Designation Title / Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 2 Star Executive"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Star Rating (1 - 5)
          </label>
          <select
            value={stars}
            onChange={(e) => onStarsChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
          >
            <option value="1">⭐ 1 Star</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars (VIP Leader)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Unlocked Tree Level Depth
          </label>
          <select
            value={maxLevel}
            onChange={(e) => onMaxLevelChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
          >
            <option value="1">Level 1 (Directs)</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5 (Standard Max)</option>
            <option value="6">Level 6</option>
            <option value="7">Level 7</option>
            <option value="8">Level 8</option>
            <option value="9">Level 9</option>
            <option value="10">Level 10</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 px-5 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {editingId ? <Save className="w-4 h-4 text-emerald-100" /> : <Plus className="w-4 h-4 text-emerald-100" />}
          <span>{saving ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}</span>
        </button>
      </form>
    </div>
  );
}
