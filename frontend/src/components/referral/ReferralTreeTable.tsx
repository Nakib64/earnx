'use client';

import React, { useMemo } from 'react';
import { Users, Crown } from 'lucide-react';
import { DataTable, ColumnDef } from '../common/DataTable';
import { TreeMember } from '../../hooks/orchestrators/useReferralOrchestrator';

interface ReferralTreeTableProps {
  displayMembers: TreeMember[];
  treeByParent: Map<string, TreeMember[]>;
  loading: boolean;
  searchTerm: string;
  currentParentName: string;
  isDrilledDown: boolean;
  onRowClick: (m: TreeMember) => void;
}

export function ReferralTreeTable({
  displayMembers,
  treeByParent,
  loading,
  searchTerm,
  currentParentName,
  isDrilledDown,
  onRowClick,
}: ReferralTreeTableProps) {
  const columns = useMemo<ColumnDef<TreeMember>[]>(
    () => [
      {
        key: 'member_ref',
        header: 'Member',
        render: (m) => (
          <div className="min-w-0">
            <div className="font-black text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-[180px]">
              {m.full_name || m.phone}
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5 truncate">
              <span className="truncate">{m.phone}</span>
              <span className="text-[#01281a] font-bold shrink-0">• {m.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'badge_designation',
        header: 'Designation & Badge',
        render: (m) => {
          const starsCount = m.designation?.stars || 0;
          return (
            <div className="flex flex-col space-y-0.5 min-w-0">
              <div className="inline-flex items-center space-x-1 text-[9.5px] font-black text-slate-900">
                <span className="truncate max-w-[100px] sm:max-w-[140px]">
                  {m.designation?.name || 'Unbadged Member'}
                </span>
              </div>
              {starsCount > 0 ? (
                <div className="flex items-center space-x-0.5 text-amber-500">
                  {Array.from({ length: Math.min(starsCount, 5) }).map((_, i) => (
                    <span key={i} className="text-[10px] leading-none">★</span>
                  ))}
                  {starsCount > 5 && (
                    <span className="text-[9px] font-black text-amber-600 font-mono ml-0.5">
                      +{starsCount - 5}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[8.5px] font-bold text-slate-400">No Stars</span>
              )}
            </div>
          );
        },
      },
      {
        key: 'account_type',
        header: 'Account Type',
        render: (m) =>
          m.is_premium ? (
            <span className="inline-flex items-center space-x-1 text-[10px] font-black text-amber-300 bg-[#023322] border border-amber-500/40 px-2.5 py-1 rounded-full shadow-sm">
              <Crown className="w-3 h-3 text-[#f3ba2f]" />
              <span>Premium Member</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              <span>Standard Member</span>
            </span>
          ),
      },
      {
        key: 'referrals_joined',
        header: 'Downlines & Joined',
        align: 'right',
        render: (m) => {
          const count = treeByParent.get(m.id)?.length ?? 0;
          const hasChildren = count > 0;

          return (
            <div className="text-right space-y-0.5 min-w-0">
              <div>
                {hasChildren ? (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-black text-[#01281a] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg shrink-0">
                    <Users className="w-3 h-3 text-[#01281a] shrink-0" />
                    <span>{count} Downlines</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400">—</span>
                )}
              </div>
              <div className="text-slate-400 text-[9px] font-mono font-semibold truncate">
                {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
              </div>
            </div>
          );
        },
      },
    ],
    [treeByParent],
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
          <Users className="w-5 h-5 text-[#01281a] shrink-0" />
          <span className="truncate">Department members</span>
        </h2>
        <span className="text-xs font-mono font-black text-amber-200 bg-[#01281a] px-3 py-1 rounded-xl border border-[#d4af37]/40 shadow-sm">
          {displayMembers.length} Members
        </span>
      </div>

      <DataTable<TreeMember>
        data={displayMembers}
        columns={columns}
        keyExtractor={(m) => m.id}
        loading={loading}
        onRowClick={onRowClick}
        emptyMessage={
          searchTerm.trim()
            ? `No members found matching "${searchTerm.trim()}".`
            : isDrilledDown
              ? `${currentParentName} has no direct referrals yet.`
              : 'You have no downline members yet. Share your referral code to get started.'
        }
      />
    </div>
  );
}
