'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { WalletTransaction } from '../../types';

interface WalletAuditTableProps {
  transactions: WalletTransaction[];
  loading: boolean;
  auditFilter: 'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW';
  onFilterChange: (filter: 'ALL' | 'BALANCE_TRANSFER' | 'WITHDRAW') => void;
}

export function WalletAuditTable({
  transactions,
  loading,
  auditFilter,
  onFilterChange,
}: WalletAuditTableProps) {
  const columns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="flex items-center space-x-2 min-w-0">
            <StatusBadge status={tx.type} />
            <span
              className={`font-mono font-extrabold text-[11px] truncate ${
                isCredit ? 'text-[#005A36]' : 'text-rose-700'
              }`}
            >
              {isCredit ? '+' : ''}৳{Number(tx.amount).toFixed(2)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'balance',
      header: 'Before → After',
      render: (tx) => (
        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate block max-w-[130px]">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description_date',
      header: 'Note & Date',
      align: 'right',
      render: (tx) => (
        <div className="text-right min-w-0">
          <div className="text-slate-700 text-[10px] font-semibold truncate max-w-[140px] sm:max-w-[240px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[9px] font-mono truncate">
            {new Date(tx.created_at).toLocaleString()}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <h3 className="font-extrabold text-slate-900 text-base truncate">Audit History</h3>
        </div>

        {/* Audit History Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              auditFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Logs
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('BALANCE_TRANSFER')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              auditFilter === 'BALANCE_TRANSFER'
                ? 'bg-[#005A36] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Direct Transfers
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('WITHDRAW')}
            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              auditFilter === 'WITHDRAW'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      <DataTable<WalletTransaction>
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        loading={loading}
      />
    </div>
  );
}
