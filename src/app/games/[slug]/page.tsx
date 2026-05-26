'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  ChevronLeft, 
  PhoneCall, 
  Send,
  Cpu, 
  Layers, 
  Activity, 
  TrendingUp, 
  ShieldCheck,
  ShoppingBag,
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
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-gray-400 font-medium">Fetching Game Details...</span>
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
    <div className="flex-grow bg-[#030014] relative overflow-hidden pb-16">
      
      {/* Blurred cover photo background banner */}
      <div 
        className="absolute top-0 left-0 w-full h-[350px] sm:h-[450px] bg-cover bg-center filter blur-3xl opacity-15 pointer-events-none -z-10"
        style={{ backgroundImage: `url(${game.cover_image})` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Back Link */}
        <Link 
          href="/games"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-wider mb-8"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
          Back to Catalog
        </Link>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. LEFT COLUMN: IMAGE DISPLAY & THUMBNAILS GALLERY */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Active Display Panel */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden glass-panel border-purple-500/20 bg-purple-950/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              {game.sale_price && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-600 text-white font-extrabold text-xs tracking-wider rounded-lg shadow-lg animate-pulse uppercase">
                  MEGA SALE
                </div>
              )}
              {game.stock === 0 ? (
                <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center gap-2">
                  <AlertTriangle className="h-10 w-10 text-red-500 animate-float" />
                  <span className="text-red-500 font-extrabold tracking-widest text-lg uppercase">SOLD OUT</span>
                </div>
              ) : game.stock <= 5 && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-amber-600 text-white font-extrabold text-xs tracking-wider rounded-lg shadow">
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
                    className={`relative shrink-0 w-24 sm:w-28 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img 
                        ? 'border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)] scale-98' 
                        : 'border-purple-950/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Technical description block */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/50 mt-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-purple-950/40 pb-2">
                Game Details & Description
              </h2>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line">
                {game.description}
              </p>
            </div>

          </div>

          {/* B. RIGHT COLUMN: PRICING, SPECS, & PURCHASE INSTRUCTIONS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Primary Details Panel */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border-purple-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />
              
              <span className="px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-xs font-bold uppercase tracking-widest text-purple-300 mb-4 inline-block">
                {game.category?.name || 'SHOWCASE LISTING'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2 tracking-tight">
                {game.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 font-medium">
                <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 uppercase font-semibold text-cyan-400">
                  {game.platform}
                </span>
                <span>•</span>
                <span className="capitalize">{game.mode} Mode</span>
              </div>

              {/* Specs Counters Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 border-t border-b border-purple-950/40 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-purple-950/30 text-purple-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Delivery Type</span>
                    <span className="text-xs font-bold text-gray-200 capitalize">{game.delivery_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-purple-950/30 text-cyan-400">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Availability</span>
                    <span className={`text-xs font-bold uppercase ${game.stock > 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                      {game.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Panel */}
              <div className="flex flex-col mb-8 bg-black/40 border border-purple-950/50 p-4 rounded-xl">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Reseller Wholesale Price</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 filter drop-shadow-[0_0_8px_var(--accent-glow)]">
                    {currencySymbol}{priceToPay}
                  </span>
                  {game.sale_price && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        {currencySymbol}{game.price}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-[10px] text-red-400 font-extrabold border border-red-900/40">
                        SAVE {currencySymbol}{game.price - game.sale_price}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA BUY BUTTONS */}
              <div className="flex flex-col gap-3">
                {game.stock > 0 ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl text-black font-extrabold text-base text-center bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] active:scale-98 transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                  >
                    <PhoneCall className="h-5 w-5 text-black" />
                    Buy Instant via WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-600 font-extrabold text-base text-center uppercase tracking-wide cursor-not-allowed"
                  >
                    Sold Out (Backorder Soon)
                  </button>
                )}

                <a
                  href={inquiryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 hover:text-white hover:border-purple-400 active:scale-98 transition-all text-sm font-bold text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                  Ask a Question
                </a>
              </div>

            </div>

            {/* Quick Security / Trust Panel */}
            <div className="glass-panel p-6 rounded-2xl border-purple-950/50 flex flex-col gap-4">
              <span className="font-bold text-white text-xs uppercase tracking-wider">How Purchase Works:</span>
              <div className="flex flex-col gap-3">
                {[
                  { title: '1. Place Order', desc: 'Click Buy via WhatsApp to send a pre-filled purchase request.' },
                  { title: '2. Make Payment', desc: 'Reseller shares UPI ID, QR Code, or Payment Link directly.' },
                  { title: '3. Receive Game Code', desc: 'Access credentials, key, or activation instructions sent instantly.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 text-xs leading-relaxed">
                    <span className="font-extrabold text-cyan-400 shrink-0">{step.title}</span>
                    <span className="text-gray-400 font-light">{step.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
