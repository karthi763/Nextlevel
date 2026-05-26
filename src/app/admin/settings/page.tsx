'use client';

import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Terminal, Mail, Phone, DollarSign, FileText } from 'lucide-react';
import { storeService } from '../../../lib/supabase';
import { StoreSettings } from '../../../types';

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [invoiceFooter, setInvoiceFooter] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await storeService.getSettings();
        if (settings) {
          setStoreName(settings.store_name);
          setWhatsappNumber(settings.whatsapp_number);
          setSupportEmail(settings.support_email);
          setInvoiceFooter(settings.invoice_footer || '');
          setCurrency(settings.currency);
          setCurrencySymbol(settings.currency_symbol);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    if (!storeName.trim() || !whatsappNumber.trim() || !supportEmail.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const settingsPayload: StoreSettings = {
      store_name: storeName.trim(),
      whatsapp_number: whatsappNumber.trim(),
      support_email: supportEmail.trim(),
      invoice_footer: invoiceFooter.trim() || undefined,
      currency: currency.trim().toUpperCase(),
      currency_symbol: currencySymbol.trim()
    };

    try {
      await storeService.saveSettings(settingsPayload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000); // clear banner after 4s
    } catch (e: any) {
      setError(e.message || 'Failed to save settings to database.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Fetching store configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="border-b border-purple-950/40 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">STORE SETTINGS</h1>
        <p className="text-xs text-gray-500 mt-1">Configure default metadata, business identity, invoices headers, and WhatsApp triggers.</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-950/15 text-emerald-400 text-xs font-semibold">
          Store settings successfully updated! (Changes applied globally)
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/15 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 flex flex-col gap-6 glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/50">
          
          {/* Section 1: Business Identity */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2">Business Profile</h3>
            
            {/* Store name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Showcase Store Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Next Level Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* WhatsApp Support Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">WhatsApp Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. +919876543210 (include country code)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <span className="text-[10px] text-gray-500 leading-normal">This is where buy inquiries and "Contact WhatsApp" buttons redirect users.</span>
              </div>

              {/* Support Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Support Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="email"
                    required
                    placeholder="support@nextlevelstore.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Invoice default configs */}
          <div className="flex flex-col gap-5 mt-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2">Default Invoice Settings</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Currency identifier */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Currency ID</label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text"
                    required
                    placeholder="INR"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all uppercase"
                  />
                </div>
              </div>

              {/* Currency Symbol */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Currency Symbol</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text"
                    required
                    placeholder="₹"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Invoice default footer */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Invoice Footer Note</label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                <textarea 
                  rows={3}
                  placeholder="Thank you for shopping with Next Level Store. Happy Gaming!"
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Actions & Previews */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-purple-950/50 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2">Apply Configurations</h3>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs"
            >
              {loading ? (
                <div className="h-4.5 w-4.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Save Store Settings
                </>
              )}
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-purple-950/50 flex flex-col gap-4">
            <span className="font-bold text-white text-xs uppercase tracking-wider">Reseller Notes:</span>
            <p className="text-[11px] text-gray-500 leading-relaxed font-light">
              Default billing settings are automatically loaded into the **Invoice Generator** upon creation, helping you issue receipts to customers in seconds.
            </p>
          </div>
        </div>

      </form>

    </div>
  );
}
