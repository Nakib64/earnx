'use client';

import React from 'react';
import { User } from 'lucide-react';
import { UserSearchResult } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchaseReferrerSectionProps {
  packageType: 'ACTIVATION' | 'PREMIUM' | 'INVESTMENT';
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
    <div className="space-y-4 pt-4 border-t border-slate-200/80">
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
                className="text-xs text-purple-700 font-bold hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>Use Target&apos;s Sponsor</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSelectSelfAsReferrer}
              className="text-xs text-[#005A36] font-bold hover:underline cursor-pointer flex items-center space-x-1"
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
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
          />
          {searchingReferrer && (
            <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
              Searching...
            </span>
          )}

          {/* Referrer Dropdown Suggestions */}
          {showReferrerDropdown && referrerResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {referrerResults.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectReferrerUser(u)}
                  className="w-full text-left p-3 hover:bg-purple-50 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-black text-purple-800">
                      Code: <span className="underline">{u.referral_code}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Name: {u.full_name || 'No Name'} • Phone: {u.phone}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    {u.status} {u.is_premium && '• PREMIUM'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auto-filled Referrer Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-purple-50/60 p-4 rounded-xl border border-purple-100">
        <div>
          <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral User Name</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.full_name || '—'}
            className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral Phone Number</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.phone || '—'}
            className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-purple-700 uppercase">Referral Code</label>
          <input
            type="text"
            readOnly
            value={selectedReferrerUser?.referral_code || '—'}
            className="w-full bg-white border border-purple-200/80 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-purple-800"
          />
        </div>
      </div>
    </div>
  );
}
