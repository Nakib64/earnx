'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Cpu, Globe2, LineChart, Layers, ArrowUpRight, CheckCircle, Shield } from 'lucide-react';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const assetClasses = [
  {
    icon: LineChart,
    title: 'Quantitative Arbitrage',
    subtitle: 'High-Frequency Hedging',
    desc: 'Algorithmic cross-exchange spread modeling maximizing risk-adjusted market efficiency.',
    badge: 'AI Powered',
    accent: 'from-emerald-500/10 to-teal-500/5',
    border: 'hover:border-emerald-500/50',
    stat: '+14.2%',
    statLabel: 'Alpha Efficiency',
  },
  {
    icon: Globe2,
    title: 'Global Liquidity Pools',
    subtitle: 'Multi-Market Depth',
    desc: 'Deep liquidity aggregated across Tier-1 institutions ensuring zero-slippage executions.',
    badge: 'Tier-1 Venues',
    accent: 'from-amber-500/10 to-yellow-500/5',
    border: 'hover:border-[#d4af37]/50',
    stat: '40+ Hubs',
    statLabel: 'Interconnected',
  },
  {
    icon: Cpu,
    title: 'Autonomous Risk Models',
    subtitle: 'Real-Time Protection',
    desc: 'Continuous volatility monitoring and automated circuit-breakers to safeguard capital reserves.',
    badge: 'Real-Time',
    accent: 'from-blue-500/10 to-indigo-500/5',
    border: 'hover:border-blue-500/50',
    stat: '0.01ms',
    statLabel: 'Response Time',
  },
  {
    icon: Layers,
    title: 'Diversified Yield Vaults',
    subtitle: 'Multi-Asset Hedging',
    desc: 'Multi-layered collateralized vault structures designed for sustainable long-term yield generation.',
    badge: 'Audited',
    accent: 'from-purple-500/10 to-emerald-500/5',
    border: 'hover:border-purple-500/50',
    stat: '100%',
    statLabel: 'Reserve Backed',
  },
];

export default function InstitutionalIntelligenceSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Asset Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Algorithmic Asset Strategy & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#01281a] via-[#005A36] to-[#d4af37] bg-clip-text text-transparent">
              Global Market Intelligence
            </span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md">
          Leveraging state-of-the-art computational infrastructure to preserve capital and capture structural market opportunities.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {assetClasses.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ y: -4 }}
              className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${item.border}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${item.accent} rounded-bl-full pointer-events-none transition-transform group-hover:scale-110`} />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-[#01281a] group-hover:text-[#d4af37] transition-colors shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item.subtitle}</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between relative z-10">
                <div>
                  <div className="text-base font-black text-[#005A36] font-mono">{item.stat}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{item.statLabel}</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#005A36] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
