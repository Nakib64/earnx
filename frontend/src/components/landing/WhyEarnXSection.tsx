'use client';

import React from 'react';
import { motion } from 'framer-motion';

const valueProps = [
  {
    title: 'Multiple Opportunities',
    description:
      'Different ways to participate and grow across marketplace commerce, rewarded video ads, performance marketing, team leadership, and structured investments.',
    tags: ['Multi-channel revenue', 'Flexible participation', 'Unified single wallet'],
  },
  {
    title: 'Marketplace Access',
    description:
      'Buy, sell and discover products and services from verified merchants with built-in escrow protection.',
    tags: ['Curated vendor catalog', 'Digital & tangible products', 'Instant wallet checkout'],
  },
  {
    title: 'Business Growth',
    description:
      'Build your network and expand your business through collaborative team leadership and tiered overrides.',
    tags: ['Mentorship pathways', 'Leadership rewards', 'Expanding incentive pool'],
  },
  {
    title: 'Marketing Opportunities',
    description:
      'Turn successful sales and marketing into earning opportunities with automated real-time tracking.',
    tags: ['High-converting offers', 'Direct commission payouts', 'Full marketing toolkit'],
  },
  {
    title: 'Professional Services',
    description:
      'Access quality agency and business solutions to build your brand and dominate online search.',
    tags: ['Digital ad management', 'Web & branding hub', 'SEO & social strategies'],
  },
  {
    title: 'Escrow-Backed Safety',
    description:
      'Complete legal assurances, instant wallet payouts, and continuous 24/7 dedicated customer care.',
    tags: ['100% Secure funds', 'Audited infrastructure', 'Instant dispute resolution'],
  },
];

export default function WhyEarnXSection() {
  return (
    <section className="py-20 bg-white" data-purpose="why-choose-earnx" id="why-earnx">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span>DISTINCT VALUE PROPOSITIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose EarnX?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Engineered to empower ambitious individuals, brands, leaders, and strategic investors with transparent, scalable business pathways.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueProps.map((prop, idx) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-2">{prop.title}</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{prop.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                {prop.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
