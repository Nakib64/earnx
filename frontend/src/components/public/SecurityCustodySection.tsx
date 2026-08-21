'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, Lock, KeyRound, Server, Eye, FileCheck, CheckCircle2 } from 'lucide-react';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

const securityPillars = [
  {
    icon: Lock,
    title: 'Multi-Signature Cold Storage',
    desc: '95%+ of platform liquidity is sequestered in geographically distributed, air-gapped multi-signature cold vaults.',
    tag: 'Air-Gapped Vaults',
  },
  {
    icon: KeyRound,
    title: 'MPC Threshold Signatures',
    desc: 'Eliminating single points of failure through advanced Multi-Party Computation key-sharding cryptography.',
    tag: 'Zero Single Point of Failure',
  },
  {
    icon: Server,
    title: 'Hardware Security Modules (HSM)',
    desc: 'FIPS 140-2 Level 3 compliant cryptographic hardware modules executing automated authorization logic.',
    tag: 'FIPS 140-2 Level 3',
  },
  {
    icon: Eye,
    title: '24/7 AI Threat Detection',
    desc: 'Continuous real-time anomaly detection scanning withdrawal vectors and unauthorized privilege escalation.',
    tag: 'Autonomous AI Shield',
  },
  {
    icon: FileCheck,
    title: 'Daily Cryptographic Audits',
    desc: 'Automated on-chain proof-of-solvency matching aggregate liabilities against verified vault balances.',
    tag: 'Proof of Solvency',
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted Zero-Knowledge Routing',
    desc: 'Transaction data and private telemetry are encrypted using state-of-the-art ZK privacy protocols.',
    tag: 'End-to-End Encryption',
  },
];

export default function SecurityCustodySection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-black tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#005A36]" />
          <span>Institutional Custody Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Defense-in-Depth Security & <br />
          <span className="bg-gradient-to-r from-[#01281a] via-[#005A36] to-[#d4af37] bg-clip-text text-transparent">
            Cryptographic Vault Custody
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          Multi-layer defense infrastructure built from the ground up to protect institutional assets against emerging cyber vulnerabilities.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {securityPillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#005A36]/40 transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005A36] flex items-center justify-center border border-emerald-100 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center space-x-1.5 text-[11px] font-bold text-[#005A36]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#005A36]" />
                <span>Active Protection Vector</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
