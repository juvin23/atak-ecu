import React from 'react';
import { ShieldCheck, MessageCircle, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-200">
          
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-blue-100 text-brand-600">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">ATAK ECU 2000 Genuine Parts</h4>
              <p className="text-xs text-slate-600 mt-1">Official standalone ECUs, tuning modules, and high-performance car components.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Direct WhatsApp Consult</h4>
              <p className="text-xs text-slate-600 mt-1">Instant part availability & technical fitment consultation directly with admin.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Quality Guaranteed</h4>
              <p className="text-xs text-slate-600 mt-1">Inspected, benchmarked, and safely packed with reference tracking.</p>
            </div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="ATAK ECU 2000" className="w-7 h-7 object-contain rounded" />
            <span className="font-semibold text-slate-800">ATAK ECU 2000 Catalog</span>
          </div>
          <p className="font-medium text-slate-700">
            copyright juvianto 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
