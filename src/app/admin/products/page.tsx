'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  X,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { Product, Category } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    is_available: true,
    is_featured: false,
    discount_percent: '0',
    display_order: '0',
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodRes.ok) setProducts(prodData.products || []);
      if (catRes.ok) setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      image_url: '',
      is_available: true,
      is_featured: false,
      discount_percent: '0',
      display_order: String(products.length + 1),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      price: String(product.price),
      description: product.description || '',
      image_url: product.image_url || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      discount_percent: String(product.discount_percent || 0),
      display_order: String(product.display_order || 0),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to upload image');
      }

      setFormData(prev => ({ ...prev, image_url: resData.url }));
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const nextStatus = !product.is_available;
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextStatus }),
      });
      if (res.ok) {
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, is_available: nextStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2027]">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block mb-1">
            Menu Catalog & Pricing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Food Products Management
          </h1>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            Create items, edit prices, upload photos, and toggle availability instantly.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111419] border border-[#20252e] flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full bg-[#181c22] border border-[#2a2f38] focus:border-[#ffc52f] rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[#181c22] border border-[#2a2f38] text-white rounded-xl px-3 py-2 text-xs outline-none w-full md:w-auto"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-[#111419] border border-[#20252e] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a22] text-[#8e8e8e] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Dish</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (PKR)</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Available</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e232b]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#888]">
                    Loading menu products from database...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#888]">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-[#161a22] transition-colors">
                    {/* Dish with thumbnail */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-[#262b35]">
                          {prod.image_url ? (
                            <Image src={prod.image_url} alt={prod.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-[#666]">
                              No Pic
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{prod.name}</span>
                          <span className="text-[11px] text-[#888] line-clamp-1">{prod.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-[#ccc]">
                      {prod.category_name}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-black text-[#ffc52f] text-sm">
                      Rs. {prod.price.toLocaleString('en-PK')}
                    </td>

                    {/* Discount */}
                    <td className="p-4">
                      {prod.discount_percent > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-400">
                          {prod.discount_percent}% OFF
                        </span>
                      ) : (
                        <span className="text-[#666]">—</span>
                      )}
                    </td>

                    {/* Availability toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailability(prod)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          prod.is_available
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {prod.is_available ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="p-4">
                      {prod.is_featured ? (
                        <span className="inline-flex items-center gap-1 text-[#ffc52f] font-bold text-xs">
                          <Flame className="w-3.5 h-3.5" /> Popular
                        </span>
                      ) : (
                        <span className="text-[#666]">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 rounded-lg bg-[#20252e] hover:bg-[#ffc52f] hover:text-black text-white transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg bg-[#20252e] hover:bg-red-600 text-white transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#121519] border border-[#272c36] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#212630]">
              <h2 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Food Product' : 'Add New Food Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#888] hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Crispy Lava Burger"
                  className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                    Price in PKR (Rs.) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="450"
                    className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl px-3 py-2 text-xs text-white outline-none font-bold text-[#ffc52f]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ingredients, taste profile, and preparation details..."
                  className="w-full bg-[#181c22] border border-[#2b303a] focus:border-[#ffc52f] rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#b5b5b5]">
                  Product Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Image URL or upload file below..."
                    className="flex-1 bg-[#181c22] border border-[#2b303a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-[#20252e] hover:bg-[#ffc52f] hover:text-black rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {formData.image_url && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#333] mt-2">
                    <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Discount & Display Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                    Discount % (0 for none)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#b5b5b5] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={e => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full bg-[#181c22] border border-[#2b303a] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={e => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 accent-[#ffc52f] rounded"
                  />
                  <span>Available for Order</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-[#ffc52f] rounded"
                  />
                  <span>Featured (Popular Badge)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#212630] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#ffc52f] to-[#e5a812] text-black hover:brightness-110 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
