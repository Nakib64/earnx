'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CtaBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function CtaBanner({
  title = 'Ready to take control of your portfolio?',
  description = 'Join EarnX Capital today and start your journey towards financial freedom.',
  buttonText = 'Create Your Account',
  buttonHref,
}: CtaBannerProps) {
  const { user } = useAuth();
  const defaultHref = buttonHref || (user ? '/dashboard' : '/register');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start space-x-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-[#f3ba2f] shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end space-y-2 shrink-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={defaultHref}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl flex items-center space-x-2"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
