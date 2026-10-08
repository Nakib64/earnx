'use client';

import React from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PurchaseModalState } from '../../hooks/orchestrators/usePurchaseOrchestrator';

interface PurchaseModalProps {
  modalState: PurchaseModalState;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PurchaseModal({
  modalState,
  submitting,
  onClose,
  onConfirm,
}: PurchaseModalProps) {
  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          {modalState.type === 'CONFIRM' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#005A36] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          )}
          {(modalState.type === 'DUPLICATE_ERROR' || modalState.type === 'BALANCE_ERROR') && (
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {modalState.type === 'SUCCESS' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div>
            <h3 className="text-base font-black text-slate-900">{modalState.title}</h3>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          {modalState.message}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2">
          {modalState.type === 'CONFIRM' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onConfirm}
                className="px-5 py-2 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white text-xs font-black shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm & Buy'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              OK, Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
