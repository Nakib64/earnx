'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { apiFetch } from '../../lib/api';
import { ProductCard, ProductDetailModal } from '../ecommerce';

export default function LatestProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  return (
    <section className="py-20 sm:py-28 bg-[#F8FAFC] text-slate-900 relative font-[family-name:var(--font-montserrat)] overflow-hidden">
      {/* Soft atmospheric gradient highlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-slate-200/70">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Official EarnX Shop</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Latest Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Explore trending electronics, gadgets &amp; lifestyle goods. Pay seamlessly using your EarnX wallet balance with fast doorstep delivery across Bangladesh.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 font-bold text-xs shadow-2xs hover:shadow-sm transition-all group"
            >
              <ShoppingBag className="w-4 h-4 text-[#009F6B]" />
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="pt-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-slate-100 p-5 space-y-4 shadow-2xs animate-pulse"
                >
                  <div className="aspect-square w-full rounded-2xl bg-slate-100" />
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-6 bg-slate-100 rounded-md w-1/3" />
                  <div className="h-10 bg-slate-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No products available currently</h3>
              <p className="text-xs text-slate-500">
                New products are being added to our catalog. Please check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
