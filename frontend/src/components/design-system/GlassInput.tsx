'use client';

import React from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full text-left">
        {label && (
          <label className="block text-xs font-bold text-slate-700 ">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full py-3 px-4 rounded-2xl bg-white/60 backdrop-blur-md border text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 shadow-xs focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100 ${leftIcon ? 'pl-11' : ''
              } ${rightIcon ? 'pr-11' : ''} ${error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200/90'
              } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

GlassInput.displayName = 'GlassInput';
