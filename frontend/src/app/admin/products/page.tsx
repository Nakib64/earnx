'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
  Boxes,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { apiFetch } from '../../../lib/api';
import { Product } from '../../../types';
import { toast } from 'sonner';
import { AlertBanner } from '../../../components/common/AlertBanner';

export default function AdminProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Gadgets',
    images: [] as string[],
    is_active: true,
  });

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getImgUrl = (img: string) =>
    img.startsWith('http') ? img : `http://localhost:5000${img}`;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>(
        `/ecommerce/admin/products?search=${encodeURIComponent(search)}`,
        { isAdmin: true, skipCache: true }
      );
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.data || [];
        setProducts(list);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '10', category: 'Gadgets', images: [], is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      category: p.category || 'General',
      images: p.images || [],
      is_active: p.is_active,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) form.append('files', files[i]);
      const res = await apiFetch<any>('/ecommerce/admin/upload', { method: 'POST', body: form, isAdmin: true });
      const urls: string[] = res.data?.urls || (res as any).urls || [];
      if (urls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
        setMessage({ type: 'success', text: `${urls.length} image(s) uploaded` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setMessage({ type: 'error', text: 'Product name is required' });
    if (!formData.price || Number(formData.price) <= 0) return setMessage({ type: 'error', text: 'Valid price required' });
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        category: formData.category.trim(),
        images: formData.images,
        is_active: formData.is_active,
      };
      const url = editingProduct ? `/ecommerce/admin/products/${editingProduct.id}` : '/ecommerce/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      const res = await apiFetch<any>(url, { method, body: JSON.stringify(payload), isAdmin: true });
      if (res.success) {
        setMessage({ type: 'success', text: editingProduct ? 'Product updated' : 'Product created' });
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: res.error?.message || 'Save failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (p: Product) => {
    try {
      const res = await apiFetch<any>(`/ecommerce/admin/products/${p.id}`, {
        method: 'PATCH', body: JSON.stringify({ is_active: !p.is_active }), isAdmin: true,
      });
      if (res.success) {
        setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_active: !p.is_active } : x));
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await apiFetch<any>(`/ecommerce/admin/products/${deleteId}`, { method: 'DELETE', isAdmin: true });
      if (res.success) {
        setMessage({ type: 'success', text: 'Product deleted' });
        setProducts((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category || 'General')))];
  const filtered = products.filter((p) => filterCategory === 'ALL' || (p.category || 'General') === filterCategory);
  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const activeCount = products.filter((p) => p.is_active).length;

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

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Shop Catalog &amp; Inventory Control
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Products Catalog
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Add, update, and manage shop products. Upload multi-angle photos, set stock levels, and toggle catalog visibility.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                {activeCount} active products &bull; <strong className="text-slate-900">{products.length} total</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-sm cursor-pointer active:scale-[0.98]">
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              Dashboard
            </Link>
            <button onClick={() => fetchProducts()} disabled={loading} className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-sm cursor-pointer active:scale-[0.98]" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Alert */}
        {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {[
            { label: 'Total Products', value: products.length, color: 'text-slate-900', iconBg: 'bg-emerald-50 border-emerald-100 text-[#009F6B]', icon: Boxes },
            { label: 'Active (In Shop)', value: activeCount, color: 'text-[#009F6B]', iconBg: 'bg-emerald-50 border-emerald-100 text-[#009F6B]', icon: Eye },
            { label: 'Total Inventory', value: `${totalStock} pcs`, color: 'text-slate-900', iconBg: 'bg-sky-50 border-sky-100 text-sky-600', icon: Package },
            { label: 'Low Stock (<5)', value: products.filter((p) => p.stock < 5).length, color: 'text-amber-600', iconBg: 'bg-amber-50 border-amber-100 text-amber-600', icon: Package },
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

        {/* ── SEARCH & CATEGORY FILTER ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-[#009F6B] text-white shadow-sm'
                    : 'bg-white/70 backdrop-blur-md border border-white/80 text-slate-600 hover:bg-white shadow-sm'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCTS TABLE ── */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100/80">
                <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <span className="text-sm">Loading product catalog…</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400 text-sm">
                      No products found. Click "Add Product" to get started.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const mainImg = p.images?.[0] ? getImgUrl(p.images[0]) : '';
                    return (
                      <tr key={p.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                              {mainImg ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={mainImg} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                              {(p.images?.length || 0) > 1 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold bg-black/60 text-white px-1 rounded">+{p.images.length - 1}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-900 block truncate max-w-[180px]">{p.name}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{p.description || 'No description'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-[#009F6B] text-sm">
                          ৳{Number(p.price).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                            p.stock === 0 ? 'bg-red-50 text-red-600 border border-red-100' :
                            p.stock < 5 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-slate-50 text-slate-700 border border-slate-100'
                          }`}>
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                              p.is_active
                                ? 'bg-emerald-50 border border-emerald-100 text-[#009F6B] hover:bg-emerald-100'
                                : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {p.is_active ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(p)} className="p-2 rounded-xl bg-white/80 border border-white/90 hover:border-slate-200 text-slate-500 hover:text-slate-800 transition-all shadow-sm">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-xl bg-white/80 border border-white/90 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all shadow-sm">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ADD / EDIT MODAL ── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-6 px-4 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
            <div className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_24px_64px_rgba(15,23,42,0.14)] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fill in product details, photos, and pricing.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input type="text" required placeholder="e.g. Wireless Noise-Cancelling Earbuds Pro" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 transition-all" />
                </div>

                {/* Price / Stock / Category */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Price (৳) *', key: 'price', type: 'number', placeholder: '1500' },
                    { label: 'Stock Qty *', key: 'stock', type: 'number', placeholder: '20' },
                    { label: 'Category', key: 'category', type: 'text', placeholder: 'Gadgets' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <input type={type} placeholder={placeholder} value={(formData as any)[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 transition-all" />
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea rows={3} placeholder="Describe key features, specs, and package contents…" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 resize-none transition-all" />
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Photos ({formData.images.length})</label>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImages}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 border border-slate-200/90 hover:border-[#009F6B]/40 text-xs font-semibold text-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#009F6B]" />
                    {uploadingImages ? 'Uploading…' : 'Upload Photos'}
                  </button>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 mt-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getImgUrl(img)} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-2.5 h-2.5" />
                          </button>
                          {idx === 0 && <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold bg-[#009F6B]/80 text-white px-1 rounded">Cover</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visibility */}
                <div className="flex items-center gap-3 pt-1">
                  <input type="checkbox" id="is_active_modal" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-[#009F6B] rounded" />
                  <label htmlFor="is_active_modal" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Visible in store catalog immediately
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200/90 text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#009F6B] hover:bg-[#008C5F] text-white shadow-md transition-all disabled:opacity-50 cursor-pointer">
                    {submitting ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_24px_64px_rgba(15,23,42,0.14)] rounded-3xl w-full max-w-md p-7 space-y-5">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete this product?</h3>
                <p className="text-sm text-slate-500 mt-1">This action is permanent and cannot be undone. The product will be removed from the store.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/80 border border-slate-200/90 text-slate-600">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
