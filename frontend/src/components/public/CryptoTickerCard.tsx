'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CryptoTickerCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-4 transition-all duration-300 hover:border-[#d4af37]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center p-2 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-xs border border-amber-200 shadow-inner font-mono">
                EX
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-white">EarnX Coin</h3>
                <span className="text-xs font-bold text-slate-400 font-mono">(EXC)</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  $184.56
                </span>
                <span className="text-xs font-black text-[#10b981] font-mono">
                  +7.35% (24h)
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md h-16 relative flex items-center">
            <svg className="w-full h-full text-[#10b981]" viewBox="0 0 300 60" fill="none">
              <path
                d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 45 L25 35 L50 40 L75 25 L100 30 L125 15 L150 20 L175 10 L200 25 L225 15 L250 20 L275 5 L300 12 V 60 H 0 Z"
                fill="url(#solGradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="solGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0 border-t lg:border-t-0 lg:border-l border-[#053d29] pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Market Cap</span>
              <span className="font-mono font-black text-white">$83.45B</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">24h Volume</span>
              <span className="font-mono font-black text-white">$3.21B</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Rank</span>
              <span className="font-mono font-black text-amber-300">#5</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Circulating Supply</span>
              <span className="font-mono font-black text-white">453.96M EXC</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
