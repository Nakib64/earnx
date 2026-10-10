'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function GlassButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: GlassButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold transition-all duration-200 select-none cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs min-h-[38px] px-3.5 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm min-h-[44px] px-5 py-2.5 rounded-2xl gap-2', // Standard 44px touch target
    lg: 'text-base min-h-[50px] px-6 py-3 rounded-2xl gap-2.5 font-extrabold',
  }[size];

  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/40 specular-rim',
    secondary:
      'bg-white/80 hover:bg-white text-slate-900 backdrop-blur-xl border border-white/95 shadow-md shadow-slate-900/5',
    outline:
      'bg-white/50 hover:bg-emerald-50/60 text-emerald-700 border border-emerald-600/30 backdrop-blur-md',
    danger:
      'bg-rose-50 hover:bg-rose-100/90 text-rose-600 border border-rose-200 shadow-xs',
    ghost:
      'bg-transparent hover:bg-slate-200/50 text-slate-600 hover:text-slate-900',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
