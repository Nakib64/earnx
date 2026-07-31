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
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span>{editingId ? 'Edit Designation Badge' : 'Create New Designation Badge'}</span>
        </h3>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Designation Title / Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 2 Star Executive"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Star Count Rating (1 - 5)
          </label>
          <select
            value={stars}
            onChange={(e) => onStarsChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="1">⭐ 1 Star</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars (VIP)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Unlocked Tree Level Depth
          </label>
          <input
            type="number"
            min="1"
            max="20"
            required
            placeholder="e.g. 3"
            value={maxLevel}
            onChange={(e) => onMaxLevelChange(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="sky-gradient-btn py-2.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
        >
          {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}</span>
        </button>
      </form>
    </div>
  );
}
