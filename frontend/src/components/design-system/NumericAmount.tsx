'use client';

import React from 'react';

export interface NumericAmountProps {
  value?: number | string;
  amount?: number | string;
  prefix?: string;
  suffix?: string;
  semantic?: 'gain' | 'loss' | 'neutral' | 'auto';
  variant?: 'gain' | 'loss' | 'neutral' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  decimals?: number;
  className?: string;
}

export function NumericAmount({
  value,
  amount,
  prefix = '৳',
  suffix = '',
  semantic,
  variant,
  size = 'base',
  decimals = 2,
  className = '',
}: NumericAmountProps) {
  const actualValue = value !== undefined ? value : amount !== undefined ? amount : 0;
  const numValue = typeof actualValue === 'number' ? actualValue : parseFloat(actualValue);
  const isNumber = !isNaN(numValue);

  const chosenSemantic = semantic || variant || 'neutral';
  let determinedSemantic: 'gain' | 'loss' | 'neutral' = 'neutral';
  if (chosenSemantic === 'auto') {
    if (isNumber) {
      if (numValue > 0) determinedSemantic = 'gain';
      else if (numValue < 0) determinedSemantic = 'loss';
    }
  } else {
    determinedSemantic = chosenSemantic;
  }

  const colorStyles = {
    gain: 'text-emerald-600 font-extrabold',
    loss: 'text-rose-500 font-extrabold',
    neutral: 'text-slate-900 font-black',
  }[determinedSemantic];

  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl tracking-tight',
  }[size];

  const formattedNumber = isNumber
    ? numValue.toLocaleString(undefined, {
      minimumFractionDigits: Number.isInteger(numValue) ? 0 : 2,
      maximumFractionDigits: decimals,
    })
    : actualValue;

  return (
    <span
      className={`inline-flex items-baseline  tabular-nums tracking-tight ${colorStyles} ${sizeStyles} ${className}`}
    >
      {prefix && (
        <span className="opacity-80 font-sans mr-0.5 select-none">{prefix}</span>
      )}
      <span>{formattedNumber}</span>
      {suffix && (
        <span className="text-[0.8em] font-sans ml-1 text-slate-500 font-semibold select-none">
          {suffix}
        </span>
      )}
    </span>
  );
}
