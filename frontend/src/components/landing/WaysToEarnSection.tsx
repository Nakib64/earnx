'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, TrendingUp, Check } from 'lucide-react';

const pathways = [
  {
    num: '01',
    title: 'Sales & Marketing',
    description: 'Promote products and digital services to generate sales and earn direct commission rewards.',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-50 text-emerald-600',
    popular: false,
    points: [
      'Verified product catalog access',
      'Automated commission tracking',
      'High conversion sales assets',
    ],
    buttonClass: 'bg-slate-900 group-hover:bg-emerald-600 text-white',
    borderClass: 'border-slate-200/90',
  },
  {
    num: '02',
    title: 'Team-Based Business',
    description: 'Build your affiliate team, collaborate together, and earn multi-tier team overrides and milestone bonuses.',
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
    popular: true,
    points: [
      'Tiered team overrides',
      'Leadership rank bonuses',
      'Collaborative team mentorship',
    ],
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
    borderClass: 'border-2 border-emerald-500 shadow-lg',
  },
  {
    num: '03',
    title: 'Investment Opportunities',
    description: 'Participate with EarnX Capital through structured projects backed by formal legal agreements and predictable returns.',
    icon: TrendingUp,
    iconBg: 'bg-emerald-50 text-emerald-600',
    popular: false,
    points: [
      'Formal legal agreements',
      'Institutional due diligence',
      'Scheduled monthly payouts',
    ],
    buttonClass: 'bg-slate-900 group-hover:bg-emerald-600 text-white',
    borderClass: 'border-slate-200/90',
  },
];

export default function WaysToEarnSection() {
  return (
    <section className="py-20 bg-slate-50/70 border-y border-slate-200/60" data-purpose="earning-pathways" id="pathways">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>TAILORED EARNING PATHWAYS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Opportunities. <span className="text-emerald-600">Your Choice.</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Select your preferred participation model or combine multiple streams to maximize your sustainable business growth.
          </p>
        </motion.div>

        {/* 3 Pathways Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pathways.map((pathway, idx) => {
            const Icon = pathway.icon;
            return (
              <motion.div
                key={pathway.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl border ${pathway.borderClass} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative`}
              >
                {pathway.popular && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 uppercase rounded-bl-lg tracking-wider">
                    Popular Model
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl ${pathway.iconBg} flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      Pathway {pathway.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pathway.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                    {pathway.description}
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                    {pathway.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <Link
                    href="/register"
                    className={`block w-full py-3 text-center rounded-xl font-bold text-sm transition-colors shadow-sm ${pathway.buttonClass}`}
                  >
                    Explore Pathway →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
