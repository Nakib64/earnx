'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, UserStatus } from '../../types';
import { MoreVertical, DollarSign, Award, Users, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface RowActionsMenuProps {
  user: User;
  onSelectDetails: (user: User) => void;
  onAdjustBalance: (user: User) => void;
  onAssignBadge: (user: User) => void;
  onToggleStatus: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  onDeleteUser: (user: User) => void;
}

export function RowActionsMenu({
  user,
  onSelectDetails,
  onAdjustBalance,
  onAssignBadge,
  onToggleStatus,
  onDeleteUser,
}: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      {/* Desktop view: Horizontal Action Buttons */}
      <div className="hidden sm:flex items-center justify-end space-x-1 whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectDetails(user);
          }}
          className="px-2 py-1 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-md font-bold text-[11px] flex items-center space-x-1 transition-colors"
          title="View profile & transaction history below table"
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span>Details</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjustBalance(user);
          }}
          className="px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md font-bold text-[11px] flex items-center space-x-1 transition-colors"
          title="Adjust wallet balance"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Adjust</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignBadge(user);
          }}
          className="px-2 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-md font-bold text-[11px] transition-colors"
          title="Badge"
        >
          Badge
        </button>

        {user.status === UserStatus.DISABLED && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
            className="px-2 py-1 bg-emerald-500 text-white rounded-md font-bold text-[11px] hover:bg-emerald-600 transition-colors"
          >
            Activate
          </button>
        )}

        {user.status === UserStatus.ACTIVE && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.BLOCKED)}
            className="px-2 py-1 bg-rose-100 text-rose-800 rounded-md font-bold text-[11px] hover:bg-rose-200 transition-colors"
          >
            Block
          </button>
        )}

        {user.status === UserStatus.BLOCKED && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
            className="px-2 py-1 bg-sky-100 text-sky-800 rounded-md font-bold text-[11px] hover:bg-sky-200 transition-colors"
          >
            Unblock
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteUser(user);
          }}
          className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-bold text-[11px] transition-colors"
          title="Delete user profile"
        >
          Delete
        </button>
      </div>

      {/* Mobile view: Three-Dot Button & Floating Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-1.5 space-y-0.5 divide-y divide-slate-100 text-left text-xs">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onSelectDetails(user);
                }}
                className="w-full px-3 py-2 text-left font-bold text-sky-700 hover:bg-sky-50 rounded-xl flex items-center space-x-2"
              >
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>View Details Below</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAdjustBalance(user);
                }}
                className="w-full px-3 py-2 text-left font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center space-x-2"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Adjust Balance</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onAssignBadge(user);
                }}
                className="w-full px-3 py-2 text-left font-bold text-purple-700 hover:bg-purple-50 rounded-xl flex items-center space-x-2"
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Assign Badge</span>
              </button>
            </div>

            <div className="py-1">
              {user.status === UserStatus.DISABLED && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onToggleStatus(e, user, UserStatus.ACTIVE);
                  }}
                  className="w-full px-3 py-2 text-left font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center space-x-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Activate User</span>
                </button>
              )}

              {user.status === UserStatus.ACTIVE && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onToggleStatus(e, user, UserStatus.BLOCKED);
                  }}
                  className="w-full px-3 py-2 text-left font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Block User</span>
                </button>
              )}

              {user.status === UserStatus.BLOCKED && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onToggleStatus(e, user, UserStatus.ACTIVE);
                  }}
                  className="w-full px-3 py-2 text-left font-bold text-sky-600 hover:bg-sky-50 rounded-xl flex items-center space-x-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unblock User</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDeleteUser(user);
                }}
                className="w-full px-3 py-2 text-left font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
