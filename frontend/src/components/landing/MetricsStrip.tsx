'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, BarChart3, Headphones } from 'lucide-react';

const mfsGateways = [
  {
    name: 'bKash',
    colorClass: 'text-pink-600',
    subtitle: 'PERSONAL & MERCHANT DIRECT PAYOUTS',
  },
  {
    name: 'নগদ',
    colorClass: 'text-orange-600',
    subtitle: 'INSTANT CASH-OUT & WALLET DEPOSITS',
  },
  {
    name: 'upay',
    colorClass: 'text-purple-600',
    subtitle: 'UCB MOBILE BANKING INTEGRATION',
  },
];

const trustFeatures = [
  {
    icon: Zap,
    title: 'Instant Payouts',
    desc: 'Automated 15-30 min execution pipeline',
  },
  {
    icon: ShieldCheck,
    title: '100% Escrow Safe',
    desc: 'Protected commission ledger and safer funds',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Audits',
    desc: 'Instant commission logs & transaction records',
  },
  {
    icon: Headphones,
    title: '24/7 Support Desk',
    desc: 'Rapid assistance via WhatsApp and Tickets',
  },
];

export default function MetricsStrip() {
  return (
    <section className="py-20 bg-slate-50/80 border-t border-slate-200/80" data-purpose="banking-cashout" id="payouts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>FAST &amp; CONVENIENT CASH-OUT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Get Paid via Mobile Banking
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Receive your commission earnings and package task rewards quickly and securely through your preferred mobile wallet.
          </p>
        </motion.div>

        {/* MFS Supported Gateways Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
          {mfsGateways.map((mfs, idx) => (
            <motion.div
              key={mfs.name}
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-16 h-12 flex items-center justify-center font-extrabold text-2xl tracking-tighter ${mfs.colorClass} group-hover:scale-110 transition-transform`}>
                {mfs.name}
              </div>
              <p className="text-xs font-bold text-slate-600 mt-2 uppercase">{mfs.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {trustFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
