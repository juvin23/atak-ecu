import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ExternalLink, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AdminSettingsManager() {
  const { token } = useAuth();
  const { fetchWaConfig } = useCart();
  
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [cartTemplate, setCartTemplate] = useState('');
  const [singleTemplate, setSingleTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch('/api/settings/whatsapp')
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
        if (data.whatsapp_cart_template) setCartTemplate(data.whatsapp_cart_template);
        if (data.whatsapp_single_template) setSingleTemplate(data.whatsapp_single_template);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          whatsapp_number: whatsappNumber,
          whatsapp_cart_template: cartTemplate,
          whatsapp_single_template: singleTemplate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update WhatsApp configuration.');

      setWhatsappNumber(data.whatsapp_number);
      setCartTemplate(data.whatsapp_cart_template);
      setSingleTemplate(data.whatsapp_single_template);
      fetchWaConfig();
      setMessage({ type: 'success', text: 'Target phone number & custom WhatsApp message templates saved!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Preview Message Builders
  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  
  const sampleCartMessage = `${cartTemplate || 'Hai admin, mau bertanya terkait barang-barang berikut ini :'}\n- ATAK ECU 2000 Pro Standalone ECU | Civic FK8 | ATAK-2000-PRO\n- Brembo GT 6-Piston Big Brake Kit | M3 / M4 | BM-GT6P-380`;
  const sampleCartUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleCartMessage)}`;

  const sampleSingleMessage = `${singleTemplate || 'Hai admin, mau bertanya terkait barang berikut ini :'}\n- ATAK ECU 2000 Pro Standalone ECU | Civic FK8 | ATAK-2000-PRO`;
  const sampleSingleUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(sampleSingleMessage)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Left Column: Form Settings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">WhatsApp Integration & Custom Messages</h2>
          <p className="text-xs text-slate-500">
            Customize target phone number and automated message header templates sent when customers click WhatsApp checkout.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
            message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="h-64 rounded-2xl bg-white animate-pulse border border-slate-200" />
        ) : (
          <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            
            {/* Target Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target WhatsApp Phone Number (With Country Code)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 628123456789"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-brand-600 font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Country code without leading zero or plus (e.g. <span className="font-mono text-slate-800 font-bold">628123456789</span>).
              </p>
            </div>

            {/* Custom Cart Header Template */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Cart Checkout Message Header
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows="2"
                  required
                  value={cartTemplate}
                  onChange={e => setCartTemplate(e.target.value)}
                  placeholder="e.g. Hai admin, mau bertanya terkait barang-barang berikut ini :"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-brand-600 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                This custom greeting header appears at the top of multi-item cart WhatsApp inquiries.
              </p>
            </div>

            {/* Custom Single Product Header Template */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Custom Single Product Message Header
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows="2"
                  required
                  value={singleTemplate}
                  onChange={e => setSingleTemplate(e.target.value)}
                  placeholder="e.g. Hai admin, mau bertanya terkait barang berikut ini :"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-brand-600 font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                This custom greeting header appears at the top of direct single-product WhatsApp inquiries.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save WhatsApp Configuration & Messages'}</span>
            </button>

          </form>
        )}
      </div>

      {/* Right Column: Live Interactive Message Previews */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h3>Live WhatsApp Message Previews</h3>
        </div>

        {/* Cart Preview Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Multi-Item Cart Checkout Message</span>
            <a
              href={sampleCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline font-bold flex items-center gap-1"
            >
              <span>Test Cart WA Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
            {sampleCartMessage}
          </div>
        </div>

        {/* Single Product Preview Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Single Product Direct Inquiry Message</span>
            <a
              href={sampleSingleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:underline font-bold flex items-center gap-1"
            >
              <span>Test Single WA Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 font-mono text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
            {sampleSingleMessage}
          </div>
        </div>

      </div>

    </div>
  );
}
