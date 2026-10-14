'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const agencyServices = [
  'Digital Marketing',
  'Branding & Design',
  'Web Development',
  'SEO & Content',
  'Social Media Ops',
  'Business Solutions',
];

const investmentPerks = [
  { id: '01', title: 'Formal Agreement & Signing with Official Notary' },
  { id: '02', title: 'Clear Schedules & Monthly Disbursed Returns' },
  { id: '03', title: 'Audited Capital Security with Asset Allocations' },
];

export default function AgencyAndInvestmentSection() {
  return (
    <section
      className="py-20 bg-slate-50/70 border-t border-slate-200/70"
      data-purpose="agency-services-dual"
      id="services"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Box 1: Agency Services */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                <span>ENTERPRISE AGENCY UNIT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Our Agency Services
              </h3>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                We provide high-impact creative, technology, and marketing services to scale brands, products, and online ventures.
              </p>

              {/* Services Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                {agencyServices.map((service, idx) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.1 + idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -2, transition: { duration: 0.15 } }}
                    className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100 hover:border-slate-300 hover:bg-slate-100/70 transition-colors cursor-default"
                  >
                    <p className="text-xs font-bold text-slate-800">{service}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 group transition-colors"
              >
                <span>Explore All Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Box 2: Investment Opportunities Overview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                <span>CAPITAL GROWTH PROGRAMS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Structured Investments
              </h3>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Explore structured investment programs with predictable monthly returns, formal legal agreements, and complete institutional transparency.
              </p>

              {/* Investment Perks */}
              <div className="space-y-4 mt-8">
                {investmentPerks.map((perk, idx) => (
                  <motion.div
                    key={perk.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + idx * 0.1 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {perk.id}
                    </div>
                    <p className="text-xs font-bold text-slate-800">{perk.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/investments"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>Explore Investments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
