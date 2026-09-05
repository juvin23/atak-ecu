import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, RefreshCw, Cpu, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ brands: [], types: [], years: [], models: [] });
  const [loading, setLoading] = useState(true);
  const [targetPhone, setTargetPhone] = useState('628123456789');

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetch('/api/products/meta/filters')
      .then(res => res.json())
      .then(data => setFilters(data))
      .catch(console.error);

    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(data => { if (data.whatsapp_number) setTargetPhone(data.whatsapp_number); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedBrand) params.append('brand', selectedBrand);
    if (selectedType) params.append('type', selectedType);
    if (selectedYear) params.append('year', selectedYear);
    if (selectedModel) params.append('model', selectedModel);
    if (sortBy) params.append('sort', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [search, selectedBrand, selectedType, selectedYear, selectedModel, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedType('');
    setSelectedYear('');
    setSelectedModel('');
    setSortBy('newest');
  };

  const hasActiveFilters = search || selectedBrand || selectedType || selectedYear || selectedModel || sortBy !== 'newest';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/60 p-8 sm:p-12 border border-slate-200 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <span>Official ATAK ECU 2000 Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            High-Performance <span className="bg-gradient-to-r from-brand-600 to-cyan-600 bg-clip-text text-transparent">ECU Modules</span> & Automotive Parts
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore genuine ATAK ECU 2000 standalone units, wiring harnesses, wideband controllers, and high-performance car components. Add items to your cart for direct WhatsApp consultation.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by part title, Ref No (e.g. ATAK-2000), model, or brand..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 text-sm shadow-md"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Filters & Sorting Bar */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filter Catalog</span>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-brand-700 text-xs font-semibold">
                Active Filters
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* Price Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-600 font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Brand Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Car / Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-600"
            >
              <option value="">All Brands</option>
              {filters.brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Type / Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Part Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-600"
            >
              <option value="">All Categories</option>
              {filters.types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Year Range
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-600"
            >
              <option value="">All Years</option>
              {filters.years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Model Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Vehicle Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-600"
            >
              <option value="">All Models</option>
              {filters.models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

        </div>

      </section>

      {/* Product Results Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{products.length}</span> published items
        </h2>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-96 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-sm" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <Cpu className="w-16 h-16 text-slate-300 mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all ATAK ECU 2000 products.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} targetPhone={targetPhone} />
          ))}
        </div>
      )}

    </div>
  );
}
