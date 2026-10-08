'use client';

import React from 'react';
import { User } from 'lucide-react';
import { UserSearchResult } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchaseTargetSectionProps {
  targetQuery: string;
  setTargetQuery: (val: string) => void;
  targetResults: UserSearchResult[];
  searchingTarget: boolean;
  selectedTargetUser: UserSearchResult | null;
  setSelectedTargetUser: (u: UserSearchResult | null) => void;
  showTargetDropdown: boolean;
  setShowTargetDropdown: (show: boolean) => void;
  onSelectTargetUser: (u: UserSearchResult) => void;
  onSelectSelfAsTarget: () => void;
}

export function PurchaseTargetSection({
  targetQuery,
  setTargetQuery,
  targetResults,
  searchingTarget,
  selectedTargetUser,
  setSelectedTargetUser,
  showTargetDropdown,
  setShowTargetDropdown,
  onSelectTargetUser,
  onSelectSelfAsTarget,
}: PurchaseTargetSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Target User Id <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={onSelectSelfAsTarget}
            className="text-xs text-[#005A36] font-bold hover:underline cursor-pointer flex items-center space-x-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Use My Own Id</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Enter or search Target User Id (e.g. EX1001)..."
            value={targetQuery}
            onChange={(e) => {
              setTargetQuery(e.target.value);
              if (
                selectedTargetUser &&
                e.target.value.trim().toLowerCase() !== selectedTargetUser.referral_code.toLowerCase()
              ) {
                setSelectedTargetUser(null);
              }
            }}
            onFocus={() => targetResults.length > 0 && !selectedTargetUser && setShowTargetDropdown(true)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
          />
          {searchingTarget && (
            <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
              Searching...
            </span>
          )}

          {/* Target Dropdown Suggestions */}
          {showTargetDropdown && targetResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {targetResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectTargetUser(u)}
                  className="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-black text-[#005A36]">
                      Code: <span className="underline">{u.referral_code}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Name: {u.full_name || 'No Name'} • Phone: {u.phone}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {u.status} {u.is_premium && '• PREMIUM'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-filled Target Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Target User Name</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.full_name || '—'}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Phone Number</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.phone || '—'}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase">Target User Email</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.email || '—'}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#005A36]"
          />
        </div>
      </div>
    </div>
  );
}
