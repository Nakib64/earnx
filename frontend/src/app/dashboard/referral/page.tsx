'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { UserBreadcrumbs, BreadcrumbItem } from '../../../components/users/UserBreadcrumbs';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, X, Users, Award, Network, Copy, Check, ChevronRight } from 'lucide-react';

// Minimal shape returned by /users/tree
interface TreeMember {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  status?: string;
  created_at?: string;
  referred_by_id?: string | null;
  designation?: { name: string; stars?: number } | null;
}

function ReferralContent() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // The logged-in user's max earning depth (how many levels they can drill into)
  const maxLevel = user?.designation?.max_level ?? 1;

  // All downline members keyed by their parent id for fast lookup
  const [treeByParent, setTreeByParent] = useState<Map<string, TreeMember[]>>(new Map());
  // Flat list of every member (for search)
  const [allMembers, setAllMembers] = useState<TreeMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Breadcrumb: starts at logged-in user
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'My Direct Referrals' },
  ]);
  const currentParent = breadcrumbs[breadcrumbs.length - 1];

  const fetchTree = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await apiFetch<any>('/users/tree?depth=10');
    if (res.success && res.data?.tree) {
      const tree: Record<string, TreeMember[]> = res.data.tree;

      const byParent = new Map<string, TreeMember[]>();
      const flat: TreeMember[] = [];

      Object.values(tree).forEach((level: TreeMember[]) => {
        level.forEach((member) => {
          flat.push(member);
          const pid = member.referred_by_id ?? user.id;
          if (!byParent.has(pid)) byParent.set(pid, []);
          byParent.get(pid)!.push(member);
        });
      });

      if (!byParent.has(user.id) && tree[1]?.length) {
        byParent.set(user.id, tree[1]);
      }

      setTreeByParent(byParent);
      setAllMembers(flat);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Sync root breadcrumb once user loads
  useEffect(() => {
    if (user) {
      setBreadcrumbs([{ id: user.id, name: 'My Direct Referrals' }]);
    }
  }, [user?.id]);

  // Current drill depth = number of breadcrumbs beyond root (breadcrumbs[0] = root)
  const currentDepth = breadcrumbs.length - 1;

  const canDrillDown = useCallback(
    (member: TreeMember) =>
      treeByParent.has(member.id) && treeByParent.get(member.id)!.length > 0,
    [treeByParent],
  );

  const handleRowClick = useCallback(
    (member: TreeMember) => {
      setBreadcrumbs((prev) => [
        ...prev,
        { id: member.id, name: member.full_name || member.phone || 'Member' },
      ]);
      setSearchTerm('');
    },
    [],
  );

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchTerm('');
  }, []);

  const copyCode = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Members to display — either search results or current level children
  const displayMembers = useMemo<TreeMember[]>(() => {
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      return allMembers.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q) ||
          m.referral_code?.toLowerCase().includes(q),
      );
    }
    return treeByParent.get(currentParent.id ?? (user?.id ?? '')) ?? [];
  }, [debouncedSearch, allMembers, treeByParent, currentParent.id, user?.id]);

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
        key: 'status',
        header: 'Status',
        render: (m) => <StatusBadge status={(m.status as any) ?? 'DISABLED'} />,
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    

        {/* Card 2: Earning Designation */}
        <div className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg text-white min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest truncate">
              Designation
            </span>
            <div className="w-9 h-9 rounded-xl border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="text-lg sm:text-xl font-black text-amber-100 truncate">
              {user?.designation?.name || 'Member'}
            </div>
            <div className="text-xs font-bold text-amber-300 truncate">
              Max Unlocked Level: {maxLevel}
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-amber-300/80 truncate">
            <span className="truncate">Unlocks multi-level commissions</span>
          </div>
        </div>

        {/* Card 3: Total Downline Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
              Total Network Downlines
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {allMembers.length}
            </div>
            <div className="text-xs font-bold text-slate-500">Total Team Members</div>
          </div>

          <div className="pt-1 text-xs font-bold text-slate-400 truncate">
            Multi-level referral network
          </div>
        </div>
      </div>

      {/* Breadcrumb Trail Card */}
      {(allMembers.length > 0 || breadcrumbs.length > 1) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />
        </div>
      )}

      {/* Search Bar Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id="referral-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member by name, phone, or user code..."
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Referral Tree Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2 truncate">
            <Users className="w-5 h-5 text-[#01281a] shrink-0" />
            <span className="truncate">Referral Network Tree</span>
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
          onRowClick={(m) => handleRowClick(m)}
          emptyMessage={
            debouncedSearch.trim()
              ? `No members found matching "${debouncedSearch.trim()}".`
              : breadcrumbs.length > 1
                ? `${currentParent.name} has no direct referrals yet.`
                : 'You have no downline members yet. Share your referral code to get started.'
          }
        />
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading referral tree...</div>}>
      <ReferralContent />
    </Suspense>
  );
}
