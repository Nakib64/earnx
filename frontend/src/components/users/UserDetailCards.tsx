'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, WalletTransaction, UserStatus } from '../../types';
import { apiFetch } from '../../lib/api';
import { DataTable, ColumnDef } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Wallet, Award, DollarSign, Trash2, Shield, RefreshCw, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface UserDetailCardsProps {
  user: User | null;
  onAdjustBalance: (user: User) => void;
  onAssignBadge: (user: User) => void;
  onToggleStatus: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  onDeleteUser: (user: User) => void;
}

export function UserDetailCards({
  user,
  onAdjustBalance,
  onAssignBadge,
  onToggleStatus,
  onDeleteUser,
}: UserDetailCardsProps) {
  // Direct Downlines Data
  const [downlines, setDownlines] = useState<User[]>([]);
  const [loadingDownlines, setLoadingDownlines] = useState(false);

  // Transactions Data & Pagination
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTotalRecords, setTxTotalRecords] = useState(0);

  const fetchTransactions = useCallback(async (pageToFetch = 1) => {
    if (!user) return;
    setLoadingTx(true);
    const resTx = await apiFetch<any>(
      `/admin/wallet/transactions?user_id=${user.id}&page=${pageToFetch}&limit=10`,
      { isAdmin: true },
    );
    if (resTx.success && resTx.data) {
      const dataArr = resTx.data.data || (Array.isArray(resTx.data) ? resTx.data : []);
      const meta = resTx.data.meta || {};
      setTransactions(dataArr);
      setTxPage(meta.page || pageToFetch);
      setTxTotalPages(meta.totalPages || 1);
      setTxTotalRecords(meta.total || dataArr.length);
    } else {
      setTransactions([]);
      setTxTotalPages(1);
      setTxTotalRecords(0);
    }
    setLoadingTx(false);
  }, [user]);

  const fetchUserData = useCallback(async () => {
    if (!user) return;

    // Fetch Direct Downlines
    setLoadingDownlines(true);
    const resDownlines = await apiFetch<any>(`/admin/users?referred_by_id=${user.id}&limit=100`, { isAdmin: true });
    if (resDownlines.success && resDownlines.data) {
      setDownlines(resDownlines.data.data || (Array.isArray(resDownlines.data) ? resDownlines.data : []));
    } else {
      setDownlines([]);
    }
    setLoadingDownlines(false);

    // Reset and Fetch Page 1 Transactions
    setTxPage(1);
    fetchTransactions(1);
  }, [user, fetchTransactions]);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  if (!user) return null;

  const transactionColumns: ColumnDef<WalletTransaction>[] = [
    {
      key: 'type_amount',
      header: 'Type & Amount',
      render: (tx) => {
        const isCredit = Number(tx.amount) > 0;
        return (
          <div className="flex items-center space-x-2">
            <StatusBadge status={tx.type} />
            <span className={`font-mono font-black text-xs ${isCredit ? 'text-[#005A36]' : 'text-rose-600'}`}>
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
        <span className="font-mono text-[10px] text-slate-500 font-extrabold truncate block max-w-[140px]">
          ৳{Number(tx.balance_before).toFixed(2)} → ৳{Number(tx.balance_after).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description_date',
      header: 'Note & Date',
      align: 'right',
      render: (tx) => (
        <div className="text-right">
          <div className="text-slate-800 text-[10px] font-bold truncate max-w-[160px] sm:max-w-[220px] ml-auto">
            {tx.description || '-'}
          </div>
          <div className="text-slate-400 text-[9px] font-mono">{new Date(tx.created_at).toLocaleString()}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#005A36] flex items-center justify-center text-secondary font-black text-sm shrink-0 shadow-xs">
            {user.designation?.stars ? `${user.designation.stars}★` : 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {user.full_name || 'Member Details'}
              </h2>
              <StatusBadge status={user.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Phone: <strong className="text-slate-900">{user.phone}</strong> · Ref: <strong className="text-primary">{user.referral_code}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchUserData}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-xs font-extrabold flex items-center space-x-1.5 self-start sm:self-auto border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Details</span>
        </button>
      </div>

      {/* Cards Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-4 space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Designation & Badge</div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-black text-primary truncate">
              {user.designation?.name || 'Unbadged Member'}
            </span>
          </div>
          {user.designation && (
            <div className="text-[11px] text-slate-600 font-mono font-bold">
              Stars: {user.designation.stars}★ · Max Level Depth: {user.designation.max_level}
            </div>
          )}
        </div>

        {/* Sponsor & Downlines Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Hierarchy & Downlines</div>
          <div className="text-xs font-extrabold text-slate-800 truncate">
            Sponsor: {user.referred_by ? `${user.referred_by.phone} (${user.referred_by.full_name || 'Member'})` : 'Top of Tree'}
          </div>
          <div className="text-[11px] text-primary font-extrabold flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>Direct Downlines: {downlines.length} Members</span>
          </div>
        </div>

        {/* Wallet Balance & Operations Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Wallet Balance</div>
            <div className="text-xl font-black text-[#005A36] font-mono mt-0.5">
              ৳{Number(user.wallet_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Direct Operation Actions */}
          <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-200/80">
            <button
              onClick={() => onAdjustBalance(user)}
              className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-extrabold text-[10px] flex items-center space-x-1 transition-colors border border-slate-200"
            >
              <DollarSign className="w-3 h-3 text-slate-500" />
              <span>Adjust</span>
            </button>

            <button
              onClick={() => onAssignBadge(user)}
              className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-extrabold text-[10px] transition-colors border border-slate-200"
            >
              Badge
            </button>

            {user.status === UserStatus.DISABLED && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
                className="py-1 px-2.5 bg-[#005A36] text-white hover:bg-[#044D2F] rounded-lg font-extrabold text-[10px] transition-colors"
              >
                Activate
              </button>
            )}

            {user.status === UserStatus.ACTIVE && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.BLOCKED)}
                className="py-1 px-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg font-extrabold text-[10px] transition-colors border border-slate-200"
              >
                Block
              </button>
            )}

            {user.status === UserStatus.BLOCKED && (
              <button
                onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
                className="py-1 px-2.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg font-extrabold text-[10px] transition-colors border border-slate-200"
              >
                Unblock
              </button>
            )}

            <button
              onClick={() => onDeleteUser(user)}
              className="py-1 px-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-extrabold text-[10px] transition-colors border border-rose-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Transaction History Log
              </h3>
              <p className="text-[10px] font-medium text-slate-400">Recorded wallet activity ({txTotalRecords} entries)</p>
            </div>
          </div>
          {txTotalPages > 1 && (
            <span className="text-[10px] font-extrabold text-primary bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
              Page {txPage} of {txTotalPages}
            </span>
          )}
        </div>

        {/* Styled Table Wrapper */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <DataTable<WalletTransaction>
            data={transactions}
            columns={transactionColumns}
            keyExtractor={(tx) => tx.id}
            loading={loadingTx}
            emptyMessage={`No transaction history recorded for ${user.full_name || user.phone} yet.`}
          />
        </div>

        {/* Pagination Footer Controls */}
        {txTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs bg-slate-50 border border-slate-200 rounded-xl p-3">
            <button
              onClick={() => {
                const newPage = Math.max(1, txPage - 1);
                fetchTransactions(newPage);
              }}
              disabled={txPage <= 1 || loadingTx}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-600 text-[11px] font-extrabold hidden sm:inline">
              Page <strong>{txPage}</strong> of <strong>{txTotalPages}</strong> ({txTotalRecords} total transactions)
            </span>

            <button
              onClick={() => {
                const newPage = Math.min(txTotalPages, txPage + 1);
                fetchTransactions(newPage);
              }}
              disabled={txPage >= txTotalPages || loadingTx}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
