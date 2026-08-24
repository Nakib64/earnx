'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Compass,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Create Account',
    desc: 'Create your EarnX Capital account in under 2 minutes and unlock instant platform access.',
    icon: UserPlus,
    tag: 'Quick Onboarding',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
    nodeColor: 'bg-emerald-600',
  },
  {
    step: '02',
    title: 'Explore Opportunities',
    desc: 'Choose your preferred path — marketplace, sales marketing, team business or structured investment.',
    icon: Compass,
    tag: 'Flexible Selection',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-800',
    watermarkColor: 'text-amber-900/[0.04]',
    nodeColor: 'bg-amber-500',
  },
  {
    step: '03',
    title: 'Take Action',
    desc: 'Promote products, market solutions, lead your team or execute formal investment agreements.',
    icon: Zap,
    tag: 'Active Execution',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 border-blue-500/30 text-blue-800',
    watermarkColor: 'text-blue-900/[0.04]',
    nodeColor: 'bg-blue-600',
  },
  {
    step: '04',
    title: 'Grow & Earn',
    desc: 'Receive direct commissions, team overrides, and scheduled capital returns seamlessly into your wallet.',
    icon: TrendingUp,
    tag: 'Sustainable Scale',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800',
    watermarkColor: 'text-emerald-900/[0.04]',
    nodeColor: 'bg-emerald-700',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#f8fbf9] text-slate-900 relative overflow-hidden">
      {/* Background Ambient Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-100/30 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
         

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight"
          >
            How EarnX Capital Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto"
          >
            A connected 4-stage growth tree designed for seamless onboarding, clear progression, and continuous earnings.
          </motion.p>
        </div>

        {/* Tree-Connected Flow Architecture */}
        <div className="relative">
          {/* Desktop Horizontal Tree Spine with Pulsing Hubs */}
          <div className="hidden lg:block absolute top-[4.5rem] left-[10%] right-[10%] h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-600 rounded-full z-0 opacity-40" />

          {/* Mobile Vertical Spine */}
          <div className="lg:hidden absolute top-8 bottom-8 left-8 w-1 bg-gradient-to-b from-emerald-400 via-amber-400 to-emerald-600 rounded-full z-0 opacity-40" />

          {/* 4 Connected Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                  className="relative overflow-hidden p-8 sm:p-9 rounded-[32px] bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Top-Right Watermark Icon */}
                  <Icon
                    className={`absolute -top-4 -right-4 w-32 h-32 ${item.watermarkColor} group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none`}
                  />

                  <div className="relative z-10">
                    {/* Top Tree Node Hub & Icon */}
                    <div className="flex items-center justify-between mb-8">
                      {/* Translucent Glassy Dual-Layer Icon Pod */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl ${item.badgeClass} backdrop-blur-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 stroke-[2.2]" />
                        </div>
                        {/* Connected Node Pulse Dot */}
                        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${item.nodeColor} text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-sm`}>
                          {item.step}
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {item.tag}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-3 tracking-tight group-hover:text-[#01281a] transition-colors">
                      {item.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom Stage Progress Indicator */}
                  <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="uppercase tracking-widest text-[10px] text-emerald-800 font-black">
                      Stage {item.step} of 04
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400 group-hover:text-[#01281a] transition-colors">
                      <span>Ready</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
