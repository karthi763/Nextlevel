'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Menu, X, PhoneCall } from 'lucide-react';
import { storeService } from '../lib/supabase';
import { StoreSettings } from '../types';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    storeService.getSettings().then(setSettings);
  }, []);

  const isActive = (path: string) => {
    if (path === '/games') return pathname.startsWith('/games');
    return pathname === path;
  };

  const whatsAppNumber = settings?.whatsapp_number || '9037609081';
  const storeName = settings?.store_name || 'Next Level Store';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Games', href: '/games' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-purple-900/40 bg-[#030014]/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-purple-900/20 border border-purple-500/20 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all overflow-hidden p-0.5">
                <img src="/logo.png" alt="Brand Logo" className="h-9 w-9 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-purple-300 to-cyan-400 bg-clip-text text-transparent group-hover:shadow-glow transition-all">
                {storeName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 font-medium text-sm transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'text-cyan-400 font-semibold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Call to Actions (Social Links & Contacts) */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Instagram Icon link */}
            <a
              href="https://www.instagram.com/next_level_store_/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-purple-500/20 bg-purple-950/20 text-purple-400 hover:text-white hover:border-purple-400 hover:shadow-[0_0_10px_rgba(167,139,250,0.2)] transition-all"
              title="Instagram Page"
            >
              <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* Discord Server Link */}
            <a
              href="https://discord.gg/TUkyptCNJ2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-900/30 hover:border-indigo-400 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-pointer"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.07-11.55,67.66,67.66,0,0,1-11.14-5.32c.94-.69,1.84-1.39,2.69-2.1a75.52,75.52,0,0,0,73.1,0c.85.71,1.75,1.41,2.69,2.1a67.66,67.66,0,0,1-11.14,5.32,77.7,77.7,0,0,0,7.07,11.55,105.73,105.73,0,0,0,31.54-18.83C128.79,48.24,122.9,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Discord Server
            </a>

            {/* WhatsApp Reseller Action */}
            <a
              href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I%20am%20interested%20in%20buying%20games%20from%20Next%20Level%20Store.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Contact WhatsApp
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-950/30 border border-transparent hover:border-purple-500/20 transition-all focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-x-0 border-t border-purple-900/50 bg-[#030014]/95 animate-fadeIn">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-purple-950/50 text-cyan-400 border-l-2 border-cyan-400'
                    : 'text-gray-300 hover:bg-purple-950/20 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-purple-950/80 my-3 pt-3 flex flex-col gap-2">
              
              {/* Instagram Mobile */}
              <a
                href="https://www.instagram.com/next_level_store_/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold border border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 hover:text-white transition-all"
              >
                <svg className="h-5 w-5 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram Feed
              </a>

              {/* Discord Mobile */}
              <a
                href="https://discord.gg/TUkyptCNJ2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-900/30 hover:text-white transition-all"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.07-11.55,67.66,67.66,0,0,1-11.14-5.32c.94-.69,1.84-1.39,2.69-2.1a75.52,75.52,0,0,0,73.1,0c.85.71,1.75,1.41,2.69,2.1a67.66,67.66,0,0,1-11.14,5.32,77.7,77.7,0,0,0,7.07,11.55,105.73,105.73,0,0,0,31.54-18.83C128.79,48.24,122.9,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
                Join Discord Server
              </a>

              {/* WhatsApp Mobile */}
              <a
                href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}?text=Hello!%20I%20am%20interested%20in%20buying%20games%20from%20Next%20Level%20Store.`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-base font-bold bg-cyan-400 text-black hover:bg-cyan-300 text-center transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              >
                <PhoneCall className="h-5 w-5" />
                Contact WhatsApp
              </a>

            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
