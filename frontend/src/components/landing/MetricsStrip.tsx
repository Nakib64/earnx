'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Box,
  ShoppingCart,
  Building2,
  ShieldCheck,
} from 'lucide-react';

const stats = [
  { label: 'Active Members', value: '25K+', icon: Users },
  { label: 'Products & Services', value: '1,200+', icon: Box },
  { label: 'Total Sales', value: '৳ 58.6M+', icon: ShoppingCart },
  { label: 'Business Partners', value: '150+', icon: Building2 },
  { label: 'Verified Platform', value: '100%', icon: ShieldCheck },
];

export default function MetricsStrip() {
  return (
    <section className="pb-16 sm:pb-20 bg-white text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-[#01281a] border border-emerald-900/40 p-6 sm:p-8 shadow-xl shadow-emerald-950/15"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-emerald-800/60">
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3.5 ${
                    idx > 0 ? 'pt-4 md:pt-0 md:pl-6' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#023c28] border border-emerald-700/60 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {item.value}
                    </div>
                    <div className="text-xs font-semibold text-emerald-200/80">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
