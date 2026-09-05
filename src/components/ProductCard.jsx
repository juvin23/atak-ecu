import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle, Eye, Calendar, Cpu } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, targetPhone = '628123456789' }) {
  const { addToCart, generateSingleProductWhatsAppUrl } = useCart();

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const directWaUrl = generateSingleProductWhatsAppUrl(product, targetPhone);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden glass-panel-hover flex flex-col justify-between h-full border border-slate-200 shadow-sm">
      
      {/* Top Image Section */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          {product.primary_image ? (
            <img 
              src={product.primary_image} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
              <Cpu className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-slate-500" />
              <span className="text-xs font-mono text-slate-500">No Image</span>
            </div>
          )}
        </Link>

        {/* Brand & Ref No Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-brand-700 border border-brand-200 text-xs font-bold uppercase tracking-wider shadow-sm">
            {product.brand}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 text-white text-[11px] font-mono shadow-sm">
            REF: {product.ref_no}
          </span>
        </div>

        {/* Quick Overlay Action */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <Link
            to={`/products/${product.id}`}
            className="p-3 rounded-full bg-white text-slate-900 hover:bg-brand-600 hover:text-white transition-colors shadow-lg transform hover:scale-110"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Model info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="text-brand-600 font-bold uppercase tracking-wide">{product.type}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              {product.year}
            </span>
          </div>

          <Link to={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            Compatible: <span className="text-slate-800 font-semibold">{product.model}</span>
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-lg font-extrabold text-slate-900 tracking-tight mb-3">
            {formatPrice(product.price)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <a
              href={directWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
              title="Chat Admin on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ask WA</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
