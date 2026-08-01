'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { UserBreadcrumbs, BreadcrumbItem } from '../../../components/users/UserBreadcrumbs';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, X, Users, Award, RefreshCw } from 'lucide-react';

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

      // Build a map: parentId → children
      // Level 1 children belong to the logged-in user
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

      // Level 1 members don't always have referred_by_id set correctly in tree response.
      // If the map has nothing under user.id, put level-1 under user.id explicitly.
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

  // A member can be drilled into only if:
  //   1. They have a designation badge
  //   2. We haven't yet reached maxLevel depth
  //   3. They actually have children in the tree
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
        key: 'member',
        header: 'Member',
        render: (m) => (
          <div>
            <div className="font-bold text-slate-900 text-xs sm:text-sm">
              {m.full_name || m.phone}
            </div>
            <div className="text-[9px] sm:text-[11px] text-slate-500 font-mono">{m.phone}</div>
          </div>
        ),
      },
      {
        key: 'referral_code',
        header: 'Referral Code',
        render: (m) => (
          <span className="font-mono font-bold text-sky-600 text-xs sm:text-sm">{m.referral_code}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (m) => <StatusBadge status={(m.status as any) ?? 'DISABLED'} />,
      },
      {
        key: 'designation',
        header: 'Badge',
        render: (m) =>
          m.designation ? (
            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[9px] sm:text-[11px] border border-purple-200 whitespace-nowrap">
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1 text-purple-500" />
              {m.designation.name}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">No badge</span>
          ),
      },
      {
        key: 'referrals',
        header: 'Referrals',
        align: 'right',
        render: (m) => {
          const count = treeByParent.get(m.id)?.length ?? 0;
          const drillable = canDrillDown(m);
          const depthLocked = !!m.designation && currentDepth >= maxLevel && treeByParent.has(m.id);

          if (count === 0) return <span className="text-[10px] text-slate-400">—</span>;

          if (depthLocked) {
            // Has children but we've hit max_level — show locked indicator
            return (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg" title={`Requires higher badge to view beyond Level ${maxLevel}`}>
                <span>🔒</span>
                <span>{count}</span>
              </span>
            );
          }

          if (drillable) {
            return (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                <Users className="w-3 h-3" />
                <span>{count}</span>
              </span>
            );
          }

          // Has children but no designation — can't drill
          return (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg" title="Member needs a badge to drill down">
              <Users className="w-3 h-3" />
              <span>{count}</span>
            </span>
          );
        },
      },
      {
        key: 'joined',
        header: 'Joined',
        align: 'right',
        render: (m) => (
          <span className="text-slate-400 text-[10px] sm:text-xs">
            {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
          </span>
        ),
      },
    ],
    [treeByParent, canDrillDown, currentDepth, maxLevel],
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Referral Tree Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Click a <strong>badged member</strong> row to drill into their direct referrals (up to Level {maxLevel} of your badge).
          </p>
        </div>
        <button
          onClick={() => {
            fetchTree();
          }}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors self-start flex items-center space-x-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Your Referral Code</span>
          <div className="text-lg font-mono font-extrabold text-sky-600 mt-1">{user?.referral_code}</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase">Earning Badge</span>
          <div className="text-sm font-extrabold text-slate-800 mt-1 flex items-center justify-center space-x-1">
            <Award className="w-4 h-4 text-purple-600" />
            <span>{user?.designation?.name || 'Starter Member'}</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center bg-white border border-slate-200 col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Downlines</span>
          <div className="text-lg font-extrabold text-indigo-600 mt-1 flex items-center justify-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{allMembers.length}</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb Trail */}
      <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id="referral-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or referral code..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-2xl p-3 sm:p-5 bg-white border border-slate-200 w-full">
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
