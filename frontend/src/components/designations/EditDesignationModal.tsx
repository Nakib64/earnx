'use client';

import React, { useState, useEffect } from 'react';
import { Award, X, Save } from 'lucide-react';
import { Designation } from '../../types';

interface EditDesignationModalProps {
  designation: Designation | null;
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, stars: number, maxLevel: number) => Promise<void>;
}

export default function EditDesignationModal({
  designation,
  isOpen,
  saving,
  onClose,
  onSave,
}: EditDesignationModalProps) {
  const [name, setName] = useState('');
  const [stars, setStars] = useState(1);
  const [maxLevel, setMaxLevel] = useState(1);

  useEffect(() => {
    if (designation) {
      setName(designation.name || '');
      setStars(designation.stars || 1);
      setMaxLevel(designation.max_level || 1);
    }
  }, [designation]);

  if (!isOpen || !designation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(designation.id, name, stars, maxLevel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-5 shadow-xl border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Edit Designation Badge</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Designation Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3 Star Executive"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Star Count Rating (1 - 5)
            </label>
            <select
              value={stars}
              onChange={(e) => setStars(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1">⭐ 1 Star</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars (VIP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Unlocked Tree Level Depth
            </label>
            <select
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4 text-secondary" />
              <span>{saving ? 'Saving...' : 'Update Designation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
