'use client';

import React, { useMemo } from 'react';
import { Award, X } from 'lucide-react';
import { User, Designation } from '../../types';

interface AssignDesignationModalProps {
  user: User | null;
  designations: Designation[];
  allBadgedLeaders: User[];
  targetDesignation: string;
  targetSponsorId: string;
  savingBadge: boolean;
  isOpen: boolean;
  onClose: () => void;
  onTargetDesignationChange: (id: string) => void;
  onTargetSponsorIdChange: (id: string) => void;
  onSubmit: () => Promise<void>;
}

export function AssignDesignationModal({
  user,
  designations,
  allBadgedLeaders,
  targetDesignation,
  targetSponsorId,
  savingBadge,
  isOpen,
  onClose,
  onTargetDesignationChange,
  onTargetSponsorIdChange,
  onSubmit,
}: AssignDesignationModalProps) {
  const selectedDesignationObj = useMemo(
    () => designations.find((d) => d.id === targetDesignation),
    [designations, targetDesignation],
  );

  const currentSponsorId = useMemo(
    () => user?.referred_by?.id || user?.referred_by_id,
    [user],
  );

  const eligibleSponsors = useMemo(
    () =>
      allBadgedLeaders.filter(
        (u) =>
          u.id !== user?.id &&
          u.id !== currentSponsorId &&
          u.designation &&
          selectedDesignationObj &&
          u.designation.stars > selectedDesignationObj.stars,
      ),
    [allBadgedLeaders, user, currentSponsorId, selectedDesignationObj],
  );

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Assign Designation & Hierarchy Sponsor</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Member: <strong>{user.full_name || user.phone}</strong> ({user.phone})
        </p>

        <div className="space-y-4">
          {/* Designation Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              1. Select Designation Badge
            </label>
            <select
              value={targetDesignation}
              onChange={(e) => onTargetDesignationChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold"
            >
              <option value="">No Designation (Unbadged Member)</option>
              {designations.map((des) => (
                <option key={des.id} value={des.id}>
                  {des.name} ({des.stars} Stars - Unlocks Level {des.max_level})
                </option>
              ))}
            </select>
          </div>

          {/* Hierarchy Sponsor Selection */}
          {targetDesignation && (
            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-2">
              <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                2. Select Hierarchy Sponsor / Tree Placement
              </label>
              <p className="text-[11px] text-purple-700 font-medium">
                Rule: A member with a badge must be under a sponsor with a strictly higher designation.
              </p>

              <select
                value={targetSponsorId}
                onChange={(e) => onTargetSponsorIdChange(e.target.value)}
                className="w-full bg-white border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-slate-800"
              >
                <option value="ROOT">🌟 Top of Tree (Root Leader - No Sponsor)</option>
                {user.referred_by && (
                  <option value="CURRENT">
                    🔄 Keep Current Sponsor ({user.referred_by?.full_name || user.referred_by?.phone})
                  </option>
                )}
                {eligibleSponsors.map((s) => (
                  <option key={s.id} value={s.id}>
                    👤 {s.full_name || s.phone} ({s.designation?.name} - {s.designation?.stars} Stars)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={savingBadge}
              className="sky-gradient-btn px-5 py-2 rounded-xl text-xs font-bold"
            >
              {savingBadge ? 'Saving...' : 'Save Designation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
