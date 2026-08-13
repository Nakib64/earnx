'use client';

import { useState, useCallback } from 'react';
import { User } from '../types';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export interface UseWalletAdjustmentReturn {
  adjustUser: User | null;
  setAdjustUser: React.Dispatch<React.SetStateAction<User | null>>;
  adjusting: boolean;
  handleBalanceAdjustSubmit: (
    user: User,
    rawAmount: number,
    type: 'ADD' | 'SUBTRACT',
    reason: string,
    onSuccess?: (targetId: string, finalAmount: number) => void,
  ) => Promise<void>;
}

export function useWalletAdjustment(): UseWalletAdjustmentReturn {
  const [adjustUser, setAdjustUser] = useState<User | null>(null);
  const [adjusting, setAdjusting] = useState(false);

  const handleBalanceAdjustSubmit = useCallback(
    async (
      user: User,
      rawAmount: number,
      type: 'ADD' | 'SUBTRACT',
      reason: string,
      onSuccess?: (targetId: string, finalAmount: number) => void,
    ) => {
      setAdjusting(true);
      const finalAmount = type === 'ADD' ? rawAmount : -rawAmount;

      const res = await apiFetch('/admin/wallet/adjust', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          user_id: user.id,
          amount: finalAmount,
          description: reason.trim() || 'Admin Direct Adjustment',
        }),
      });

      if (res.success) {
        toast.success(
          `${type === 'ADD' ? 'Added' : 'Subtracted'} ৳${rawAmount} ${
            type === 'ADD' ? 'to' : 'from'
          } ${user.full_name || user.phone}'s balance`,
        );
        if (onSuccess) onSuccess(user.id, finalAmount);
        setAdjustUser(null);
      } else {
        toast.error(res.error?.message || 'Balance adjustment failed');
      }
      setAdjusting(false);
    },
    [],
  );

  return {
    adjustUser,
    setAdjustUser,
    adjusting,
    handleBalanceAdjustSubmit,
  };
}
