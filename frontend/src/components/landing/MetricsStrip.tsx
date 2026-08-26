'use client';

import React from 'react';
import { motion } from 'framer-motion';

const paymentMethods = [
  {
    name: 'bKash',
    logo: 'https://www.svgrepo.com/show/515062/bkash.svg',
  },
  {
    name: 'Nagad',
    logo: 'https://www.svgrepo.com/show/518100/nagad.svg',
  },
  {
    name: 'Rocket',
    logo: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rocket_mobile_banking_logo.svg',
  },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-center"
              >
                <div className="w-full h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <img
                    src={method.logo}
                    alt={`${method.name} payment method`}
                    className="max-h-12 max-w-[140px] object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
