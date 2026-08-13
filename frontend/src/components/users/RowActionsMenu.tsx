'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, UserStatus } from '../../types';
import { MoreVertical, DollarSign, Award, Users, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const handleToggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside or scrolling window
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      {/* Desktop view: Horizontal Action Buttons */}
      <div className="hidden sm:flex items-center justify-end space-x-1 whitespace-nowrap">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectDetails(user);
          }}
          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] flex items-center space-x-1 transition-colors border border-slate-200"
          title="View profile details"
        >
          <Users className="w-3 h-3 text-slate-500" />
          <span>Details</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdjustBalance(user);
          }}
          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] flex items-center space-x-1 transition-colors border border-slate-200"
          title="Adjust wallet balance"
        >
          <DollarSign className="w-3 h-3 text-slate-500" />
          <span>Adjust</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAssignBadge(user);
          }}
          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] transition-colors border border-slate-200"
          title="Badge"
        >
          Badge
        </button>

        {user.status === UserStatus.DISABLED && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
            className="px-2 py-1 bg-[#005A36] text-white rounded-lg font-bold text-[10px] hover:bg-[#044D2F] transition-colors"
          >
            Activate
          </button>
        )}

        {user.status === UserStatus.ACTIVE && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.BLOCKED)}
            className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] transition-colors border border-slate-200"
          >
            Block
          </button>
        )}

        {user.status === UserStatus.BLOCKED && (
          <button
            onClick={(e) => onToggleStatus(e, user, UserStatus.ACTIVE)}
            className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-bold text-[10px] transition-colors border border-slate-200"
          >
            Unblock
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteUser(user);
          }}
          className="px-2 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-[10px] transition-colors border border-rose-200"
          title="Delete user profile"
        >
          Delete
        </button>
      </div>

      {/* Mobile view: Three-Dot Button & Viewport Floating Dropdown Menu */}
      <div className="sm:hidden">
        <button
          ref={buttonRef}
          onClick={handleToggleOpen}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 active:scale-95"
          title="Options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${dropdownPos.top}px`,
              right: `${dropdownPos.right}px`,
              zIndex: 99999,
            }}
            className="w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1 space-y-0.5 text-left text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onSelectDetails(user);
              }}
              className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>View Details</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onAdjustBalance(user);
              }}
              className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Adjust Balance</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onAssignBadge(user);
              }}
              className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Assign Badge</span>
            </button>

            {user.status === UserStatus.DISABLED && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onToggleStatus(e, user, UserStatus.ACTIVE);
                }}
                className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                className="w-full px-3 py-2 text-left font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Unblock User</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDeleteUser(user);
              }}
              className="w-full px-3 py-2 text-left font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Delete Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
