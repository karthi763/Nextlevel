'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Save, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Gamepad2, 
  User, 
  MessageSquare, 
  Hash, 
  Check, 
  Sparkles,
  FileText
} from 'lucide-react';
import { storeService } from '@/lib/supabase';
import { Game, Invoice, InvoiceItem, StoreSettings } from '@/types';
import { toPng } from 'html-to-image';

function InvoiceGeneratorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoicePaperRef = useRef<HTMLDivElement>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  // Is Viewer Mode / Edit Mode
  const viewInvoiceId = searchParams.get('view');
  const editInvoiceId = searchParams.get('edit');

  // Customer Profile Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerDiscord, setCustomerDiscord] = useState('');
  const [customerUsername, setCustomerUsername] = useState('');
  
  // Invoice Items Builder State
  const [items, setItems] = useState<Array<{ gameId: string; quantity: number; price: number }>>([
    { gameId: '', quantity: 1, price: 0 }
  ]);
  
  // Tax / Discount Config
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST

  // Loaded Invoice for Viewer Mode
  const [loadedInvoice, setLoadedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    async function loadFormRequirements() {
      setLoading(true);
      try {
        const [fetchedGames, fetchedSettings] = await Promise.all([
          storeService.getGames(),
          storeService.getSettings()
        ]);
        setGames(fetchedGames);
        setSettings(fetchedSettings);

        if (fetchedSettings) {
          setTaxRate(0); // Default to 0% tax since reseller does not utilize GSTIN
        }

        // If we are in viewer mode, load the specific invoice
        if (viewInvoiceId) {
          const invoices = await storeService.getInvoices();
          const invoice = invoices.find(inv => inv.id === viewInvoiceId);
          if (invoice) {
            setLoadedInvoice(invoice);
          } else {
            router.replace('/admin/invoices');
          }
        }

        // If we are in edit mode, pre-populate form with invoice data
        if (editInvoiceId) {
          const invoices = await storeService.getInvoices();
          const invoice = invoices.find(inv => inv.id === editInvoiceId);
          if (invoice) {
            setLoadedInvoice(invoice);
            setCustomerName(invoice.customer_name);
            setCustomerDiscord(invoice.customer_discord);
            setCustomerUsername(invoice.customer_username || '');
            setDiscount(invoice.discount);
            setTaxRate(invoice.tax_rate);
            if (invoice.items && invoice.items.length > 0) {
              setItems(invoice.items.map(item => ({
                gameId: item.game_id,
                quantity: item.quantity,
                price: item.unit_price
              })));
            }
          } else {
            router.replace('/admin/invoices');
          }
        }
      } catch (e) {
        console.error('Failed to load invoice generator data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadFormRequirements();
  }, [viewInvoiceId, editInvoiceId, router]);

  const currencySymbol = settings?.currency_symbol || '₹';
  const currencyName = settings?.currency || 'INR';

  // Handle adding an item row
  const handleAddItemRow = () => {
    setItems(prev => [...prev, { gameId: '', quantity: 1, price: 0 }]);
  };

  // Handle removing an item row
  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handle row column updates
  const handleItemRowChange = (index: number, field: 'gameId' | 'quantity' | 'price', value: any) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'gameId') {
        updated[index].gameId = value;
        // Pre-populate price with selected game price
        const selectedGame = games.find(g => g.id === value);
        if (selectedGame) {
          updated[index].price = selectedGame.sale_price || selectedGame.price;
        }
      } else if (field === 'quantity') {
        updated[index].quantity = Math.max(1, Number(value));
      } else if (field === 'price') {
        updated[index].price = Math.max(0, Number(value));
      }
      return updated;
    });
  };

  // Dynamic calculations for subtotal, tax, and grand totals
  const billingSummary = useMemo(() => {
    if (viewInvoiceId && loadedInvoice) {
      const subtotal = loadedInvoice.items?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0;
      const discount = loadedInvoice.discount;
      const taxable = Math.max(0, subtotal - discount);
      const tax = taxable * (loadedInvoice.tax_rate / 100);
      const total = taxable + tax;
      
      return { subtotal, discount, tax, total, taxRate: loadedInvoice.tax_rate };
    }

    // Dynamic builder calculations
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (taxRate / 100);
    const total = taxable + tax;

    return { subtotal, discount, tax, total, taxRate };
  }, [items, discount, taxRate, viewInvoiceId, loadedInvoice]);

  // Submit invoice generator handler
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);

    // Form Validations
    if (!customerName.trim() || !customerDiscord.trim()) {
      setErrorState('Please fill in Customer Name and Discord ID.');
      return;
    }

    const invalidItems = items.filter(i => !i.gameId);
    if (invalidItems.length > 0) {
      setErrorState('Please select games for all added items.');
      return;
    }

    setSaving(true);

    const invoiceItemsPayload = items.map(item => {
      const matchingGame = games.find(g => g.id === item.gameId)!;
      return {
        game_id: item.gameId,
        quantity: item.quantity,
        unit_price: item.price,
        // UI fallback
        game_title: matchingGame.title
      };
    });

    const invoicePayload = {
      id: editInvoiceId || undefined,
      customer_name: customerName.trim(),
      customer_discord: customerDiscord.trim(),
      customer_username: customerUsername.trim() || undefined,
      discount: Number(discount),
      tax_rate: Number(taxRate),
      total_amount: billingSummary.total,
      items: invoiceItemsPayload
    };

    try {
      const saved = await storeService.saveInvoice(invoicePayload);
      router.push(`/admin/invoices/new?view=${saved.id}`);
    } catch (e: any) {
      console.error(e);
      setErrorState('Failed to submit and store invoice.');
    } finally {
      setSaving(false);
    }
  };

  const [errorState, setErrorState] = useState<string | null>(null);

  // Trigger browser print dialog for the invoice
  const triggerPrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Download Invoice as PNG using html-to-image
  const downloadPng = async () => {
    if (!invoicePaperRef.current) return;
    setDownloadingPng(true);
    try {
      const dataUrl = await toPng(invoicePaperRef.current, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        style: {
          transform: 'scale(1)',
          borderRadius: '0',
          boxShadow: 'none'
        }
      });
      const link = document.createElement('a');
      const invNum = viewInvoiceId && loadedInvoice ? loadedInvoice.invoice_number : 'NLS-DRAFT';
      link.download = `Invoice-${invNum}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to export PNG:', e);
      alert('PNG download failed! Try printing to PDF instead.');
    } finally {
      setDownloadingPng(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Gathering invoicing assets...</span>
        </div>
      </div>
    );
  }

  // Print-only CSS layout injection
  const printStyle = `
    @media print {
      body * {
        visibility: hidden;
        background: white !important;
        color: black !important;
      }
      #print-area-wrapper, #print-area-wrapper * {
        visibility: visible;
      }
      #print-area-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        box-shadow: none !important;
        border: none !important;
        background: white !important;
        color: black !important;
      }
      nav, aside, header, footer, button, .no-print {
        display: none !important;
      }
    }
  `;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Print CSS style tag */}
      <style>{printStyle}</style>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-950/40 pb-6 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/invoices')}
            className="p-2 rounded-lg border border-purple-500/20 bg-purple-950/20 text-purple-300 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase">
              {viewInvoiceId ? `BILL VIEWER: ${loadedInvoice?.invoice_number}` : editInvoiceId ? 'EDIT INVOICE' : 'INVOICE BUILDER'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {viewInvoiceId 
                ? 'View customer details, total billing summary, and download copies.' 
                : editInvoiceId 
                  ? 'Modify issued wholesale receipt details, products and discounts.' 
                  : 'Manually issue wholesale bills for digital games.'}
            </p>
          </div>
        </div>

        {/* Toolbar export controls */}
        {viewInvoiceId && loadedInvoice && (
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={triggerPrint}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-black bg-white hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              onClick={downloadPng}
              disabled={downloadingPng}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white border border-purple-500/30 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-400 transition-all cursor-pointer"
            >
              {downloadingPng ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 text-purple-400" />
                  Save PNG Graphic
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {errorState && (
        <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/15 text-red-400 text-xs font-semibold no-print">
          {errorState}
        </div>
      )}

      {/* Main double column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* A. LEFT COLUMN: GENERATOR INPUT FORMS (Hidden in viewer mode) */}
        {!viewInvoiceId && (
          <form onSubmit={handleSaveInvoice} className="xl:col-span-6 flex flex-col gap-6 no-print">
            
            {/* Customer profile */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/50 flex flex-col gap-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2 flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-cyan-400" />
                Customer Profile
              </h3>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Customer Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Discord ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Customer Discord ID *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. johndoe#1234"
                    value={customerDiscord}
                    onChange={(e) => setCustomerDiscord(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">In-game Username (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. john_gamer"
                    value={customerUsername}
                    onChange={(e) => setCustomerUsername(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

              </div>

            </div>

            {/* Invoiced items list builder */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/50 flex flex-col gap-5">
              
              <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 className="h-4.5 w-4.5 text-purple-400" />
                  Billable Line Items
                </h3>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-300 tracking-wider bg-cyan-950/30 px-2.5 py-1 rounded border border-cyan-500/20 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Line Item
                </button>
              </div>

              {/* Items List Rows */}
              <div className="flex flex-col gap-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-center gap-3 p-4.5 rounded-xl border border-purple-950/50 bg-[#080521]/20">
                    
                    {/* Game Selector */}
                    <div className="flex flex-col gap-1 w-full sm:flex-grow">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Select Game *</label>
                      <select
                        value={item.gameId}
                        onChange={(e) => handleItemRowChange(index, 'gameId', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-purple-900/30 bg-black/40 text-xs text-white focus:outline-none cursor-pointer w-full"
                      >
                        <option value="">-- Choose game from database --</option>
                        {games.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.title} ({g.platform}) - {currencySymbol}{g.sale_price || g.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Price override */}
                      <div className="flex flex-col gap-1 w-full sm:w-24">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Unit Price</label>
                        <input 
                          type="number"
                          min="0"
                          value={item.price || ''}
                          onChange={(e) => handleItemRowChange(index, 'price', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-purple-900/30 bg-black/40 text-xs text-white focus:outline-none"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="flex flex-col gap-1 w-full sm:w-16">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                        <input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemRowChange(index, 'quantity', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-purple-900/30 bg-black/40 text-xs text-white focus:outline-none text-center"
                        />
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        disabled={items.length === 1}
                        className="p-2.5 rounded-lg border border-red-950/20 bg-red-950/5 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 mt-4 sm:mt-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Discount & Taxes row */}
              <div className="grid grid-cols-2 gap-4 border-t border-purple-950/40 pt-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Discount ({currencySymbol})</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Tax Rate (Percentage %)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="18"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="px-4 py-2.5 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Save invoice actions */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-xl font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest text-xs"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  {editInvoiceId ? 'Save Invoice Changes' : 'Submit & Log Invoice'}
                </>
              )}
            </button>

          </form>
        )}

        {/* B. RIGHT COLUMN: INVOICE PAPER PREVIEW */}
        <div className={`xl:col-span-6 flex flex-col items-center justify-center w-full ${viewInvoiceId ? 'xl:col-span-8 xl:col-start-3' : ''}`}>
          
          {/* Visual Indicator of sheet size */}
          {!viewInvoiceId && (
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1 no-print">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Invoice Sheet Preview (Reflected live)
            </span>
          )}

          {/* THE PAPER SHEET CONTAINER */}
          <div 
            id="print-area-wrapper"
            ref={invoicePaperRef}
            className="w-full max-w-[800px] aspect-[1/1.414] bg-white text-gray-800 p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-purple-950/20 rounded-lg flex flex-col justify-between"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            
            {/* 1. PAPER HEADER */}
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-start border-b-2 border-purple-900/20 pb-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-purple-950 overflow-hidden p-0.5 shadow-sm">
                      <img src="/logo.png" alt="Brand Logo" className="h-9 w-9 object-contain" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-purple-950">
                      {settings?.store_name || 'Next Level Store'}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-500 tracking-wider leading-relaxed max-w-xs font-medium">
                    Reseller: {settings?.support_email || 'support@nextlevelstore.com'}
                  </span>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <span className="text-2xl font-black text-purple-950 tracking-wider">INVOICE</span>
                  <span className="text-[10px] font-bold text-cyan-500 font-mono tracking-widest uppercase mt-0.5">
                    {loadedInvoice ? loadedInvoice.invoice_number : 'NLS-DRAFT-RECEIPT'}
                  </span>
                  <span className="text-[9px] text-gray-500 mt-1 font-medium">
                    Date: {loadedInvoice?.created_at 
                      ? new Date(loadedInvoice.created_at).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>              {/* Customer Details Row */}
              <div className="grid grid-cols-2 gap-8 bg-purple-950/5 p-4 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-purple-900 tracking-widest">Billed To:</span>
                  <span className="text-xs font-black text-purple-950">
                    {viewInvoiceId && loadedInvoice ? loadedInvoice.customer_name : (customerName || 'Customer Name')}
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <span className="text-[10px] text-gray-600 font-semibold flex items-center gap-1">
                      <span className="font-bold text-[9px] text-purple-900">Discord:</span>
                      {viewInvoiceId && loadedInvoice ? loadedInvoice.customer_discord : (customerDiscord || 'johndoe#1234')}
                    </span>
                    {(viewInvoiceId && loadedInvoice?.customer_username || customerUsername) && (
                      <span className="text-[10px] text-gray-600 font-semibold flex items-center gap-1">
                        <span className="font-bold text-[9px] text-cyan-600">Username:</span>
                        {viewInvoiceId && loadedInvoice ? loadedInvoice.customer_username : customerUsername}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-right items-end justify-center">
                  <span className="text-[9px] uppercase font-bold text-cyan-600 tracking-widest">Reseller Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase tracking-wider border border-emerald-200">
                    Paid In Full
                  </span>
                </div>
              </div>

              {/* Items Table sheet */}
              <table className="w-full text-left mt-4">
                <thead>
                  <tr className="border-b border-purple-900/20 text-purple-900 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5">Item Description / Platform</th>
                    <th className="py-2.5 text-right w-16">Qty</th>
                    <th className="py-2.5 text-right w-24">Unit Rate</th>
                    <th className="py-2.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/5 text-xs text-gray-800">
                  {viewInvoiceId && loadedInvoice ? (
                    loadedInvoice.items?.map((item, index) => (
                      <tr key={item.id || index} className="py-3">
                        <td className="py-3 font-extrabold text-purple-950">
                          {item.game_title || 'Digital Game Code'}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold">{item.quantity}</td>
                        <td className="py-3 text-right font-mono">{currencySymbol}{item.unit_price}</td>
                        <td className="py-3 text-right font-mono font-bold text-purple-950">
                          {currencySymbol}{(item.unit_price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    items.map((item, index) => {
                      const selGame = games.find(g => g.id === item.gameId);
                      return (
                        <tr key={index} className="py-3">
                          <td className="py-3 font-extrabold text-purple-950">
                            {selGame ? `${selGame.title} (${selGame.platform})` : 'Unselected Digital Game Code'}
                          </td>
                          <td className="py-3 text-right font-mono font-semibold">{item.quantity}</td>
                          <td className="py-3 text-right font-mono">{currencySymbol}{item.price}</td>
                          <td className="py-3 text-right font-mono font-bold text-purple-950">
                            {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

            </div>

            {/* 2. PAPER FOOTER & TOTALS SUMMARY */}
            <div className="flex flex-col gap-6 border-t-2 border-purple-900/10 pt-6 mt-8">
              
              <div className="flex justify-between items-start gap-8">
                
                {/* Notes Column */}
                <div className="flex flex-col gap-2 max-w-xs">
                  <span className="text-[9px] uppercase font-bold text-purple-900 tracking-wider">Terms & Notes:</span>
                  <p className="text-[9px] text-gray-500 leading-normal font-light">
                    {settings?.invoice_footer || 'Thank you for shopping with Next Level Store. Happy Gaming!'}
                  </p>
                </div>

                {/* Subtotals Block */}
                <div className="flex flex-col gap-2 w-48 shrink-0">
                  
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{currencySymbol}{billingSummary.subtotal.toLocaleString()}</span>
                  </div>

                  {billingSummary.discount > 0 && (
                    <div className="flex justify-between text-[10px] text-red-600 font-medium">
                      <span>Discount Given:</span>
                      <span>-{currencySymbol}{billingSummary.discount}</span>
                    </div>
                  )}

                  {billingSummary.taxRate > 0 && (
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>GST ({billingSummary.taxRate}%):</span>
                      <span>{currencySymbol}{billingSummary.tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-black text-purple-950 border-t border-purple-900/10 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-sm font-extrabold text-cyan-600">
                      {currencySymbol}{billingSummary.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                </div>

              </div>

              {/* Trust disclaimer */}
              <div className="text-center text-[8px] text-gray-400 font-light border-t border-purple-900/5 pt-4">
                This is a digitally issued reseller receipt. All keys and codes correspond to legal global distribution. Happy Gaming!
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default function InvoiceGenerator() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-32 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading Invoicing Suite...</span>
        </div>
      </div>
    }>
      <InvoiceGeneratorContent />
    </Suspense>
  );
}
