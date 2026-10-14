'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Store,
  ArrowRight,
  Package,
  Boxes,
  Zap,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

export default function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-12 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Bento Grid of Marketplace */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 order-2 lg:order-1"
          >
            {/* Card 1: For Shoppers & Buyers */}
            <GlassCard
              variant="elevated"
              specular={true}
              glow={true}
              className="p-6 sm:p-7 bg-gradient-to-br from-[#01281a] via-[#023c28] to-[#011a11] text-white border-emerald-700/40 shadow-xl flex flex-col justify-between group specular-rim"
            >
              {/* Top-Right Watermark Icon */}
              <ShoppingBag className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.05] group-hover:scale-105 transition-all pointer-events-none" />

              <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[#f3ba2f]/40 flex items-center justify-center mb-4 text-[#f3ba2f] shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f3ba2f] block mb-1">
                  For Buyers &amp; Shoppers
                </span>
                <h3 className="text-lg sm:text-xl font-black mb-2 text-white">Verified Goods</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Browse a curated catalog of physical electronics, lifestyle merchandise, software, and services from verified merchants.
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="text-amber-200 font-black">Instant Wallet Checkout</span>
                <span>Protected Escrow</span>
              </div>
            </GlassCard>

            {/* Card 2: For Merchants & Vendors */}
            <GlassCard
              variant="elevated"
              specular={true}
              glow={true}
              className="p-6 sm:p-7 flex flex-col justify-between group specular-rim shadow-[0_16px_36px_rgba(15,23,42,0.06)]"
            >
              {/* Top-Right Watermark Icon */}
              <Store className="absolute -top-4 -right-4 w-32 h-32 text-emerald-950/[0.03] group-hover:scale-105 transition-all pointer-events-none" />

              <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#009F6B] flex items-center justify-center mb-4 shadow-2xs">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#009F6B] block mb-1">
                  For Sellers &amp; Creators
                </span>
                <h3 className="text-lg sm:text-xl font-black mb-2 text-slate-900">Storefront &amp; Scale</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  List your products to thousands of active buyers and affiliate marketers eager to promote your catalog nationwide.
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="font-black text-[#009F6B]">Unified Portal</span>
                <span>Direct Payouts</span>
              </div>
            </GlassCard>

            {/* Bottom Wide Card: Multi-Category Support */}
            <GlassCard
              variant="standard"
              specular={true}
              className="sm:col-span-2 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 specular-rim border-white/95"
            >
              <Package className="absolute -top-4 -right-4 w-28 h-28 text-emerald-950/[0.02] pointer-events-none" />
              <div className="relative z-10 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#009F6B] border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-2xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Multi-Category Support</h4>
                  <p className="text-xs text-slate-500 font-medium">Physical merchandise, digital downloads, gadgets &amp; agency solutions</p>
                </div>
              </div>
              <span className="relative z-10 text-[10px] font-black px-3 py-1 bg-emerald-50 rounded-full text-emerald-800 border border-emerald-200 shrink-0 uppercase tracking-wider">
                Live Escrow
              </span>
            </GlassCard>
          </motion.div>

          {/* Right Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shop &amp; Sell Commerce Ecosystem</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Discover. Shop.{' '}
              <span className="text-[#009F6B] block sm:inline">Sell.</span>{' '}
              <span className="bg-gradient-to-r from-emerald-800 via-[#009F6B] to-amber-600 bg-clip-text text-transparent">
                Grow.
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-700 font-bold leading-relaxed">
              Explore authentic products from verified sellers, or onboard your brand to the EarnX digital marketplace.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              The EarnX Marketplace creates a direct commerce highway where buyers receive genuine products with escrow protection, and vendors gain immediate marketing traction across Bangladesh.
            </p>

            {/* Features check */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-[#009F6B] shrink-0" />
                <span>Seamless catalog browsing for both digital &amp; tangible products</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-[#009F6B] shrink-0" />
                <span>Integrated affiliate commission routing for independent marketers</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-[#009F6B] shrink-0" />
                <span>Vendor management tools with automated wallet settlement</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
              <Link href="/products" className="w-full sm:w-auto inline-block">
                <GlassButton
                  variant="primary"
                  size="md"
                  className="w-full bg-gradient-to-r from-[#009F6B] to-[#01281a] text-white shadow-md font-black text-xs sm:text-sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5 text-amber-300 shrink-0" />
                  <span>Explore Marketplace</span>
                </GlassButton>
              </Link>

              <Link href="/register" className="w-full sm:w-auto inline-block">
                <GlassButton
                  variant="secondary"
                  size="md"
                  className="w-full font-black text-xs sm:text-sm border-slate-200/90 hover:border-emerald-300"
                >
                  <Store className="w-4 h-4 mr-1.5 text-[#009F6B] shrink-0" />
                  <span>Become a Seller</span>
                </GlassButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
