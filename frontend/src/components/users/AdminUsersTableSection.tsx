'use client';

import React from 'react';
import { User } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Users, Search, X } from 'lucide-react';

interface AdminUsersTableSectionProps {
  users: User[];
  userColumns: ColumnDef<User>[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onRowClick: (user: User) => void;
  currentParentName: string;
  isRootParent: boolean;
}

export function AdminUsersTableSection({
  users,
  userColumns,
  loading,
  searchTerm,
  onSearchChange,
  onRowClick,
  currentParentName,
  isRootParent,
}: AdminUsersTableSectionProps) {
  const getEmptyMessage = () => {
    if (searchTerm.trim()) {
      return `No members found matching "${searchTerm.trim()}" across the database.`;
    }
    if (isRootParent) {
      return 'No badged leaders found. Assign a badge to users to display them here.';
    }
    return `No premium downlines found under ${currentParentName}. Only members who took Premium status using the referral code are listed.`;
  };

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 overflow-hidden select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Referral Network Table</h2>
            <p className="text-xs text-slate-500 font-medium">
              Click any row to explore their downlines in-place or select Action details.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search phone, name, code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
        <DataTable<User>
          data={users}
          columns={userColumns}
          keyExtractor={(u) => u.id}
          loading={loading}
          onRowClick={onRowClick}
          emptyMessage={getEmptyMessage()}
        />
      </div>
    </div>
  );
}
