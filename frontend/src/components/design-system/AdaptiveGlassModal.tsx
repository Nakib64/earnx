'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface AdaptiveGlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function AdaptiveGlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}: AdaptiveGlassModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal / Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-white/90 backdrop-blur-2xl border border-white/95 shadow-2xl rounded-t-3xl lg:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden z-10 specular-rim`}
          >
            {/* Mobile Drag Indicator */}
            <div className="lg:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
