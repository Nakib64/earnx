'use client';

import React, { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { UserBreadcrumbs, BreadcrumbItem } from '../../../components/users/UserBreadcrumbs';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useDebounce } from '../../../hooks/useDebounce';
import { Search, X, Users, Award, Network, Copy, Check, ChevronRight, Crown, Upload, Camera, Star, User } from 'lucide-react';

// Minimal shape returned by /users/tree
interface TreeMember {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  status?: string;
  is_premium?: boolean;
  created_at?: string;
  referred_by_id?: string | null;
  designation?: { name: string; stars?: number } | null;
}

function ReferralContent() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const userPhoto = avatarUrl || user?.avatar_url || '';
  const designationStars = user?.designation?.stars || 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size should be less than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const newUrl = reader.result;
        setAvatarUrl(newUrl);
        await apiFetch('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({ avatar_url: newUrl }),
        });
      }
    };
    reader.readAsDataURL(file);
  };

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
          if (member.is_premium) {
            flat.push(member);
            const pid = member.referred_by_id ?? user.id;
            if (!byParent.has(pid)) byParent.set(pid, []);
            byParent.get(pid)!.push(member);
          }
        });
      });

      if (!byParent.has(user.id) && tree[1]?.length) {
        byParent.set(user.id, tree[1].filter((m) => m.is_premium));
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Profile Header Card matching Screenshot Design */}
      <div className="bg-gradient-to-r from-[#003822] via-[#014d31] to-[#002e1c] border border-emerald-700/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Left Side: Name, Badge, User ID */}
        <div className="space-y-3 text-center sm:text-left z-10">
          {/* Full Name */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {user?.full_name || user?.phone || 'User'}
          </h2>

          {/* Membership / Designation Badge with Crown */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Crown className="w-5 h-5 fill-[#f3ba2f] text-[#f3ba2f]" />
            <span className="text-sm sm:text-base font-extrabold text-[#f3ba2f] tracking-wide">
              {user?.is_premium
                ? 'Premium Member'
                : user?.designation?.name || 'Standard Member'}
            </span>
          </div>

          {/* User ID */}
          <div className="text-xs sm:text-sm font-bold text-emerald-300/90 font-mono tracking-wider pt-1">
            User id: <span className="text-white font-black">{user?.referral_code || ''}</span>
          </div>
        </div>

        {/* Right Side: Circular Photo Frame with Device Upload */}
        <div className="relative group shrink-0 z-10">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl relative overflow-hidden bg-[#01281a] flex flex-col items-center justify-center text-center">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="User Profile Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1 p-2">
                <User className="w-12 h-12 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300">No Photo</span>
              </div>
            )}

            {/* Hidden File Input for Device Photo Upload */}
            <input
              type="file"
              accept="image/*"
              id="referral-photo-upload"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Overlay Upload Trigger on Hover */}
            <label
              htmlFor="referral-photo-upload"
              className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-bold text-xs space-y-1"
            >
              <Upload className="w-6 h-6 text-[#f3ba2f]" />
              <span>Upload Photo</span>
            </label>
          </div>

          {/* Floating Camera Upload Button */}
          <label
            htmlFor="referral-photo-upload"
            className="absolute top-1 right-1 bg-[#f3ba2f] text-slate-950 p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:bg-amber-300 transition-colors"
            title="Upload photo from device"
          >
            <Camera className="w-4 h-4 fill-slate-950" />
          </label>

          {/* Overlapping 3D Gold Stars at Bottom Right of Photo - ONLY IF DESIGNATION STARS > 0 */}
          {designationStars > 0 && (
            <div className="absolute -bottom-2 right-1 flex items-center space-x-0.5 bg-slate-950/80 px-2 py-1 rounded-full border border-[#f3ba2f]/60 shadow-lg">
              {Array.from({ length: designationStars }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 fill-[#f3ba2f] text-[#f3ba2f] drop-shadow-[0_2px_4px_rgba(243,186,47,0.8)]"
                />
              ))}
            </div>
          )}
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
          placeholder="Search member by name, phone, or user id..."
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
