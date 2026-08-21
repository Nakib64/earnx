'use client';

import React from 'react';
import {
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  FileText,
  User as UserIcon,
  Phone as PhoneIcon,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { RecipientSuggestion } from '../../hooks/useWalletPage';

interface WalletTransferModalProps {
  currentBal: number;
  targetReferralCode: string;
  setTargetReferralCode: (code: string) => void;
  recipientName: string;
  recipientPhone: string;
  transferAmount: string;
  setTransferAmount: (amt: string) => void;
  transferNote: string;
  setTransferNote: (note: string) => void;
  suggestions: RecipientSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchingRecipient: boolean;
  verifiedRecipient: RecipientSuggestion | null;
  recipientError: string | null;
  submittingTransfer: boolean;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSelectRecipient: (recipient: RecipientSuggestion) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function WalletTransferModal({
  currentBal,
  targetReferralCode,
  setTargetReferralCode,
  recipientName,
  recipientPhone,
  transferAmount,
  setTransferAmount,
  transferNote,
  setTransferNote,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  searchingRecipient,
  verifiedRecipient,
  recipientError,
  submittingTransfer,
  dropdownRef,
  onSelectRecipient,
  onSubmit,
  onCancel,
}: WalletTransferModalProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-slate-900 text-base flex items-center space-x-2 truncate">
          <ArrowRightLeft className="w-5 h-5 text-[#005A36] shrink-0" />
          <span className="truncate">Direct Network Balance Transfer</span>
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 1. Target User Code / Phone Search Field */}
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Recipient User Code / Phone <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Search User Code (e.g. EX0001) or Phone..."
              value={targetReferralCode}
              onChange={(e) => {
                setTargetReferralCode(e.target.value);
                if (verifiedRecipient && e.target.value.trim().toLowerCase() !== verifiedRecipient.referral_code.toLowerCase()) {
                  // User is changing query
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0 && !verifiedRecipient) setShowSuggestions(true);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
            />
            {searchingRecipient && (
              <span className="absolute right-3.5 top-3 text-xs text-slate-400 animate-pulse">
                Searching...
              </span>
            )}

            {/* Target Dropdown Suggestions (Same style as /dashboard/purchase) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRecipient(item)}
                    className="w-full text-left p-3 hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {item.full_name || 'No Name'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Phone: {item.phone} • Code: <span className="font-bold text-[#005A36]">{item.referral_code}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {item.referral_code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error / Blocked Status */}
          {recipientError && !verifiedRecipient && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{recipientError}</span>
            </div>
          )}
        </div>

        {/* 2. Auto-filled Target Details (Same 3-grid as /dashboard/purchase) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target User Name</label>
            <input
              type="text"
              readOnly
              value={recipientName || '—'}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Phone Number</label>
            <input
              type="text"
              readOnly
              value={recipientPhone || '—'}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target User Code</label>
            <input
              type="text"
              readOnly
              value={verifiedRecipient?.referral_code || '—'}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#005A36] focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* 3. Transfer Amount & Note Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Transfer Amount (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={currentBal}
              required
              placeholder="Enter amount..."
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-mono">Available Balance: ৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Transfer Note (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Reference note (optional)..."
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005A36]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={
            submittingTransfer ||
            !verifiedRecipient ||
            !transferAmount ||
            parseFloat(transferAmount) <= 0 ||
            parseFloat(transferAmount) > currentBal
          }
          className="w-full py-3.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{submittingTransfer ? 'Sending Transfer...' : 'Confirm & Direct Send'}</span>
        </button>
      </form>
    </div>
  );
}
