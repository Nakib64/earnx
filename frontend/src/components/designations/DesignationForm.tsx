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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            {editingId ? 'Edit Designation Badge' : 'Create New Designation Badge'}
          </h3>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-extrabold text-slate-400 hover:text-slate-600 flex items-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-end">
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Designation Title / Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 2 Star Executive"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Star Rating (1 - 5)
          </label>
          <select
            value={stars}
            onChange={(e) => onStarsChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">⭐ 1 Star</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars (VIP)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
            Unlocked Tree Level Depth
          </label>
          <select
            value={maxLevel}
            onChange={(e) => onMaxLevelChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="py-2.5 px-6 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
        >
          {editingId ? <Save className="w-4 h-4 text-secondary" /> : <Plus className="w-4 h-4 text-secondary" />}
          <span>{saving ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}</span>
        </button>
      </form>
    </div>
  );
}
