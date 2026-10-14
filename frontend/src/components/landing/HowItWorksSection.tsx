'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Compass, Zap, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: 'STEP 01',
    icon: UserPlus,
    iconColor: 'bg-emerald-50 text-emerald-600',
    title: 'Create Account',
    desc: 'Register your EarnX Capital account in under 2 minutes and unlock immediate portal access.',
    tag: 'Quick Onboarding',
  },
  {
    step: 'STEP 02',
    icon: Compass,
    iconColor: 'bg-orange-50 text-orange-600',
    title: 'Explore Opportunities',
    desc: 'Choose your preferred earning path — marketplace, rewarded ads, team business, or structured investments.',
    tag: 'Flexible Selection',
  },
  {
    step: 'STEP 03',
    icon: Zap,
    iconColor: 'bg-blue-50 text-blue-600',
    title: 'Take Action',
    desc: 'Promote products, view daily ads, mentor team partners, or activate investment contracts.',
    tag: 'Active Execution',
  },
  {
    step: 'STEP 04',
    icon: TrendingUp,
    iconColor: 'bg-emerald-50 text-emerald-600',
    title: 'Grow & Earn',
    desc: 'Receive direct commissions, team overrides, and scheduled returns seamlessly in your wallet balance.',
    tag: 'Automated Payouts',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white" data-purpose="step-progression" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>SIMPLE 4-STEP PROGRESSION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How EarnX Capital Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            A connected 4-stage growth tree designed for seamless onboarding, clear progression, and transparent daily earnings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm relative transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {item.step}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl ${item.iconColor} flex items-center justify-center my-4 font-bold group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>{item.tag}</span>
                  <span className="text-emerald-600 font-bold">Ready ✓</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
