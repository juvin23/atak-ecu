import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdminProductsManager from '../components/AdminProductsManager';
import AdminUsersManager from '../components/AdminUsersManager';
import AdminSettingsManager from '../components/AdminSettingsManager';

export default function AdminDashboardPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-sm flex items-center justify-center">
            <img src="/logo.jpg" alt="ATAK ECU 2000" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">ATAK ECU 2000 Admin Control Center</h1>
            <p className="text-xs text-slate-500 font-medium">Logged in as <span className="text-brand-600 font-bold">{user?.username}</span></p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'products'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Photos</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'users'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Admin Users</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'settings'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>WhatsApp Target</span>
        </button>

      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'products' && <AdminProductsManager />}
        {activeTab === 'users' && <AdminUsersManager />}
        {activeTab === 'settings' && <AdminSettingsManager />}
      </div>

    </div>
  );
}
