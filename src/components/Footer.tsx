'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Mail, Phone, Cpu } from 'lucide-react';
import { storeService } from '../lib/supabase';
import { StoreSettings } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    storeService.getSettings().then(setSettings);
  }, []);

  const storeName = settings?.store_name || 'Next Level Store';
  const whatsapp = settings?.whatsapp_number || '+919037609081';
  const email = settings?.support_email || 'support@nextlevelstore.com';

  return (
    <footer className="border-t border-purple-950/80 bg-[#030014]/90 text-gray-400 py-12 mt-auto no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-max">
              <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-purple-900/20 border border-purple-500/20 overflow-hidden p-0.5">
                <img src="/logo.png" alt="Brand Logo" className="h-7 w-7 object-contain" />
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-gray-400/80 leading-relaxed max-w-sm">
              Your premium destination for buying premium digital games, gift cards, offline access, and online accounts. Safe, lightning fast, and at unbeatable reseller pricing.
            </p>
            
            {/* Social Icons (Discord + Instagram) */}
            <div className="flex items-center gap-3.5 mt-2">
              <a
                href="https://discord.gg/TUkyptCNJ2"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-400 hover:text-white hover:border-indigo-400 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all"
                title="Join our Discord Server"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.07-11.55,67.66,67.66,0,0,1-11.14-5.32c.94-.69,1.84-1.39,2.69-2.1a75.52,75.52,0,0,0,73.1,0c.85.71,1.75,1.41,2.69,2.1a67.66,67.66,0,0,1-11.14,5.32,77.7,77.7,0,0,0,7.07,11.55,105.73,105.73,0,0,0,31.54-18.83C128.79,48.24,122.9,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/next_level_store_/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-400 hover:text-white hover:border-purple-400 hover:shadow-[0_0_10px_rgba(167,139,250,0.3)] transition-all"
                title="Follow our Instagram"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-sm tracking-wider uppercase">Quick Links</span>
            <Link href="/" className="hover:text-cyan-400 text-sm transition-colors">Home Showcase</Link>
            <Link href="/games" className="hover:text-cyan-400 text-sm transition-colors">Catalog / Search</Link>
          </div>

          {/* Catalog Categories */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-sm tracking-wider uppercase">Categories</span>
            <Link href="/games?category=steam" className="hover:text-cyan-400 text-sm transition-colors">Steam Games</Link>
            <Link href="/games?category=online" className="hover:text-cyan-400 text-sm transition-colors">Online & Multiplayer</Link>
            <Link href="/games?category=offline" className="hover:text-cyan-400 text-sm transition-colors">Offline Singleplayer</Link>
            <Link href="/games?category=premium-accounts" className="hover:text-cyan-400 text-sm transition-colors">Premium Accounts</Link>
          </div>

          {/* Support Information */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-sm tracking-wider uppercase">Need Assistance?</span>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
              <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                {whatsapp} (WhatsApp Support)
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-purple-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-cyan-400 transition-colors">{email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Cpu className="h-4 w-4 text-purple-600 shrink-0" />
              <span>Instant Digital Delivery</span>
            </div>
          </div>
        </div>

        {/* Footer Base */}
        <div className="border-t border-purple-950/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} {storeName}. Built for passionate gamers. Next Level reseller systems.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500/80">
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] uppercase font-bold tracking-widest text-cyan-500/60 shadow-[0_0_8px_rgba(0,240,255,0.05)]">UPI</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] uppercase font-bold tracking-widest text-purple-500/60">Cards</span>
              <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] uppercase font-bold tracking-widest text-gray-400/60">NetBanking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
