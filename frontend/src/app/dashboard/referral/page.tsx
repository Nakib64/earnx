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
      !!member.designation &&
      currentDepth < maxLevel &&
      treeByParent.has(member.id),
    [currentDepth, maxLevel, treeByParent],
  );

  const handleRowClick = useCallback(
    (member: TreeMember) => {
      if (!canDrillDown(member)) return;
      setBreadcrumbs((prev) => [
        ...prev,
        { id: member.id, name: member.full_name || member.phone || 'Member' },
      ]);
      setSearchTerm('');
    },
    [canDrillDown],
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
        header: 'Member & Ref',
        render: (m) => (
          <div className="min-w-0">
            <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] truncate max-w-[120px] sm:max-w-[180px]">
              {m.full_name || m.phone}
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5 truncate">
              <span className="truncate">{m.phone}</span>
              <span className="text-primary font-bold shrink-0">• {m.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'badge_status',
        header: 'Badge & Status',
        render: (m) => (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 min-w-0">
            {m.designation ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 text-[#854D0E] font-extrabold text-[8px] sm:text-[9px] border border-amber-200 shrink-0">
                <Award className="w-2.5 h-2.5 mr-0.5 text-[#854D0E] shrink-0" />
                <span className="truncate max-w-[70px]">{m.designation.name}</span>
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 font-medium shrink-0">Member</span>
            )}
            <StatusBadge status={(m.status as any) ?? 'DISABLED'} />
          </div>
        ),
      },
      {
        key: 'referrals_joined',
        header: 'Downlines & Joined',
        align: 'right',
        render: (m) => {
          const count = treeByParent.get(m.id)?.length ?? 0;
          const drillable = canDrillDown(m);
          const depthLocked = !!m.designation && currentDepth >= maxLevel && treeByParent.has(m.id);

          return (
            <div className="text-right space-y-0.5 min-w-0">
              <div>
                {count === 0 ? (
                  <span className="text-[9px] text-slate-400">—</span>
                ) : depthLocked ? (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0" title={`Requires higher badge to view beyond Level ${maxLevel}`}>
                    <span>🔒</span>
                    <span>{count}</span>
                  </span>
                ) : drillable ? (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-primary bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                    <Users className="w-3 h-3 text-primary shrink-0" />
                    <span>{count}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                    <Users className="w-3 h-3 shrink-0" />
                    <span>{count}</span>
                  </span>
                )}
              </div>
              <div className="text-slate-400 text-[9px] font-mono truncate">
                {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
              </div>
            </div>
          );
        },
      },
    ],
    [treeByParent, canDrillDown, currentDepth, maxLevel],
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Card 1: Referral Code */}
        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Referral Code
          </span>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center text-primary shrink-0">
              <Network className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight truncate">
                {user?.referral_code || '---'}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-primary truncate">Your Code</div>
            </div>
          </div>

          <button
            onClick={copyCode}
            className="w-full bg-emerald-100/60 hover:bg-emerald-100 text-primary font-extrabold text-xs py-2 px-3 rounded-xl flex items-center justify-between transition-colors mt-1 cursor-pointer"
          >
            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-primary" />}
          </button>
        </div>

        {/* Card 2: Earning Designation */}
        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-sm min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
             Designation
          </span>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shrink-0">
              <Award className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-xl font-black text-[#854D0E] truncate">
                {user?.designation?.name || 'Member'}
              </div>
              <div className="text-xs font-extrabold text-amber-800/80 truncate">
                Level {maxLevel}
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center space-x-1 text-xs font-bold text-[#854D0E] truncate">
            <span className="truncate">Unlocks multi-level commissions</span>
          </div>
        </div>

        {/* Card 3: Total Downline Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 col-span-2 lg:col-span-1 flex flex-col justify-between min-w-0">
          <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest truncate">
            Total Network Downlines
          </span>

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Users className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight truncate">
                {allMembers.length}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-500 truncate">Total Team Members</div>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-slate-400 truncate">Multi-level referral network</span>
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
          placeholder="Search member by name, phone, or referral code..."
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center space-x-2 truncate">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">Referral Network Tree</span>
          </h2>
          <span className="text-xs font-mono font-extrabold text-primary bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80">
            {displayMembers.length} Members
          </span>
        </div>

        <DataTable<TreeMember>
          data={displayMembers}
          columns={columns}
          keyExtractor={(m) => m.id}
          loading={loading}
          onRowClick={(m) => canDrillDown(m) ? handleRowClick(m) : undefined}
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
