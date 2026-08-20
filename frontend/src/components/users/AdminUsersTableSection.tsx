'use client';

import React from 'react';
import { User } from '../../types';
import { DataTable, ColumnDef } from '../common/DataTable';
import { Users, Search } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Referral Network Table</h2>
            <p className="text-[11px] font-medium text-slate-400">
              Click any row to explore their downlines in-place or select Action details.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by phone, name, or code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
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
