'use client';

import React from 'react';
import { Inbox, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { CoinTransfer } from '../../types';
import { GlassCard, GlassButton, NumericAmount, ShimmerSkeleton } from '../design-system';

interface CoinIncomingTransfersProps {
  pendingTransfers: CoinTransfer[];
  loadingTransfers: boolean;
  approvingId: string | null;
  rejectingId: string | null;
  onRefresh: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function CoinIncomingTransfers({
  pendingTransfers,
  loadingTransfers,
  approvingId,
  rejectingId,
  onRefresh,
  onApprove,
  onReject,
}: CoinIncomingTransfersProps) {
  return (
    <GlassCard variant="standard" className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shadow-2xs">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 ">Incoming Coin Transfers</h3>
            <p className="text-xs font-semibold text-slate-500">
              Review and accept Solana transfers held in escrow
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loadingTransfers ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loadingTransfers ? (
        <div className="py-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : pendingTransfers.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">No pending transfers awaiting approval</p>
          <p className="text-xs text-slate-400 font-medium">
            When another member initiates a transfer to your account, it will appear here in escrow.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTransfers.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 border border-white/95 rounded-2xl p-5 space-y-4 shadow-sm specular-rim"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">
                    Sender: {item.sender?.full_name || 'Member'}
                  </p>
                  <p className="text-[11px]  text-slate-500">
                    {item.sender?.phone || item.sender?.email || item.sender?.referral_code}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  Escrow Pending
                </span>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Coins</span>
                  <p className=" font-black text-slate-900 text-sm tabular-nums">
                    {Number(item.coin_amount)} SOL
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rate</span>
                  <p className=" font-black text-emerald-700 text-sm tabular-nums">
                    ৳{Number(item.coin_rate)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Valuation</span>
                  <div className="text-sm">
                    <NumericAmount value={Number(item.total_bdt_value)} size="sm" semantic="gain" />
                  </div>
                </div>
              </div>

              {item.note && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 italic font-medium">
                  &quot;{item.note}&quot;
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <GlassButton
                  onClick={() => onApprove(item.id)}
                  isLoading={approvingId === item.id}
                  disabled={approvingId === item.id || rejectingId === item.id}
                  variant="primary"
                  className="flex-1"
                  size="md"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Accept Transfer
                </GlassButton>
                <GlassButton
                  onClick={() => onReject(item.id)}
                  isLoading={rejectingId === item.id}
                  disabled={approvingId === item.id || rejectingId === item.id}
                  variant="danger"
                  size="md"
                >
                  Reject
                </GlassButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
