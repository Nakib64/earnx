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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Edit Designation Badge</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Designation Title / Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3 Star Executive"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Star Count Rating (1 - 5)
            </label>
            <select
              value={stars}
              onChange={(e) => setStars(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            <select
              value={maxLevel}
              onChange={(e) => setMaxLevel(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="sky-gradient-btn px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Designation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
