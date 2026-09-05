import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageCircle, CheckCircle2, Cpu } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, generateSingleProductWhatsAppUrl } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [targetPhone, setTargetPhone] = useState('628123456789');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found or not published.');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].image_url);
        } else if (data.primary_image) {
          setActiveImage(data.primary_image);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(data => { if (data.whatsapp_number) setTargetPhone(data.whatsapp_number); })
      .catch(console.error);
  }, [id]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-pulse space-y-8">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 bg-slate-200 rounded-xl" />
            <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center bg-white p-12 rounded-3xl space-y-4 border border-slate-200 shadow-sm">
        <Cpu className="w-16 h-16 text-rose-500 mx-auto stroke-1" />
        <h2 className="text-xl font-bold text-slate-900">Part Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested product detail is unavailable.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>
      </div>
    );
  }

  const directWaUrl = generateSingleProductWhatsAppUrl(product, targetPhone);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      
      {/* Back Button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Full ATAK ECU 2000 Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            {activeImage ? (
              <img 
                src={activeImage} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <Cpu className="w-16 h-16 stroke-1 mb-2 opacity-40 text-slate-500" />
                <span className="text-xs font-mono text-slate-500">No Image Uploaded</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-brand-700 border border-brand-200 text-xs font-bold uppercase tracking-wider shadow-sm">
                {product.brand}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === img.image_url ? 'border-brand-600 scale-105 shadow-md' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <span className="text-brand-600 font-bold uppercase">{product.type}</span>
                <span>•</span>
                <span className="text-slate-800 font-bold">REF: {product.ref_no}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Price Tag */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">Catalog Price</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock & Ready</span>
              </div>
            </div>

            {/* Product Specifications Grid */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technical Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Manufacturer / Brand:</span>
                  <span className="font-bold text-slate-900">{product.brand}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category Type:</span>
                  <span className="font-bold text-slate-900">{product.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Reference No (SKU):</span>
                  <span className="font-mono font-bold text-brand-600">{product.ref_no}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Compatible Model:</span>
                  <span className="font-bold text-slate-900">{product.model}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Compatible Year Range:</span>
                  <span className="font-bold text-slate-900">{product.year}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Description</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {product.description || 'No detailed description available for this catalog entry.'}
              </p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button
              onClick={() => addToCart(product)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Cart</span>
            </button>

            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat Admin via WhatsApp</span>
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}
