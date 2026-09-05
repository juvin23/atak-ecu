import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, LogOut, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { getCartCount, setIsCartOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const cartCount = getCartCount();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white p-0.5 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo.jpg" 
              alt="ATAK ECU 2000" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              ATAK ECU <span className="text-brand-600 font-black">2000</span>
            </span>
            <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
              Official Parts & Tuning Catalog
            </span>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          
          {/* Admin Status / Quick Nav */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Admin ({user?.username})</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/admin/login'); }}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md text-sm transition-all duration-300 active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
