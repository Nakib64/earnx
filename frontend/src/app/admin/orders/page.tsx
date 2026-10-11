'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Search,
  RefreshCw,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Package,
  Eye,
  X,
  Wallet,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { Order, OrderStatus } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';

const STATUS_CFG: Record<OrderStatus, { label: string; dot: string; text: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Order Placed',  dot: 'bg-amber-400',  text: 'text-amber-700',   icon: Clock },
  PROCESSING: { label: 'Processing',   dot: 'bg-blue-400',   text: 'text-blue-700',    icon: RefreshCw },
  SHIPPED:    { label: 'Shipped',      dot: 'bg-purple-400', text: 'text-purple-700',  icon: Truck },
  DELIVERED:  { label: 'Delivered',    dot: 'bg-[#009F6B]',  text: 'text-[#009F6B]',  icon: CheckCircle2 },
  CANCELLED:  { label: 'Cancelled',   dot: 'bg-red-400',    text: 'text-red-600',     icon: XCircle },
};

const getImgUrl = (img: string) =>
  img.startsWith('http') ? img : `http://localhost:5000${img}`;

export default function AdminOrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        apiFetch<any>(`/ecommerce/admin/orders?status=${statusFilter === 'ALL' ? '' : statusFilter}&search=${encodeURIComponent(search)}`, { isAdmin: true, skipCache: true }),
        apiFetch<any>('/ecommerce/admin/stats', { isAdmin: true, skipCache: true }),
      ]);
      if (ordersRes.success && ordersRes.data) {
        const list = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.data || [];
        setOrders(list);
      }
      if (statsRes.success && statsRes.data) {
        const s = statsRes.data.data || statsRes.data;
        setStats({ totalOrders: s.totalOrders || 0, pendingOrders: s.pendingOrders || 0, deliveredOrders: s.deliveredOrders || 0, totalRevenue: s.totalRevenue || 0 });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [statusFilter, search]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await apiFetch<any>(`/ecommerce/admin/orders/${orderId}/status`, {
        method: 'PATCH', body: JSON.stringify({ status: newStatus }), isAdmin: true,
      });
      if (res.success) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        setMessage({ type: 'success', text: `Order status updated to ${STATUS_CFG[newStatus]?.label}` });
        fetchAll();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Status update failed' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted) {
    return (
      <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-pulse">
          <div className="h-10 bg-slate-200/50 rounded-2xl w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/70 rounded-3xl border border-white/80" />
            ))}
          </div>
          <div className="h-96 bg-white/70 rounded-3xl border border-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Order Fulfillment &amp; Dispatch</div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">Ecommerce Orders</h1>
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Review customer delivery addresses, track shipments, and update order statuses. All payments are wallet-settled.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {stats.pendingOrders} pending &bull; <strong className="text-slate-900">{stats.totalOrders} total</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              Dashboard
            </Link>
            <button onClick={() => fetchAll()} disabled={loading} className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, color: 'text-slate-900', iconBg: 'bg-emerald-50 border-emerald-100 text-[#009F6B]', icon: Package },
            { label: 'Pending', value: stats.pendingOrders, color: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-100 text-amber-600', icon: Clock },
            { label: 'Delivered', value: stats.deliveredOrders, color: 'text-[#009F6B]', iconBg: 'bg-emerald-50 border-emerald-100 text-[#009F6B]', icon: CheckCircle2 },
            { label: 'Total Revenue', value: `৳${stats.totalRevenue.toLocaleString()}`, color: 'text-[#009F6B]', iconBg: 'bg-emerald-50 border-emerald-100 text-[#009F6B]', icon: Wallet },
          ].map(({ label, value, color, iconBg, icon: Icon }) => (
            <div key={label} className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${color}`}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by order #, name, phone…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 shadow-sm transition-all" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button key={st} onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === st ? 'bg-[#009F6B] text-white shadow-sm' : 'bg-white/70 backdrop-blur-md border border-white/80 text-slate-600 hover:bg-white shadow-sm'}`}>
                {st === 'ALL' ? 'All Orders' : STATUS_CFG[st as OrderStatus]?.label || st}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100/80">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Order # / Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Delivery Address</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                  <tr><td colSpan={6} className="py-14 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#009F6B]" /><span className="text-sm">Loading orders…</span></td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-14 text-center text-slate-400 text-sm">No orders match the current filter.</td></tr>
                ) : orders.map((ord) => {
                  const cfg = STATUS_CFG[ord.status] || STATUS_CFG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={ord.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{new Date(ord.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{ord.customer_name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-[#009F6B]" />
                          <span className="font-mono">{ord.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="text-xs font-semibold text-slate-700">{ord.district}{ord.city ? `, ${ord.city}` : ''}</div>
                        <div className="text-[11px] text-slate-400 truncate">{ord.delivery_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-sm text-[#009F6B]">৳{Number(ord.total_amount).toLocaleString()}</div>
                        <button onClick={() => setSelectedOrder(ord)} className="text-[10px] text-slate-400 hover:text-[#009F6B] underline mt-0.5 flex items-center gap-0.5">
                          <Package className="w-3 h-3" />{ord.items?.length || 0} items
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select value={ord.status} disabled={updatingId === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                            className="text-xs bg-white/80 border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 font-semibold text-slate-700 shadow-sm cursor-pointer">
                            <option value="PENDING">Order Placed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancel &amp; Refund</option>
                          </select>
                          <button onClick={() => setSelectedOrder(ord)} className="p-1.5 rounded-xl bg-white/80 border border-white/90 hover:border-slate-200 text-slate-400 hover:text-slate-700 shadow-sm transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ORDER DETAIL MODAL ── */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-6 px-4 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
            <div className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_24px_64px_rgba(15,23,42,0.14)] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-5 relative">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold font-mono text-slate-900">{selectedOrder.order_number}</h3>
                    <span className={`text-xs font-bold ${STATUS_CFG[selectedOrder.status]?.text}`}>
                      {STATUS_CFG[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed {new Date(selectedOrder.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Address */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer &amp; Delivery</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[11px] text-slate-400 block">Name</span><span className="font-semibold text-slate-900">{selectedOrder.customer_name}</span></div>
                  <div><span className="text-[11px] text-slate-400 block">Phone</span><span className="font-mono font-bold text-[#009F6B]">{selectedOrder.customer_phone}</span></div>
                  <div><span className="text-[11px] text-slate-400 block">District</span><span className="font-semibold text-slate-900">{selectedOrder.district}{selectedOrder.city ? `, ${selectedOrder.city}` : ''}</span></div>
                  <div><span className="text-[11px] text-slate-400 block">Address</span><span className="font-medium text-slate-700">{selectedOrder.delivery_address}</span></div>
                </div>
                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block">Note</span>
                    <p className="italic text-xs text-slate-600 mt-0.5">&ldquo;{selectedOrder.notes}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ordered Items ({selectedOrder.items?.length || 0})</div>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
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

              {/* Total & Payment */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="w-4 h-4 text-[#009F6B]" />
                  <span className="font-semibold text-slate-700">Paid via Cash Wallet</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total</span>
                  <span className="font-mono font-black text-lg text-[#009F6B]">৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Quick status update */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-500 font-medium">Change Status:</span>
                  <select value={selectedOrder.status} onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className="text-xs bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 font-semibold text-slate-700 shadow-sm cursor-pointer">
                    <option value="PENDING">Order Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancel &amp; Refund</option>
                  </select>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200/90 text-slate-600 hover:bg-slate-50">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
