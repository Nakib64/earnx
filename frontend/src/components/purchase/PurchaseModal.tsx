'use client';

import React from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PurchaseModalState } from '../../hooks/orchestrators/usePurchaseOrchestrator';
import { GlassButton } from '../design-system/GlassButton';

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
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 specular-rim">
        <div className="flex items-center space-x-3.5">
          {modalState.type === 'CONFIRM' && (
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          )}
          {(modalState.type === 'DUPLICATE_ERROR' || modalState.type === 'BALANCE_ERROR') && (
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          {modalState.type === 'SUCCESS' && (
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div>
            <h3 className="text-base font-black text-slate-900 ">{modalState.title}</h3>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
          {modalState.message}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200/60">
          {modalState.type === 'CONFIRM' ? (
            <>
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="button"
                variant="primary"
                size="md"
                disabled={submitting}
                onClick={onConfirm}
              >
                {submitting ? 'Processing...' : 'Buy'}
              </GlassButton>
            </>
          ) : (
            <GlassButton
              type="button"
              variant="primary"
              size="md"
              onClick={onClose}
            >
              OK, Got it
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}
