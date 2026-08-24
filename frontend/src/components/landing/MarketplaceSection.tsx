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
} from 'lucide-react';

export default function MarketplaceSection() {
  return (
    <section id="marketplace" className="py-20 sm:py-28 bg-[#f8fbf9] text-slate-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Bento Box of Marketplace with Top-Right Watermark Icons */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 order-2 lg:order-1"
          >
            {/* Card 1: For Shoppers & Buyers */}
            <div className="relative overflow-hidden p-7 rounded-3xl bg-gradient-to-br from-[#01281a] via-[#023c28] to-[#011a11] text-white border border-[#d4af37]/30 shadow-xl flex flex-col justify-between group">
              {/* Top-Right Watermark Icon */}
              <ShoppingBag className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.06] group-hover:scale-105 transition-all pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#d4af37]/40 flex items-center justify-center mb-4 text-[#f3ba2f]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f3ba2f]">
                  For Buyers &amp; Shoppers
                </span>
                <h3 className="text-xl font-black mt-1 mb-2">Verified Goods &amp; Services</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Browse a curated catalog of physical merchandise, software utilities, and agency services from verified business sellers.
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-amber-200">Instant Checkout</span>
                <span>Protected Escrow</span>
              </div>
            </div>

            {/* Card 2: For Merchants & Vendors */}
            <div className="relative overflow-hidden p-7 rounded-3xl bg-white border border-slate-200/90 text-slate-900 shadow-md flex flex-col justify-between group">
              {/* Top-Right Watermark Icon */}
              <Store className="absolute -top-4 -right-4 w-32 h-32 text-emerald-900/[0.04] group-hover:scale-105 transition-all pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#01281a] flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                  For Sellers &amp; Creators
                </span>
                <h3 className="text-xl font-black mt-1 mb-2">Storefront &amp; Scale</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  List your products or digital services to thousands of prospective buyers and active affiliate marketers eager to promote your offers.
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold text-[#01281a]">Unified Dashboard</span>
                <span>Automated Payouts</span>
              </div>
            </div>

            {/* Bottom Wide Card: Ecosystem Advantage */}
            <div className="relative overflow-hidden sm:col-span-2 p-6 rounded-3xl bg-white border border-emerald-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Package className="absolute -top-4 -right-4 w-28 h-28 text-emerald-900/[0.03] pointer-events-none" />
              <div className="relative z-10 flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Multi-Category Support</h4>
                  <p className="text-xs text-slate-600 font-medium">Physical merchandise, digital downloads, courses &amp; business services</p>
                </div>
              </div>
              <span className="relative z-10 text-[11px] font-bold px-3 py-1 bg-emerald-50 rounded-full text-emerald-900 border border-emerald-200 shrink-0">
                Live Ecosystem
              </span>
            </div>
          </motion.div>

          {/* Right Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >


            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Discover. Shop.{' '}
              <span className="text-[#01281a] block sm:inline">Sell.</span>{' '}
              <span className="bg-gradient-to-r from-[#01281a] via-[#025a3a] to-[#d4af37] bg-clip-text text-transparent">
                Grow.
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-700 font-semibold leading-relaxed">
              Explore products and services from sellers and business partners, or bring your own products and
              services to the EarnX marketplace.
            </p>

            <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
              The EarnX Marketplace creates a direct commerce highway where buyers get vetted solutions and
              vendors gain instant distribution through our engaged sales and team network.
            </p>

            {/* Features check */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seamless catalog browsing for both digital &amp; tangible products</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Integrated affiliate commission routing for independent marketers</span>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Vendor management tools with order fulfillment support</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/dashboard/purchase"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#01281a] hover:bg-[#023c28] text-white font-extrabold text-sm shadow-md transition-all duration-200 group"
              >
                <ShoppingBag className="w-4 h-4 text-[#f3ba2f]" />
                <span>Explore Marketplace</span>
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-sm shadow-xs transition-all duration-200"
              >
                <Store className="w-4 h-4 text-emerald-700" />
                <span>Become a Seller</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
