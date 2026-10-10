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
  X,
} from 'lucide-react';
import { RecipientSuggestion } from '../../hooks/useWalletPage';
import { GlassCard, GlassButton, NumericAmount } from '../design-system';

interface WalletTransferModalProps {
  currentBal: number;
  targetReferralCode: string;
  setTargetReferralCode: (code: string) => void;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
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
  recipientEmail,
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
    <GlassCard variant="standard" className="p-5 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-black text-slate-900 text-base flex items-center space-x-2 truncate">
          <ArrowRightLeft className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="truncate">Network Balance Transfer</span>
        </h3>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 1. Target User Code Search Field */}
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            Recipient User Code <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Enter or search Recipient User Code (e.g. EX1001)..."
              value={targetReferralCode}
              onChange={(e) => setTargetReferralCode(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0 && !verifiedRecipient) setShowSuggestions(true);
              }}
              className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs"
            />
            {searchingRecipient && (
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 animate-pulse font-medium">
                Searching...
              </span>
            )}

            {/* Target Dropdown Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-xl border border-white/95 rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 specular-rim">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRecipient(item)}
                    className="w-full text-left p-3 hover:bg-emerald-50/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-black text-emerald-800">
                        Code: <span className="underline">{item.referral_code}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Name: {item.full_name || 'Member'} • Phone: {item.phone}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 ">
                      {item.status}
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

        {/* 2. Auto-filled Target Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/60 p-4 rounded-2xl border border-slate-200/80 specular-rim">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Name</label>
            <input
              type="text"
              readOnly
              value={recipientName || '—'}
              className="w-full bg-slate-100/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Phone</label>
            <input
              type="text"
              readOnly
              value={recipientPhone || '—'}
              className="w-full bg-slate-100/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs  font-bold text-slate-800 cursor-not-allowed tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Email</label>
            <input
              type="text"
              readOnly
              value={verifiedRecipient?.email || recipientEmail || '—'}
              className="w-full bg-slate-100/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs  font-bold text-emerald-800 cursor-not-allowed"
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
              className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500  shadow-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1 ">
              Available: ৳{currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
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
              className="w-full bg-white/70 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={submittingTransfer}
          disabled={
            submittingTransfer ||
            !verifiedRecipient ||
            !transferAmount ||
            parseFloat(transferAmount) <= 0 ||
            parseFloat(transferAmount) > currentBal
          }
          icon={<CheckCircle2 className="w-4.5 h-4.5" />}
        >
          Send Balance
        </GlassButton>
      </form>
    </GlassCard>
  );
}
