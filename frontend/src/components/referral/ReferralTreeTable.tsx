'use client';

import React, { useMemo } from 'react';
import { Users, Crown, Sparkles } from 'lucide-react';
import { DataTable, ColumnDef } from '../common/DataTable';
import { TreeMember } from '../../hooks/orchestrators/useReferralOrchestrator';
import { GlassCard } from '../design-system/GlassCard';

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
            <div className="font-black text-slate-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
              {m.full_name || m.phone}
            </div>
            <div className="text-[10px] text-slate-500  flex items-center space-x-1.5 mt-0.5 truncate">
              <span className="truncate">{m.phone}</span>
              <span className="text-emerald-700 font-bold shrink-0">• {m.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'badge_designation',
        header: 'Designation & Level',
        render: (m) => {
          const starsCount = m.designation?.stars || 0;
          return (
            <div className="flex flex-col space-y-0.5 min-w-0">
              <div className="inline-flex items-center space-x-1 text-xs font-black text-slate-800">
                <span className="truncate max-w-[100px] sm:max-w-[160px]">
                  {m.designation?.name || 'Standard Member'}
                </span>
              </div>
              {starsCount > 0 ? (
                <div className="flex items-center space-x-0.5 text-amber-500">
                  {Array.from({ length: Math.min(starsCount, 5) }).map((_, i) => (
                    <span key={i} className="text-[11px] leading-none">★</span>
                  ))}
                  {starsCount > 5 && (
                    <span className="text-[10px] font-black text-amber-600  ml-0.5">
                      +{starsCount - 5}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[9px] font-medium text-slate-400">No Level Badge</span>
              )}
            </div>
          );
        },
      },
      {
        key: 'account_type',
        header: 'Account Status',
        render: (m) =>
          m.is_premium ? (
            <span className="inline-flex items-center space-x-1 text-[11px] font-black text-amber-800 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full shadow-2xs">
              <Crown className="w-3 h-3 text-amber-600" />
              <span>VIP Member</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              <span>Standard</span>
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
                  <span className="inline-flex items-center space-x-1 text-[10px] font-black text-emerald-800 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                    <Users className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>{count} Downlines</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">—</span>
                )}
              </div>
              <div className="text-slate-400 text-[10px]  font-medium truncate">
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
    <GlassCard className="p-4 sm:p-6 space-y-4 specular-rim">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
          <Users className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="truncate">Team Members</span>
        </h2>
        <span className="text-xs  font-black text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-xs">
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
    </GlassCard>
  );
}
