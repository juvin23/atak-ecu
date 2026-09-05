import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminProductsManager() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    ref_no: '',
    brand: '',
    type: '',
    year: '',
    model: '',
    status: 'draft'
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAdminProducts = () => {
    setLoading(true);
    fetch('/api/admin/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAdminProducts();
  }, [token]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      ref_no: '',
      brand: 'ATAK ECU 2000',
      type: 'ECU & Electronics',
      year: '',
      model: '',
      status: 'draft'
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      ref_no: product.ref_no,
      brand: product.brand,
      type: product.type,
      year: product.year,
      model: product.model,
      status: product.status
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setMessage('');

    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const savedProduct = await res.json();
      if (!res.ok) throw new Error(savedProduct.error || 'Failed to save product.');

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadData = new FormData();
        Array.from(selectedFiles).forEach(file => {
          uploadData.append('photos', file);
        });

        await fetch(`/api/admin/products/${savedProduct.id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData
        });
        setUploading(false);
      }

      setIsModalOpen(false);
      fetchAdminProducts();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product and all associated images?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleImageStatus = async (imageId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/admin/images/${imageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await fetch(`/api/admin/images/${imageId}/primary`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image file?')) return;
    try {
      await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">ATAK ECU 2000 Product Management</h2>
          <p className="text-xs text-slate-500">Manage catalog products, upload photos in draft state, and publish items.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-white animate-pulse border border-slate-200" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-4">Part / Image</th>
                  <th className="p-4">Ref No / Brand</th>
                  <th className="p-4">Type / Model</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Product Status</th>
                  <th className="p-4">Photos (Draft vs Pub)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                          {p.primary_image ? (
                            <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                              No Cover
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 max-w-xs truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-500">{p.year}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="text-brand-600 font-bold">{p.ref_no}</div>
                      <div className="text-slate-500 font-sans text-[11px] font-medium">{p.brand}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-900 font-bold">{p.type}</div>
                      <div className="text-slate-500 text-[11px]">{p.model}</div>
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      Rp {p.price.toLocaleString('id-ID')}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        p.status === 'published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {p.images && p.images.length > 0 ? (
                          p.images.map(img => (
                            <div key={img.id} className="relative group/img">
                              <img src={img.image_url} alt="" className="w-8 h-8 rounded object-cover border border-slate-200 shadow-xs" />
                              
                              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                                img.status === 'published' ? 'bg-emerald-500 ring-2 ring-white' : 'bg-amber-500 ring-2 ring-white'
                              }`} title={img.status === 'published' ? 'Published Photo' : 'Draft Photo'} />

                              <div className="absolute inset-0 bg-slate-900/80 rounded opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                <button
                                  onClick={() => handleToggleImageStatus(img.id, img.status)}
                                  className="text-white hover:text-brand-300"
                                  title={img.status === 'published' ? 'Unpublish to Draft' : 'Publish Photo'}
                                >
                                  {img.status === 'published' ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                                </button>
                                <button
                                  onClick={() => handleSetPrimaryImage(img.id)}
                                  className={`text-white ${img.is_primary ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
                                  title="Set Cover"
                                >
                                  <Star className="w-3 h-3 fill-current" />
                                </button>
                                <button
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="text-rose-400 hover:text-rose-300"
                                  title="Delete Photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                            </div>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No images</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                          title="Edit Product Details & Manage Photos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-3xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingProduct ? 'Edit ATAK Product & Photos' : 'Add New ATAK ECU 2000 Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. ATAK ECU 2000 Standalone Module"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ref No (SKU)</label>
                  <input
                    type="text"
                    required
                    value={formData.ref_no}
                    onChange={e => setFormData({ ...formData, ref_no: e.target.value })}
                    placeholder="e.g. ATAK-2000-PRO"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. ATAK ECU 2000"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. ECU & Electronics"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year</label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g. 2018-2024"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Universal / Civic"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (IDR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 14500000"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Visibility</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 font-semibold"
                  >
                    <option value="draft">Draft (Hidden from basic users)</option>
                    <option value="published">Published (Visible on catalog)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed part specification..."
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5"
                />
              </div>

              {/* Photo Upload Box */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Upload Product Photos (Saves as Draft by Default)
                </label>
                
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => setSelectedFiles(e.target.files)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-700 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 italic">
                  Photos uploaded by admin start in draft state. Once uploaded, click the publish icon on the image thumbnail to make it visible to basic users.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md"
                >
                  {uploading ? 'Uploading Photos...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
