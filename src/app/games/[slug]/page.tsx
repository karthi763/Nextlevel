'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, 
  PhoneCall, 
  MessageSquare,
  Send,
  Cpu, 
  PackageCheck,
  AlertTriangle
} from 'lucide-react';
import { storeService } from '../../../lib/supabase';
import { Game, StoreSettings } from '../../../types';

export default function GameDetails() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedGame, fetchedSettings] = await Promise.all([
          storeService.getGameBySlug(slug),
          storeService.getSettings()
        ]);
        
        if (fetchedGame) {
          setGame(fetchedGame);
          setActiveImage(fetchedGame.cover_image);
        } else {
          router.replace('/games'); // Fallback if game not found
        }
        setSettings(fetchedSettings);
      } catch (e) {
        console.error('Error loading game detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-transparent py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
          <span className="text-[#f3f4f6]/60 font-medium">Fetching Game Details...</span>
        </div>
      </div>
    );
  }

  if (!game) return null;

  const currencySymbol = settings?.currency_symbol || '₹';
  const whatsapp = settings?.whatsapp_number || '+919037609081';
  const priceToPay = game.sale_price || game.price;

  // Custom pre-filled WhatsApp message
  const prefilledText = encodeURIComponent(
    `Hello! I want to buy "${game.title}" (${game.platform}) from Next Level Store.\n` +
    `• Listed Price: ${currencySymbol}${priceToPay}\n` +
    `• Delivery Type: ${game.delivery_type.toUpperCase()}\n` +
    `Please share payment details!`
  );

  const whatsappLink = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${prefilledText}`;

  // General inquiry text
  const inquiryText = encodeURIComponent(
    `Hello! I have a question regarding "${game.title}" (${game.platform}) listed on your store.`
  );
  const inquiryLink = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${inquiryText}`;

  // Combines cover image with screenshots for the gallery
  const gallery = [game.cover_image, ...(game.gallery_images || [])];

  return (
    <div className="flex-grow bg-transparent relative overflow-hidden pb-16">
      
      {/* Blurred cover photo background banner */}
      <div 
        className="absolute top-0 left-0 w-full h-[350px] sm:h-[450px] bg-cover bg-center filter blur-3xl opacity-10 pointer-events-none -z-10"
        style={{ backgroundImage: `url(${game.cover_image})` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back Link */}
        <Link 
          href="/games"
          className="inline-flex items-center gap-1 text-sm font-bold text-purple-300/60 hover:text-purple-400 transition-colors uppercase tracking-wider mb-8 cursor-pointer"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Catalog
        </Link>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. LEFT COLUMN: IMAGE DISPLAY & THUMBNAILS GALLERY */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Active Display Panel */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden glass-panel border border-purple-950/40 bg-purple-950/5 shadow-md">
              {game.sale_price && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-pink-500 text-white font-extrabold text-xs tracking-wider rounded-lg shadow-sm animate-pulse uppercase">
                  MEGA SALE
                </div>
              )}
              {game.stock === 0 ? (
                <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="h-10 w-10 text-red-500 animate-float" />
                  <span className="text-red-500 font-extrabold tracking-widest text-lg uppercase">SOLD OUT</span>
                </div>
              ) : game.stock <= 5 && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-amber-600 text-white font-extrabold text-xs tracking-wider rounded-lg shadow-sm">
                  ONLY {game.stock} KEYS LEFT
                </div>
              )}
              <img 
                src={activeImage} 
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Carousel (only show if multiple images exist) */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-900">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`relative shrink-0 w-24 sm:w-28 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === img 
                        ? 'border-purple-500 shadow-md scale-98' 
                        : 'border-purple-950/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Technical description block */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/40 bg-[#0f0824]/40 shadow-md mt-4">
              <h2 className="text-lg font-extrabold text-white uppercase tracking-wider mb-4 border-b border-purple-950/30 pb-2">
                Game Details & Description
              </h2>
              <p className="text-purple-200/70 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line">
                {game.description}
              </p>
            </div>

          </div>

          {/* B. RIGHT COLUMN: PRICING, SPECS, & PURCHASE INSTRUCTIONS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Details Panel */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/40 bg-[#0f0824]/40 shadow-lg relative">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <span className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-900/30 text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 inline-block shadow-sm">
                {game.category?.name || 'SHOWCASE LISTING'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                {game.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-purple-300/60 mb-6 font-medium">
                <span className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-900/30 uppercase font-bold text-purple-400">
                  {game.platform}
                </span>
                <span>•</span>
                <span className="capitalize text-purple-300/70">{game.mode} Mode</span>
              </div>

              {/* Specs Counters Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-purple-950/30 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-900/30 shadow-sm">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-400/50 uppercase tracking-widest font-semibold">Delivery Type</span>
                    <span className="text-xs font-bold text-white capitalize">{game.delivery_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-900/30 shadow-sm">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-purple-400/50 uppercase tracking-widest font-semibold">Availability</span>
                    <span className={`text-xs font-bold uppercase ${game.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                      {game.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Panel */}
              <div className="flex flex-col mb-8 bg-[#0a071c] border border-purple-950/40 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] text-purple-400/50 uppercase tracking-widest font-bold">Reseller Wholesale Price</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-purple-300">
                    {currencySymbol}{priceToPay}
                  </span>
                  {game.sale_price && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-purple-400/30 line-through">
                        {currencySymbol}{game.price}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[10px] font-extrabold border border-pink-500/20 shadow-sm">
                        SAVE {currencySymbol}{game.price - game.sale_price}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA BUY BUTTONS */}
              <div className="flex flex-col gap-3">
                {game.stock > 0 ? (
                  settings?.enable_whatsapp ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-xl text-white font-extrabold text-base text-center bg-[#25D366] hover:bg-[#1ebd54] hover:shadow-[0_4px_15px_rgba(37,211,102,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                    >
                      <PhoneCall className="h-5 w-5 text-white" />
                      Buy Instant via WhatsApp
                    </a>
                  ) : (
                    <a
                      href="https://discord.gg/TUkyptCNJ2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-xl text-white font-extrabold text-base text-center bg-[#5865F2] hover:bg-[#4752C4] hover:shadow-[0_4px_15px_rgba(88,101,242,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                    >
                      <MessageSquare className="h-5 w-5 text-white" />
                      Buy Instant via Discord
                    </a>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full py-4 rounded-xl bg-purple-950/20 border border-purple-950 text-white/30 font-extrabold text-base text-center uppercase tracking-wide cursor-not-allowed"
                  >
                    Sold Out (Backorder Soon)
                  </button>
                )}

                {settings?.enable_whatsapp ? (
                  <a
                    href={inquiryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl border border-purple-950 bg-purple-950/30 text-purple-300 hover:text-white hover:bg-purple-900/40 transition-all text-sm font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                    Ask a Question
                  </a>
                ) : (
                  <a
                    href="https://discord.gg/TUkyptCNJ2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl border border-purple-950 bg-purple-950/30 text-purple-300 hover:text-white hover:bg-purple-900/40 transition-all text-sm font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    Join Discord Support
                  </a>
                )}
              </div>

            </div>

            {/* Quick Security / Trust Panel */}
            <div className="glass-panel p-6 rounded-2xl border-purple-950/40 bg-[#0f0824]/40 shadow-sm flex flex-col gap-4">
              <span className="font-bold text-white text-xs uppercase tracking-widest font-sans">How Purchase Works:</span>
              <div className="flex flex-col gap-3">
                {settings?.enable_whatsapp ? (
                  [
                    { title: '1. Place Order', desc: 'Click Buy via WhatsApp to send a pre-filled purchase request.' },
                    { title: '2. Make Payment', desc: 'Reseller shares UPI ID, QR Code, or Payment Link directly.' },
                    { title: '3. Receive Game Code', desc: 'Access credentials, key, or activation instructions sent instantly.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed">
                      <span className="font-extrabold text-purple-400 shrink-0">{step.title}</span>
                      <span className="text-purple-300/70 font-light">{step.desc}</span>
                    </div>
                  ))
                ) : (
                  [
                    { title: '1. Raise Ticket', desc: 'Click Buy via Discord to open a support ticket inside our server.' },
                    { title: '2. Make Payment', desc: 'Secure checkout with reseller using UPI, Cards, or PayPal.' },
                    { title: '3. Instant Delivery', desc: 'Access credentials, keys, or game activation instructions sent instantly.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed">
                      <span className="font-extrabold text-purple-400 shrink-0">{step.title}</span>
                      <span className="text-purple-300/70 font-light">{step.desc}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
