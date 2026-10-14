'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
} from 'lucide-react';
import { Product } from '../../types';
import { apiFetch } from '../../lib/api';
import Footer from '../../components/Footer';

const CATEGORIES = [
  'All',
  'Electronics',
  'Audio',
  'Accessories',
  'Gaming',
  'Home & Office',
  'Storage',
];

export const formatPrice = (val: any): string => {
  if (val === null || val === undefined) return '0.00';
  if (typeof val === 'number') return isNaN(val) ? '0.00' : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = async (query = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const categoryParam = cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : '';
      const searchParam = query.trim() ? `&search=${encodeURIComponent(query.trim())}` : '';
      const res = await apiFetch<any>(`/ecommerce/products?page=1&limit=50${searchParam}${categoryParam}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setProducts(list);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#FBFDFD] text-slate-800 antialiased selection:bg-emerald-500 selection:text-white flex flex-col min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative pt-12 pb-16 overflow-hidden grid-bg-pattern border-b border-slate-200/60" data-purpose="products-hero">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OFFICIAL EARNX COMMERCE &amp; MARKETPLACE</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center max-w-4xl mx-auto space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              EARNX MARKETPLACE<span className="text-emerald-600">.</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-slate-800">Verified Products. </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
                Instant Wallet Checkout!
              </span>
            </p>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed pt-2">
              Browse authentic tech gadgets, computer gear, and everyday lifestyle merchandise. Pay seamlessly with your wallet balance with escrow safety and fast delivery.
            </p>
          </motion.div>

          {/* Search Bar & Refresh */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by brand, title or specs..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Search
              </button>
            </form>
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2 flex-wrap"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => fetchProducts()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Reload catalog"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. PRODUCT CARDS GRID */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory === 'All' ? 'All Verified Merchandise' : `${selectedCategory} Collection`}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Showing {filteredProducts.length} items available in stock
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Wallet Checkout Active</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-4 animate-pulse">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No products matched your current search or category filter. Try clearing filters or searching for something else.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: (idx % 4) * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col group cursor-pointer h-full"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={
                          product.images?.[0] ||
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuD-e75Qh_aGNKzUGrhqmdv19LsEjd3SeNPnpOy2iF-v_OUeBUmdkRAwIBlpwgm00CcRx18M7L5RLm51cJgdzwRdTtHeH3p_xVwc5ltFfLkkdgmqp9SEgy1k7pAc4QfcojVqS9rbiiD20mTKHJ5jVLfCXCUmCPbChxPb44Hn4OmK97c7_jqSg0H4EXMQVZXRv7fchL1RybBploPlhSyKMsjkK-E3OVQb_X0vN3DZw8hIm8T94PcOLQ20wg'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        {product.category || 'MERCHANDISE'}
                      </span>
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        IN STOCK ({product.stock || 12})
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-100">
                        <div className="text-xl font-extrabold text-slate-900 mb-3">
                          ৳{formatPrice(product.price)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span
                            className="py-2.5 text-xs font-semibold rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 transition-colors text-center"
                          >
                            Details
                          </span>
                          <span
                            className="py-2.5 text-xs font-bold rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white transition-colors text-center shadow-xs"
                          >
                            Buy Now
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. TRUST HIGHLIGHTS ROW */}
      <section className="py-12 bg-slate-50/70 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Doorstep Delivery</h4>
                <p className="text-[11px] text-slate-500">Fast nationwide courier shipping</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Escrow Safe</h4>
                <p className="text-[11px] text-slate-500">Funds locked until verified arrival</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Wallet Checkout</h4>
                <p className="text-[11px] text-slate-500">Instant debit with 0% extra fees</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">24/7 Order Support</h4>
                <p className="text-[11px] text-slate-500">Live dispute and delivery updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}
