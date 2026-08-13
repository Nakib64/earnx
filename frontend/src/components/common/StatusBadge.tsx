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
    case TransactionType.DEPOSIT:
    case TransactionType.INVESTMENT_PAYOUT:
    case TransactionType.PREMIUM_WEEKLY_PAYOUT:
      badgeStyle = 'bg-emerald-50 text-primary border-emerald-200';
      break;
    case RequestStatus.PENDING:
    case TransactionType.COMMISSION:
    case TransactionType.BALANCE_TRANSFER:
      badgeStyle = 'bg-yellow-50 text-[#854D0E] border-yellow-300';
      break;
    case UserStatus.DISABLED:
    case UserStatus.BLOCKED:
    case RequestStatus.REJECTED:
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case TransactionType.WITHDRAW:
    case TransactionType.INVESTMENT_DEPOSIT:
      badgeStyle = 'bg-emerald-100 text-[#044D2F] border-emerald-300';
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
