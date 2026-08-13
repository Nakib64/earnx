'use client';

import React, { useState } from 'react';
import { X, Search, ChevronRight, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DesignationItem, DesignationUser } from '../../hooks/useDesignations';

interface AssignUsersModalProps {
  selectedDesignation: DesignationItem | null;
  onClose: () => void;
}

export default function AssignUsersModal({
  selectedDesignation,
  onClose,
}: AssignUsersModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  if (!selectedDesignation) return null;

  const members = selectedDesignation.users || [];

  const filteredMembers = members.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      u.phone.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.referral_code && u.referral_code.toLowerCase().includes(q))
    );
  });

  const handleRowClick = (user: DesignationUser) => {
    const name = user.full_name || user.phone || 'User';
    onClose();
    router.push(`/admin/users?parentId=${user.id}&parentName=${encodeURIComponent(name)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[85vh] flex flex-col border border-slate-200/90">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Assigned Members ({members.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Badge: <span className="font-bold text-primary">{selectedDesignation.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by phone, name, or referral code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-96">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400">
                {searchTerm.trim()
                  ? `No members found matching "${searchTerm.trim()}"`
                  : 'No members assigned to this badge yet.'}
              </p>
            </div>
          ) : (
            filteredMembers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleRowClick(user)}
                className="group p-3 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#005A36] flex items-center justify-center font-black text-xs shrink-0">
                    {(user.full_name || user.phone || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 group-hover:text-primary transition-colors">
                      {user.full_name || user.phone}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                      <span>Phone: <strong className="text-slate-700">{user.phone}</strong></span>
                      {user.referral_code && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-bold">{user.referral_code}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 group-hover:text-primary font-extrabold text-[11px] transition-colors shrink-0">
                  <span>View</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
