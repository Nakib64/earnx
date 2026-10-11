'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Phone, Mail, Clock } from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';

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
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const contactCards = [
  {
    icon: Phone,
    title: 'Direct WhatsApp Desk',
    value: '+880 1700-000000',
    subtitle: 'Live WhatsApp 24/7 Agent',
  },
  {
    icon: Mail,
    title: 'Email Support Desk',
    value: 'support@earnx.com',
    subtitle: 'Avg. Response < 2 Hours',
  },
  {
    icon: Clock,
    title: 'Monitoring Hours',
    value: 'Monday – Sunday',
    subtitle: 'Non-Stop 24/7  Audits',
  },
];

export default function ContactInfoGrid() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contactCards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div key={idx} variants={cardItem}>
              <GlassCard
                className="p-6 text-center space-y-3.5 specular-rim hover:-translate-y-1.5 transition-all duration-300"
                interactive
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 ">
                  {item.title}
                </h3>
                <p className="text-xs font-bold  text-slate-800">
                  {item.value}
                </p>
                <p className="text-[11px] font-bold text-emerald-700">
                  {item.subtitle}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
