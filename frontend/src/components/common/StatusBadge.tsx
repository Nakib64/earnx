import React from 'react';
import { UserStatus, RequestStatus, TransactionType } from '../../types';

export type StatusType = UserStatus | RequestStatus | TransactionType | string;

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case UserStatus.ACTIVE:
    case RequestStatus.APPROVED:
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case RequestStatus.PENDING:
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case UserStatus.DISABLED:
    case UserStatus.BLOCKED:
    case RequestStatus.REJECTED:
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case TransactionType.DEPOSIT:
    case TransactionType.INVESTMENT_PAYOUT:
    case TransactionType.PREMIUM_WEEKLY_PAYOUT:
      badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case TransactionType.COMMISSION:
    case TransactionType.BALANCE_TRANSFER:
      badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case TransactionType.WITHDRAW:
    case TransactionType.INVESTMENT_DEPOSIT:
      badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] sm:text-[10px] font-extrabold border uppercase tracking-wider ${badgeStyle} ${className}`}
    >
      {status}
    </span>
  );
};
