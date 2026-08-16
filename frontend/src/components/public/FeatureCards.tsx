'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, BarChart3, Zap, Users, LucideIcon } from 'lucide-react';

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

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: ShieldCheck,
    title: 'Secure Account',
    desc: 'Advanced encryption and multi-layer security to protect your assets.',
  },
  {
    icon: BarChart3,
    title: 'Smart Dashboard',
    desc: 'Real-time analytics and insights to track your portfolio performance.',
  },
  {
    icon: Zap,
    title: 'Fast Transactions',
    desc: 'Experience lightning-fast deposits, withdrawals and transfers.',
  },
  {
    icon: Users,
    title: 'Team Management',
    desc: 'Powerful tools to build, manage and grow your winning team.',
  },
];

export interface FeatureCardsProps {
  items?: FeatureItem[];
}

export default function FeatureCards({ items = defaultFeatures }: FeatureCardsProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.15 }}
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 text-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center mx-auto transition-all shadow-md">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
