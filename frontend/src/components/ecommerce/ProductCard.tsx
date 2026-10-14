'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const router = useRouter();
  const { addToCart, buyNow } = useCart();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetails) {
      onOpenDetails(product);
    } else {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-3xl bg-white border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between shadow-[6px_6px_20px_rgba(15,23,42,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] hover:shadow-[10px_10px_25px_rgba(15,23,42,0.06),-6px_-6px_20px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-300 font-[family-name:var(--font-montserrat)] cursor-pointer"
    >
      <div>
        {/* Image Showcase Container */}
        <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
          <img
            src={images[activeImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Pill */}
          {product.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-2xs border border-white/80">
              {product.category}
            </span>
          )}

          {/* Stock status badge */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/10 backdrop-blur-md text-[10px] font-extrabold text-[#009F6B] border border-emerald-500/20 shadow-2xs">
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </span>

          {/* Quick View Floating Button */}
          {onOpenDetails && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <button
                type="button"
                onClick={handleQuickView}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#009F6B]" />
                Quick View
              </button>
            </div>
          )}

          {/* Multi-image navigation arrows (if > 1 image) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Next Image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeImageIndex ? 'w-4 bg-[#009F6B]' : 'w-1.5 bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-4 space-y-1.5">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#009F6B] transition-colors" title={product.name}>
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
            {product.description || 'Premium quality guaranteed. 100% genuine product with fast doorstep shipping.'}
          </p>

          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#009F6B]">
              ৳{(() => {
                const val = product.price;
                if (val === null || val === undefined) return '0.00';
                if (typeof val === 'number') return isNaN(val) ? '0.00' : val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const cleaned = String(val).replace(/[^0-9.-]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Action Buttons: Add to Cart & Buy Now */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock <= 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
          title="Add to shopping cart"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span>Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={() => buyNow(product, 1)}
          disabled={product.stock <= 0}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white text-xs font-bold shadow-[2px_2px_8px_rgba(0,159,107,0.25)] transition-all disabled:opacity-40 cursor-pointer"
          title="Buy now with wallet payment"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};
