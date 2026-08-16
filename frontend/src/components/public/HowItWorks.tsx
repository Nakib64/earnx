'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Coins, Wallet, TrendingUp } from 'lucide-react';

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

const steps = [
  {
    step: '01',
    title: 'Create Account',
    desc: 'Sign up in minutes and secure your profile.',
    icon: Coins,
  },
  {
    step: '02',
    title: 'Add Balance',
    desc: 'Deposit funds securely using gateway payment methods.',
    icon: Wallet,
  },
  {
    step: '03',
    title: 'Manage & Grow',
    desc: 'Select packages, track yields and withdraw returns with ease.',
    icon: TrendingUp,
  },
];

export default function HowItWorks() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center"
    >
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        How It Works
      </h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.1 }}
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-[#f0f9f4] border border-[#cbe8d8] rounded-3xl p-6 text-left space-y-3 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-[#10b981]">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#cbe8d8] flex items-center justify-center text-[#033e28] shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
