'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { apiFetch } from '../../lib/api';

export default function LatestProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLatestProducts() {
      try {
        const res = await apiFetch<any>('/ecommerce/products/latest?limit=10');
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
        console.error('Failed to load latest products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadLatestProducts();
  }, []);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white" data-purpose="featured-products" id="marketplace">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span>OFFICIAL EARNX SHOP</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest Featured Products
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Explore trending electronics, gadgets &amp; lifestyle goods. Pay seamlessly using your EarnX wallet balance with fast delivery.
            </p>
          </div>
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl transition-colors group"
            >
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product, idx) => {
            const rawPrice = product.price;
            let displayPrice = '0.00';
            if (rawPrice !== null && rawPrice !== undefined) {
              if (typeof rawPrice === 'number') {
                displayPrice = isNaN(rawPrice) ? '0.00' : rawPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
              } else {
                const cleaned = String(rawPrice).replace(/[^0-9.-]/g, '');
                const num = parseFloat(cleaned);
                displayPrice = isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2 });
              }
            }

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer h-full"
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={
                        product.images?.[0] ||
                        product.image_url ||
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuD-e75Qh_aGNKzUGrhqmdv19LsEjd3SeNPnpOy2iF-v_OUeBUmdkRAwIBlpwgm00CcRx18M7L5RLm51cJgdzwRdTtHeH3p_xVwc5ltFfLkkdgmqp9SEgy1k7pAc4QfcojVqS9rbiiD20mTKHJ5jVLfCXCUmCPbChxPb44Hn4OmK97c7_jqSg0H4EXMQVZXRv7fchL1RybBploPlhSyKMsjkK-E3OVQb_X0vN3DZw8hIm8T94PcOLQ20wg'
                      }
                      alt={product.title || product.name}
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
                        {product.title || product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-2 border-t border-slate-100">
                      <div className="text-xl font-extrabold text-slate-900 mb-3">
                        ৳{displayPrice}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <span
                          className="py-2 text-xs font-semibold rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-700 transition-colors text-center"
                        >
                          Details
                        </span>
                        <span
                          className="py-2 text-xs font-bold rounded-lg bg-emerald-600 group-hover:bg-emerald-700 text-white transition-colors text-center"
                        >
                          Buy Now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
