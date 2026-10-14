'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowLeft,
  Share2,
  Check,
  CheckCircle2,
  Tag,
  Package,
  Layers,
  ChevronRight,
  Sparkles,
  Plus,
  Minus,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../../../types';
import { apiFetch } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { ProductCard } from '../../../components/ecommerce';
import { toast } from 'sonner';

export function parsePrice(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  if (typeof val === 'object') {
    if (typeof val.toNumber === 'function') {
      try {
        const n = val.toNumber();
        if (!isNaN(n)) return n;
      } catch (e) {}
    }
    if (typeof val.toString === 'function') {
      const cleaned = val.toString().replace(/[^0-9.-]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num)) return num;
    }
    if ('amount' in val) return parsePrice(val.amount);
    if ('price' in val) return parsePrice(val.price);
  }
  return 0;
}

export function formatPriceBDT(val: any): string {
  const num = parsePrice(val);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DedicatedProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { addToCart, buyNow } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'delivery'>('details');

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      setLoading(true);
      try {
        const res = await apiFetch<any>(`/ecommerce/products/${productId}`);
        const productData =
          res.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data)
            ? res.data.data
            : res.data;

        if (res.success && productData && productData.id) {
          setProduct(productData);
          setSelectedImage(0);
          setQuantity(1);

          // Fetch related products from same category or latest
          loadRelatedProducts(productData.category, productData.id);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product details from API:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const loadRelatedProducts = async (category?: string, currentId?: string) => {
    setLoadingRelated(true);
    try {
      const catParam = category ? `&category=${encodeURIComponent(category)}` : '';
      const res = await apiFetch<any>(`/ecommerce/products?page=1&limit=5${catParam}`);
      if (res.success && res.data) {
        const list: Product[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setRelatedProducts(list.filter((p) => p.id !== currentId).slice(0, 4));
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'EarnX Product',
          text: `Check out ${product?.name} on EarnX Capital Marketplace!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Could not copy link to clipboard');
    }
  };

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const currentImage = images[selectedImage] || images[0];

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const maxStock = product.stock > 0 ? product.stock : 1;
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, maxStock)));
  };

  // ── SKELETON LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-[family-name:var(--font-montserrat)] pb-24 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-slate-200/80 rounded w-64" />

          {/* Main Card Grid Skeleton */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-2xl bg-slate-100" />
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-slate-100" />
                <div className="w-20 h-20 rounded-xl bg-slate-100" />
                <div className="w-20 h-20 rounded-xl bg-slate-100" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-6 bg-slate-100 rounded w-1/4" />
              <div className="h-10 bg-slate-100 rounded w-3/4" />
              <div className="h-8 bg-slate-100 rounded w-1/3" />
              <div className="h-20 bg-slate-100 rounded w-full" />
              <div className="h-12 bg-slate-100 rounded-2xl w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-slate-100 rounded-2xl" />
                <div className="h-12 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ERROR STATE ──
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-[family-name:var(--font-montserrat)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Product Not Found</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              The product you are looking for may have been removed, sold out, or is temporarily unavailable.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Official Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-[family-name:var(--font-montserrat)] pb-24 pt-6 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── BREADCRUMB & BACK NAVIGATION ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </Link>

            <span className="text-slate-300">/</span>
            <Link href="/products" className="hover:text-slate-900 transition-colors">
              Products
            </Link>

            {product.category && (
              <>
                <span className="text-slate-300">/</span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-[#009F6B] transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}

            <span className="text-slate-300 hidden sm:inline">/</span>
            <span className="text-slate-800 truncate max-w-[200px] hidden sm:inline font-bold">
              {product.name}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer text-xs font-bold"
            title="Share this product"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* ── MAIN PRODUCT HERO CARD ── */}
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 p-6 sm:p-10 lg:p-12">
            {/* ── LEFT: GALLERY SHOWCASE ── */}
            <div className="space-y-4">
              {/* Main Preview Stage */}
              <div className="relative aspect-square w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner group">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlaid Category Badge */}
                {product.category && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 uppercase tracking-wider shadow-sm border border-white/80">
                    {product.category}
                  </span>
                )}

                {/* Stock Status Badge */}
                <span
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-black uppercase tracking-wider shadow-sm border ${
                    isOutOfStock
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : product.stock < 5
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                  }`}
                >
                  {isOutOfStock
                    ? 'Out of Stock'
                    : product.stock < 5
                    ? `Only ${product.stock} Left`
                    : 'In Stock & Verified'}
                </span>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImage === idx
                          ? 'border-[#009F6B] ring-4 ring-emerald-500/15 shadow-sm scale-105'
                          : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Guarantee Ribbons */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">100% Genuine</h4>
                    <p className="text-[10px] text-slate-400">Authentic goods guarantee</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Fast Delivery</h4>
                    <p className="text-[10px] text-slate-400">Nationwide across BD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: PRODUCT DETAILS & PURCHASE CONTROLS ── */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Product Title & Brand Badge */}
                <div className="space-y-2">
                  

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                    <span>Category: <strong className="text-slate-800">{product.category || 'General'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Stock: <strong className="text-slate-800">{product.stock} units</strong></span>
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-baseline justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Exclusive Member Price
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#009F6B] tracking-tight">
                        ৳{formatPriceBDT(product.price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">BDT</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                      Wallet Payment
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">0% transaction fees</p>
                  </div>
                </div>

                {/* Description Summary */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Product Description
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                    {product.description ||
                      'Premium quality guaranteed. Handpicked and verified for high performance, reliability, and longevity. Fully supported by EarnX warranty and instant wallet checkout.'}
                  </p>
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Quantity:</span>
                      <span className="text-slate-400 font-normal">Max available: {product.stock}</span>
                    </div>

                    <div className="inline-flex items-center border border-slate-200/90 rounded-2xl bg-white p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-16 text-center text-sm font-black text-slate-900 select-none">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Call-to-Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => addToCart(product, quantity)}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-600" />
                    <span>Add to Cart</span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    type="button"
                    onClick={() => buyNow(product, quantity)}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#009F6B] hover:bg-[#008C5F] active:bg-[#007A53] text-white text-sm font-black shadow-[0_4px_16px_rgba(0,159,107,0.35)] hover:shadow-[0_6px_20px_rgba(0,159,107,0.45)] transition-all disabled:opacity-40 cursor-pointer active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Buy Now (৳{(parsePrice(product.price) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Instant balance checkout • Encrypted transaction • Doorstep nationwide dispatch
                </p>
              </div>
            </div>
          </div>

          {/* ── BOTTOM TABBED DETAILS & SPECIFICATIONS ── */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-6 sm:p-10">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Detailed Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'delivery'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shipping &amp; Policies
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'details' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  {product.description ||
                    'This product is officially verified and distributed through EarnX Capital. All items undergo physical quality inspections before dispatch to ensure zero defects and complete satisfaction.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700">100% Brand new factory packed condition</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700">Real-time parcel tracking provided via SMS</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700">Pay directly with your EarnX wallet balance</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700">7-day replacement warranty for manufacturing defects</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl divide-y divide-slate-200/80 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Product Code / ID</span>
                  <span className="text-slate-800 font-bold font-mono">{product.id.slice(0, 12)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Category</span>
                  <span className="text-slate-800 font-bold">{product.category || 'General'}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Price</span>
                  <span className="text-[#009F6B] font-extrabold">৳{formatPriceBDT(product.price)} BDT</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Stock Status</span>
                  <span className="text-slate-800 font-bold">
                    {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Payment Options</span>
                  <span className="text-slate-800 font-bold">EarnX Cash Wallet</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400 font-medium">Coverage</span>
                  <span className="text-slate-800 font-bold">All 64 Districts of Bangladesh</span>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Inside Dhaka Delivery</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Orders placed before 2:00 PM are dispatched on the same day. Estimated delivery 24 to 48 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                      <Truck className="w-4 h-4 text-sky-600" />
                      <span>Outside Dhaka &amp; Districts</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dispatched via trusted courier partners (Steadfast, Pathao, RedX). Estimated delivery 2 to 4 working days.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 pt-2">
                  Have questions about this item? Our 24/7 Support Desk is ready to assist you via WhatsApp or ticket support.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS SHOWCASE ── */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Related Products You May Like
                </h2>
                <p className="text-xs text-slate-500">
                  Explore other trending items in {product.category || 'our catalog'}
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009F6B] hover:text-emerald-700 transition-colors"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
