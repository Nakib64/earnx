'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

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

const contactCards = [
  {
    icon: Phone,
    title: 'Direct WhatsApp',
    value: '+880 1700-000000',
    subtitle: 'Live WhatsApp 24/7',
  },
  {
    icon: Mail,
    title: 'Email Support',
    value: 'support@earnx.com',
    subtitle: 'Avg. Response < 2h',
  },

  {
    icon: Clock,
    title: 'Desk Hours',
    value: 'Monday – Sunday',
    subtitle: 'Non-Stop Monitoring',
  },
];

export default function ContactInfoGrid() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1  md:grid-cols-3 gap-5">
        {contactCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              whileHover={{ scale: 1.03, y: -6 }}
              className="bg-white border border-slate-200 hover:border-[#023322]/50 rounded-3xl p-6 text-center space-y-3 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#023824] border border-[#056343] text-emerald-400 group-hover:text-amber-300 flex items-center justify-center mx-auto transition-all shadow-md">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-[#023322] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs font-bold font-mono text-slate-800">
                {item.value}
              </p>
              <p className="text-[11px] font-bold text-[#03442e]">
                {item.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
