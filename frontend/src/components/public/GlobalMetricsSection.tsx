'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Globe, Lock, CheckCircle2 } from 'lucide-react';

const stats = [
  {
    icon: Globe,
    value: '85+',
    label: 'Global Market Venues',
    detail: 'Liquidity distribution across key financial jurisdictions',
  },
  {
    icon: Zap,
    value: '< 15ms',
    label: 'Execution Latency',
    detail: 'Ultra-low latency institutional settlement pipeline',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Collateralized Reserves',
    detail: 'Cryptographically verifiable Proof-of-Reserves',
  },
  {
    icon: Activity,
    value: '99.99%',
    label: 'System Availability SLA',
    detail: 'Enterprise failover redundancy & zero unplanned downtime',
  },
];

export default function GlobalMetricsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-gradient-to-br from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden space-y-8">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#053d29] pb-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#d4af37]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Network Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Enterprise Scale & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-500 bg-clip-text text-transparent">
                Institutional Reliability
              </span>
            </h2>
          </div>
          <div className="flex items-center space-x-3 text-xs bg-[#023322] border border-[#d4af37]/30 px-4 py-2.5 rounded-xl text-slate-200 font-semibold">
            <Lock className="w-4 h-4 text-[#d4af37]" />
            <span>Encrypted Multi-Party Computation (MPC)</span>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#023322]/60 border border-[#d4af37]/20 hover:border-[#d4af37]/60 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs font-bold text-emerald-300 mt-1 uppercase tracking-wider">
                  {item.label}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 border-t border-[#053d29]/80 font-medium relative z-10">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Unplanned Outages Reported</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-bit AES Elliptic Curve Key Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Automated Daily Reconciliation Cycles</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
