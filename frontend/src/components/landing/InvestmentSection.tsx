'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileCheck,
  TrendingUp,
  Scale,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const investmentSteps = [
  {
    step: '01',
    title: 'Review Opportunity',
    desc: 'Examine detailed capital allocation proposals, risk assessments, target yield profiles, and business models.',
    icon: Building2,
  },
  {
    step: '02',
    title: 'Terms & Discussion',
    desc: 'Clarify schedule milestones, lock-in terms, disbursement channels, and institutional investor safeguards.',
    icon: Scale,
  },
  {
    step: '03',
    title: 'Formal Agreement Process',
    desc: 'Execute bilateral contracts and verified compliance documents prior to final capital placement.',
    icon: FileCheck,
  },
];

export default function InvestmentSection() {
  return (
    <section id="investment" className="py-20 sm:py-28 bg-gradient-to-b from-[#012015] via-[#01281a] to-[#00170f] text-white relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#023c28] border border-[#d4af37]/40 text-amber-200 font-bold text-xs uppercase tracking-wider mb-4"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#f3ba2f]" />
            <span>Structured Capital Allocation</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight"
          >
            Invest. Grow.{' '}
            <span className="bg-gradient-to-r from-amber-200 via-[#f3ba2f] to-amber-400 bg-clip-text text-transparent">
              Earn.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-300 font-medium leading-relaxed"
          >
            Explore available investment opportunities through EarnX Capital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mt-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-medium"
          >
            <div className="flex items-start space-x-2.5 text-left">
              <Lock className="w-4 h-4 text-[#f3ba2f] shrink-0 mt-0.5" />
              <span>
                Investors can review the opportunity, discuss the applicable terms and complete the required formal agreement process before making an investment.
              </span>
            </div>
          </motion.div>
        </div>

        {/* 3 Step Formal Agreement Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {investmentSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="p-7 rounded-3xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#d4af37]/60 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-[#f3ba2f] font-mono">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#03442e] to-[#012015] border border-[#d4af37]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#f3ba2f]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/10 flex items-center space-x-2 text-xs text-amber-200/90 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f3ba2f]" />
                  <span>Formal Protocol</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/dashboard/investments"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all duration-200 group"
          >
            <span>Explore Investment Opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
