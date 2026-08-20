'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, X } from 'lucide-react';
import { User } from '../../types';

interface AdjustWalletModalProps {
  user: User | null;
  isOpen: boolean;
  adjusting: boolean;
  onClose: () => void;
  onSubmit: (user: User, amount: number, type: 'ADD' | 'SUBTRACT', reason: string) => Promise<void> | void;
}

export function AdjustWalletModal({
  user,
  isOpen,
  adjusting,
  onClose,
  onSubmit,
}: AdjustWalletModalProps) {
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUBTRACT'>('ADD');

  useEffect(() => {
    if (isOpen) {
      setAdjustAmount('');
      setAdjustReason('');
      setAdjustType('ADD');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Math.abs(parseFloat(adjustAmount));
    if (isNaN(rawAmount) || rawAmount === 0) return;
    await onSubmit(user, rawAmount, adjustType, adjustReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-emerald-600">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">Adjust Wallet Balance</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Target Member: <strong>{user.full_name || user.phone}</strong> ({user.phone})
          <br />
          Current Wallet Balance:{' '}
          <span className="font-mono font-bold text-slate-800">
            ৳{Number(user.wallet_balance).toFixed(2)}
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Radio Buttons for Operation Type (+ / -) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Operation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                  adjustType === 'ADD'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="adjustTypeModal"
                  value="ADD"
                  checked={adjustType === 'ADD'}
                  onChange={() => setAdjustType('ADD')}
                  className="sr-only"
                />
                <span className="text-sm font-extrabold text-emerald-600">➕ Add (+)</span>
              </label>

              <label
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                  adjustType === 'SUBTRACT'
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="adjustTypeModal"
                  value="SUBTRACT"
                  checked={adjustType === 'SUBTRACT'}
                  onChange={() => setAdjustType('SUBTRACT')}
                  className="sr-only"
                />
                <span className="text-sm font-extrabold text-rose-600">➖ Subtract (-)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 500"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Audit Note
            </label>
            <input
              type="text"
              placeholder="e.g. Bonus reward or manual correction"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjusting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              {adjusting ? 'Updating...' : 'Execute Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
