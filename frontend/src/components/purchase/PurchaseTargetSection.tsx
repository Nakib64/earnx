'use client';

import React from 'react';
import { User, Search } from 'lucide-react';
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
            Target User ID <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={onSelectSelfAsTarget}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center space-x-1"
          >
            <User className="w-3.5 h-3.5" />
            <span>Use My Own ID</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Enter or search Target User ID (e.g. EX1001)..."
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
            className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
          {searchingTarget && (
            <span className="absolute right-4 top-3.5 text-xs text-emerald-600 font-medium animate-pulse">
              Searching...
            </span>
          )}

          {/* Target Dropdown Suggestions */}
          {showTargetDropdown && targetResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 specular-rim">
              {targetResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectTargetUser(u)}
                  className="w-full text-left p-3 hover:bg-emerald-50/70 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-black text-emerald-800">
                      Code: <span className="underline ">{u.referral_code}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Name: {u.full_name || 'No Name'} • Phone: {u.phone}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {u.status} {u.is_premium && '• VIP'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-filled Target Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target User Name</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.full_name || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Phone Number</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.phone || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs  font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target User Email</label>
          <input
            type="text"
            readOnly
            value={selectedTargetUser?.email || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs  font-bold text-emerald-800"
          />
        </div>
      </div>
    </div>
  );
}
