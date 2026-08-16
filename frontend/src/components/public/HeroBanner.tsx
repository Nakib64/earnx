'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

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

export interface HeroBannerProps {
  bgImage: string;
  title: React.ReactNode;
  description: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
  showMemberStats?: boolean;
}

export default function HeroBanner({
  bgImage,
  title,
  description,
  primaryBtnText = 'Get Started',
  primaryBtnHref,
  secondaryBtnText,
  secondaryBtnHref,
  showMemberStats = false,
}: HeroBannerProps) {
  const { user } = useAuth();
  const defaultPrimaryHref = primaryBtnHref || (user ? '/dashboard' : '/register');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/7.5] min-h-[240px] sm:min-h-[380px] lg:min-h-[540px] bg-[#001710] overflow-hidden shadow-2xl"
    >
      <img
        src={bgImage}
        alt="EarnX Capital Banner"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#001710]/95 via-[#001710]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001710]/80 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full h-full flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-[62%] sm:max-w-[58%] lg:max-w-xl space-y-2 sm:space-y-4 lg:space-y-6 text-left"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-sm xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.1]"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-slate-200 text-[9px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold leading-snug sm:leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 pt-0.5 sm:pt-2">
              {defaultPrimaryHref.startsWith('#') ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href={defaultPrimaryHref}
                    className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#03442e] hover:bg-[#04593d] text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 sm:space-x-2 border border-[#056343] transition-all shadow-xl"
                  >
                    <span>{primaryBtnText}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </a>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={defaultPrimaryHref}
                    className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#03442e] hover:bg-[#04593d] text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl flex items-center space-x-1 sm:space-x-2 border border-[#056343] transition-all shadow-xl"
                  >
                    <span>{primaryBtnText}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </Link>
                </motion.div>
              )}

              {secondaryBtnText && secondaryBtnHref && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={secondaryBtnHref}
                    className="px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3.5 bg-[#001710]/70 hover:bg-[#023322] text-slate-200 hover:text-white font-extrabold text-[10px] sm:text-xs lg:text-base rounded-lg sm:rounded-xl border border-slate-600/70 hover:border-[#d4af37]/60 transition-all backdrop-blur-sm"
                  >
                    {secondaryBtnText}
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {showMemberStats && (
              <motion.div variants={fadeInUp} className="pt-2 sm:pt-4 lg:pt-6 flex flex-wrap items-center gap-3 sm:gap-6 border-t border-[#053d29]/80 text-white text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                    ].map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="User"
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-slate-900 object-cover"
                      />
                    ))}
                  </div>
                  <span>25K+ Active Members</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Verified Ledger</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
