'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  MapPin,
  Wallet,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { Order, OrderStatus } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';

const STATUS_CFG: Record<OrderStatus, { label: string; dot: string; text: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Order Placed', dot: 'bg-amber-400',  text: 'text-amber-700',  icon: Clock },
  PROCESSING: { label: 'Processing',  dot: 'bg-blue-400',   text: 'text-blue-700',   icon: RefreshCw },
  SHIPPED:    { label: 'On the Way',  dot: 'bg-purple-400', text: 'text-purple-700', icon: Truck },
  DELIVERED:  { label: 'Delivered',   dot: 'bg-[#009F6B]',  text: 'text-[#009F6B]', icon: CheckCircle2 },
  CANCELLED:  { label: 'Cancelled',  dot: 'bg-red-400',    text: 'text-red-600',    icon: XCircle },
};

const getImgUrl = (img: string) =>
  img.startsWith('http') ? img : `http://localhost:5000${img}`;

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await apiFetch<any>(`/ecommerce/orders/my?page=${pageNum}&limit=15`, { skipCache: true });
      if (res.success && res.data) {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw.data || [];
        setOrders(list);
        if (raw.meta) setTotalPages(raw.meta.totalPages || 1);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const filtered = orders.filter((o) => statusFilter === 'ALL' || o.status === statusFilter);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Purchase History</div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">My Orders</h1>
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Track your deliveries, view receipts, and monitor your wallet-paid purchases.
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              Dashboard
            </Link>
            <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-md transition-all cursor-pointer">
              <ShoppingBag className="w-3.5 h-3.5" />
              Browse Shop
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        {/* ── STATUS FILTER TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#009F6B] text-white shadow-sm'
                  : 'bg-white/70 backdrop-blur-md border border-white/80 text-slate-600 hover:bg-white shadow-sm'
              }`}>
              {st === 'ALL' ? 'All Orders' : STATUS_CFG[st]?.label || st}
            </button>
          ))}
        </div>

        {/* ── ORDERS LIST ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-5 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-36 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-20 bg-slate-100 rounded-lg" />
                </div>
                <div className="h-16 bg-slate-50 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-12 text-center flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B]">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No orders yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                {statusFilter === 'ALL'
                  ? "You haven't purchased anything yet. Browse our store and pay safely with your wallet."
                  : `No orders in "${STATUS_CFG[statusFilter as OrderStatus]?.label}" status.`}
              </p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-md transition-all">
              Browse Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ord) => {
              const cfg = STATUS_CFG[ord.status] || STATUS_CFG.PENDING;
              return (
                <div key={ord.id} className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5">

                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100/80">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                        <Package className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                          <span className="text-[11px] text-slate-400">
                            · {new Date(ord.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Wallet className="w-3 h-3 text-[#009F6B]" />
                          <span>Paid with Cash Wallet</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Total</span>
                        <span className="font-mono font-black text-sm text-[#009F6B]">৳{Number(ord.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ord.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                          {item.product_image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={getImgUrl(item.product_image)} alt={item.product_name} className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-slate-900 block truncate">{item.product_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">৳{Number(item.unit_price).toLocaleString()} × {item.quantity}</span>
                        </div>
                        <span className="font-mono font-bold text-sm text-slate-900 shrink-0">৳{Number(item.total_price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#009F6B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">{ord.customer_name}</span>
                      <span className="text-slate-400"> · {ord.customer_phone}</span>
                      <p className="text-slate-500 mt-0.5">{ord.delivery_address}, {ord.city ? `${ord.city}, ` : ''}{ord.district}</p>
                      {ord.notes && <p className="italic text-slate-400 mt-0.5 text-[11px]">Note: &ldquo;{ord.notes}&rdquo;</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 border border-white/90 text-slate-600 disabled:opacity-40 shadow-sm">
              Previous
            </button>
            <span className="text-xs text-slate-400 font-mono">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 border border-white/90 text-slate-600 disabled:opacity-40 shadow-sm">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
