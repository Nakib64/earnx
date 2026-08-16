'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function SecurityProtocolCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#053d29] pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Bank-Grade Protection & Security Standard</h3>
            <p className="text-xs text-slate-300 font-medium">Your assets and privacy are safeguarded by enterprise-tier crypto architecture.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-black text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Audited Security Infrastructure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="flex items-start space-x-3">
          <div className="w-7 h-7 rounded-lg bg-[#023322] text-amber-300 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-white text-sm">Cold Wallet Storage</h4>
            <p className="text-slate-400 text-[11px] leading-snug mt-1">95% of digital assets are held offline in multi-signature cold vaults.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-7 h-7 rounded-lg bg-[#023322] text-emerald-400 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-white text-sm">Instant Automated Execution</h4>
            <p className="text-slate-400 text-[11px] leading-snug mt-1">Smart-contracts execute deposits and withdrawal settlements with 0 delay.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-7 h-7 rounded-lg bg-[#023322] text-amber-300 flex items-center justify-center shrink-0 border border-[#d4af37]/30 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-white text-sm">256-Bit SSL & 2FA</h4>
            <p className="text-slate-400 text-[11px] leading-snug mt-1">End-to-end encrypted user communications and mandatory multi-factor auth.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
