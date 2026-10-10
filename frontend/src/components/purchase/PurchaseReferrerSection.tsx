'use client';

import React from 'react';
import { User } from 'lucide-react';
import { UserSearchResult } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchaseReferrerSectionProps {
  packageType: 'PREMIUM' | 'INVESTMENT';
  selectedTargetUser: UserSearchResult | null;
  referrerQuery: string;
  setReferrerQuery: (val: string) => void;
  referrerResults: UserSearchResult[];
  searchingReferrer: boolean;
  selectedReferrerUser: UserSearchResult | null;
  setSelectedReferrerUser: (u: UserSearchResult | null) => void;
  showReferrerDropdown: boolean;
  setShowReferrerDropdown: (show: boolean) => void;
  onSelectReferrerUser: (u: UserSearchResult) => void;
  onSelectSelfAsReferrer: () => void;
  onSelectTargetSponsorAsReferrer: () => void;
}

export function PurchaseReferrerSection({
  packageType,
  selectedTargetUser,
  referrerQuery,
  setReferrerQuery,
  referrerResults,
  searchingReferrer,
  selectedReferrerUser,
  setSelectedReferrerUser,
  showReferrerDropdown,
  setShowReferrerDropdown,
  onSelectReferrerUser,
  onSelectSelfAsReferrer,
  onSelectTargetSponsorAsReferrer,
}: PurchaseReferrerSectionProps) {
  if (packageType !== 'PREMIUM') return null;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200/60">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Referral / Sponsor Code <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center space-x-3 text-xs font-bold">
            {selectedTargetUser?.referred_by && (
              <button
                type="button"
                onClick={onSelectTargetSponsorAsReferrer}
                className="text-xs text-teal-700 hover:text-teal-800 font-bold hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>Use Target&apos;s Sponsor</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSelectSelfAsReferrer}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Use My Own Code</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Enter or search Referral / Sponsor Code (e.g. EX1001)..."
            value={referrerQuery}
            onChange={(e) => {
              setReferrerQuery(e.target.value);
              if (
                selectedReferrerUser &&
                e.target.value.trim().toLowerCase() !== selectedReferrerUser.referral_code.toLowerCase()
              ) {
                setSelectedReferrerUser(null);
              }
            }}
            onFocus={() => referrerResults.length > 0 && !selectedReferrerUser && setShowReferrerDropdown(true)}
            className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
          {searchingReferrer && (
            <span className="absolute right-4 top-3.5 text-xs text-emerald-600 font-medium animate-pulse">
              Searching...
            </span>
          )}

          {/* Referrer Dropdown Suggestions */}
          {showReferrerDropdown && referrerResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 specular-rim">
              {referrerResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectReferrerUser(u)}
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

      {/* Auto-filled Referrer Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referral User Name</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.full_name || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referral Phone Number</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.phone || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs  font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referral Code</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.referral_code || '—'}
            className="w-full bg-white/80 border border-slate-200/70 rounded-xl px-3 py-2 text-xs  font-bold text-emerald-800"
          />
        </div>
      </div>
    </div>
  );
}
