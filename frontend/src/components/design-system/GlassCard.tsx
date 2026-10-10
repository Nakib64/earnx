'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'standard' | 'elevated' | 'interactive';
  specular?: boolean;
  elevated?: boolean;
  interactive?: boolean;
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({
  variant,
  specular = true,
  elevated = false,
  interactive = false,
  glow = false,
  className = '',
  children,
  ...props
}: GlassCardProps) {
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    if (interactive || Boolean(props.onClick)) {
      resolvedVariant = 'interactive';
    } else if (elevated) {
      resolvedVariant = 'elevated';
    } else {
      resolvedVariant = 'standard';
    }
  }

  const isInteractive = resolvedVariant === 'interactive' || Boolean(props.onClick);

  const baseStyles = 'relative rounded-3xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    standard:
      'bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    elevated:
      'bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_16px_36px_rgba(15,23,42,0.08)]',
    interactive:
      'bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/90 hover:border-white hover:shadow-[0_14px_34px_rgba(5,150,105,0.06)] cursor-pointer',
  }[resolvedVariant];

  const specularStyle = specular
    ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)]'
    : '';

  const glowStyle = glow ? 'specular-glow' : '';

  return (
    <motion.div
      whileTap={isInteractive ? { scale: 0.985 } : undefined}
      className={`${baseStyles} ${variantStyles} ${specularStyle} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
