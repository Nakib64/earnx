'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const cardItem: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export interface FaqItem {
  question: string;
  answer: string;
}

const defaultFaqs: FaqItem[] = [
  {
    question: 'How does EarnX generate daily returns for investors?',
    answer:
      'EarnX leverages institutional algorithmic trading, liquidity provision across top exchange order books, and native EarnX Coin (EXC) staking yield pools to generate steady, risk-managed daily returns for platform members.',
  },
  {
    question: 'What are the minimum deposit limits and withdrawal speeds?',
    answer:
      'You can start investing from as low as ৳500 on our Starter Tier. All withdrawal requests are processed automatically via automated smart-contracts and direct payment gateways, taking anywhere from instant execution to under 15 minutes.',
  },
  {
    question: 'What is EarnX Coin (EXC) and what utility does it provide?',
    answer:
      'EXC is EarnX’s native high-utility digital asset. Holding and staking EXC unlocks boosted daily ROI rates (+0.5% to +1.5%), zero-fee internal transfers, exclusive access to VIP investment tiers, and governance voting rights.',
  },
  {
    question: 'How safe is my capital and personal information on EarnX?',
    answer:
      'Security is our highest priority. 95% of digital assets are stored in multi-signature cold storage vaults. Our infrastructure is protected by 256-bit SSL encryption, Cloudflare DDoS defense, multi-factor authentication (2FA), and continuous security audits.',
  },
];

export interface FaqAccordionProps {
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
}

export default function FaqAccordion({
  title = 'Frequently Asked Questions',
  subtitle = 'Find clear answers to how EarnX operates, how your investments grow, and how capital security is maintained.',
  items = defaultFaqs,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {items.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <motion.div
              key={idx}
              variants={cardItem}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:border-[#023322]/50"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#023824] border border-[#056343] text-amber-300 text-xs font-mono flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#03442e] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
