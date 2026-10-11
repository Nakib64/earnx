'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Plus, Minus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, buyNow } = useCart();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const currentImage = images[selectedImage] || images[0];

  const handleAddToCart = () => {
    const success = addToCart(product, quantity);
    if (success) onClose();
  };

  const handleBuyNow = () => {
    const success = buyNow(product, quantity);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in font-[family-name:var(--font-montserrat)] overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white border border-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.18)] overflow-hidden my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-3">
            {/* Main Stage Image */}
            <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? 'border-[#009F6B] ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#009F6B] text-[10px] font-bold uppercase tracking-wider">
                  {product.category || 'General'}
                </span>
                <span className="text-xs text-slate-400 font-medium">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {product.stock > 0 ? (
                    <span className="text-emerald-700 font-bold">In Stock ({product.stock})</span>
                  ) : (
                    <span className="text-red-500 font-bold">Sold Out</span>
                  )}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-[#009F6B]">
                  ৳{Number(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">BDT</span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line max-h-48 overflow-y-auto pr-1">
                {product.description || 'No detailed description available for this item.'}
              </div>
            </div>

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Quantity</span>
                <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white text-xs sm:text-sm font-bold shadow-[4px_4px_14px_rgba(0,159,107,0.3)] transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#009F6B]" />
                  <span>Wallet Balance Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#009F6B]" />
                  <span>Doorstep BD Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
