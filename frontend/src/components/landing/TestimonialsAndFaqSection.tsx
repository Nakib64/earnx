'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Star,
  Quote,
} from 'lucide-react';

const testimonials = [
  {
    quote: 'EarnX Capital has completely changed my income journey. Amazing platform!',
    name: 'Rashed Islam',
    role: 'Top Affiliate Marketer',
    stars: 5,
  },
  {
    quote: 'The team support is excellent and the opportunities are growing every day.',
    name: 'Nusrat Jahan',
    role: 'Team Lead',
    stars: 5,
  },
  {
    quote: 'A trusted platform with real opportunities to build long term income.',
    name: 'Kamrul Hasan',
    role: 'Strategic Investor',
    stars: 5,
  },
];

const faqs = [
  {
    q: 'What is EarnX Capital?',
    a: 'EarnX Capital is a comprehensive digital business platform bringing together marketplace commerce, sales & marketing, team-based business and structured investment opportunities in one unified ecosystem.',
  },
  {
    q: 'How do I earn from Sales & Marketing?',
    a: 'You can promote verified products and services listed on the EarnX Marketplace. When sales are completed through your marketing activities or referral links, you earn instant commissions credited to your wallet.',
  },
  {
    q: 'How does Team-Based Business work?',
    a: 'You can build and mentor your own team of independent partners. As your team grows and conducts sales and marketing activities, you earn override commissions, bonuses, and leadership designation rewards.',
  },
  {
    q: 'How can I invest with EarnX Capital?',
    a: 'Investors can review structured capital packages, discuss terms directly, and complete a formal investor agreement process before capital placement to earn attractive scheduled returns.',
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'Earnings from sales commissions, team incentives, and investment returns can be withdrawn directly to your preferred payment method or bank account via the user wallet.',
  },
];

export default function TestimonialsAndFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-24 bg-[#f8fbf9] text-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: What Our Members Say */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              What Our Members Say
            </h2>

            <div className="space-y-4">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <Quote className="w-6 h-6 text-emerald-500/40 mb-2" />
                  <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">
                    "{item.quote}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#01281a] text-[#f3ba2f] font-black text-xs flex items-center justify-center shadow-xs">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 leading-tight">
                          {item.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          {item.role}
                        </div>
                      </div>
                    </div>

                    {/* 5 Stars */}
                    <div className="flex items-center space-x-0.5 text-[#f3ba2f]">
                      {[...Array(item.stars)].map((_, sIdx) => (
                        <Star key={sIdx} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Frequently Asked Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-extrabold text-sm sm:text-base text-slate-900 hover:text-emerald-800 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-emerald-700' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
