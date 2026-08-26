'use client';

import React from 'react';
import { motion } from 'framer-motion';

const paymentMethods = [
  {
    name: 'bKash',
    logo: '/bkash.svg',
    logoClass: 'max-h-16 sm:max-h-20 max-w-[190px] sm:max-w-[220px]',
  },
  {
    name: 'Nagad',
    logo: '/nagad.svg',
    logoClass: 'max-h-14 sm:max-h-16 max-w-[170px] sm:max-w-[190px]',
  },
  {
    name: 'Rocket',
    logo:
      'https://commons.wikimedia.org/wiki/Special:Redirect/file/Rocket_mobile_banking_logo.svg',
    logoClass: 'max-h-14 sm:max-h-16 max-w-[170px] sm:max-w-[190px]',
  },
];

export default function MetricsStrip() {
  return (
    <section className="py-16 sm:py-20 bg-[#f8faf9] text-[#071426] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <p className="text-sm sm:text-base font-semibold tracking-wide text-emerald-700 uppercase mb-2">
            Easy &amp; convenient
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Get paid by mobile banking
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
            Receive your payments quickly and securely through your preferred
            mobile banking service.
          </p>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="group flex items-center justify-center"
            >
              <div className="w-full h-28 sm:h-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <img
                  src={method.logo}
                  alt={`${method.name} payment method`}
                  className={`${method.logoClass} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
