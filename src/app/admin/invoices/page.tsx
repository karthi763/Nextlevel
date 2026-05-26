'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  MessageSquare,
  Hash,
  Info 
} from 'lucide-react';
import { storeService } from '../../../lib/supabase';
import { Invoice, StoreSettings } from '../../../types';

export default function AdminInvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const [fetchedInvoices, fetchedSettings] = await Promise.all([
          storeService.getInvoices(),
          storeService.getSettings()
        ]);
        setInvoices(fetchedInvoices);
        setSettings(fetchedSettings);
      } catch (e) {
        console.error('Failed to load invoices:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, []);

  const currencySymbol = settings?.currency_symbol || '₹';

  const filteredInvoices = invoices.filter(inv => 
    inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.customer_discord && inv.customer_discord.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (inv.customer_username && inv.customer_username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Gathering billing records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-950/40 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">MANAGE INVOICES</h1>
          <p className="text-xs text-gray-500 mt-1">Review all digital receipts, total order amounts, discounts, and print bills.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create New Invoice
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-500 shrink-0" />
        <input 
          type="text"
          placeholder="Search bills by invoice number, customer name or contact number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white">Clear</button>
        )}
      </div>

      {/* Invoice Records Listing */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-purple-950/50">
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-purple-400" />
              <span>No invoice logs available. Create a new invoice above!</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-950/70 bg-purple-950/20 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Invoice #</th>
                  <th className="py-4.5 px-6">Buyer Details</th>
                  <th className="py-4.5 px-6">Created Date</th>
                  <th className="py-4.5 px-6">Discount Applied</th>
                  <th className="py-4.5 px-6">Total Bill</th>
                  <th className="py-4.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-sm text-gray-300">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-purple-950/10 transition-colors">
                    
                    {/* Invoice Number */}
                    <td className="py-4 px-6 font-bold text-white tracking-wide">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <span>{inv.invoice_number}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-white text-xs flex items-center gap-1">
                          <User className="h-3 w-3 text-cyan-400" />
                          {inv.customer_name}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-purple-400" />
                          <span className="text-purple-400 font-bold text-[9px] uppercase">Discord:</span>
                          <span className="font-mono text-gray-300">{inv.customer_discord}</span>
                        </span>
                        {inv.customer_username && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Hash className="h-3 w-3 text-cyan-400" />
                            <span className="text-cyan-400 font-bold text-[9px] uppercase">Username:</span>
                            <span className="font-mono text-gray-300">{inv.customer_username}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6">
                      <span className="text-xs text-gray-400 font-medium">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-6 text-xs font-semibold text-gray-400">
                      {inv.discount > 0 ? (
                        <span className="text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/30">
                          -{currencySymbol}{inv.discount}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    {/* Total Bill */}
                    <td className="py-4 px-6 font-extrabold text-cyan-400">
                      {currencySymbol}{inv.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    {/* Print Quick View Link */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <Link
                          href={`/admin/invoices/new?view=${inv.id}`}
                          className="px-3.5 py-1.5 rounded-lg border border-purple-500/20 bg-purple-950/20 text-purple-300 hover:text-black hover:bg-cyan-400 hover:border-cyan-400 transition-all text-xs font-bold flex items-center gap-1.5"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print / Save
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
