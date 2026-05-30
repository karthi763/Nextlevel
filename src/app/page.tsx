'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2,
  ArrowRight, 
  Flame, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  ShoppingBag,
  LayoutGrid
} from 'lucide-react';
import { storeService } from '../lib/supabase';
import { Game, Category, StoreSettings } from '../types';

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCarousel, setActiveCarousel] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedGames, fetchedCategories, fetchedSettings] = await Promise.all([
          storeService.getGames(),
          storeService.getCategories(),
          storeService.getSettings()
        ]);
        setGames(fetchedGames);
        setCategories(fetchedCategories);
        setSettings(fetchedSettings);
      } catch (e) {
        console.error('Error loading storefront data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredGames = games.filter(g => g.featured);
  const trendingGames = games.slice(0, 4); // Display first 4 games as trending
  const storeName = settings?.store_name || 'Next Level Store';
  const currencySymbol = settings?.currency_symbol || '₹';

  // Carousel controls
  const nextSlide = () => {
    if (featuredGames.length === 0) return;
    setActiveCarousel((prev) => (prev + 1) % featuredGames.length);
  };

  const prevSlide = () => {
    if (featuredGames.length === 0) return;
    setActiveCarousel((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  // Autoplay carousel
  useEffect(() => {
    if (featuredGames.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#060414] text-[#f3f4f6] py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-900 border-t-purple-500 animate-spin" />
          <span className="text-[#f3f4f6]/60 font-medium tracking-wide">Loading Next Level Store...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-transparent pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-purple-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.06)_0,transparent_65%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-900 bg-purple-950/40 text-purple-400 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm animate-float">
            <Sparkles className="h-4.5 w-4.5 text-purple-400" />
            Mega Deals Live: Up to 60% Off
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#f3f4f6] mb-6">
            Welcome to the <br/>
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#7c3aed] to-[#d946ef] bg-clip-text text-transparent filter drop-shadow-sm">
              {storeName}
            </span>
          </h1>

          <p className="text-lg sm:text-2xl text-[#f3f4f6]/70 max-w-2xl font-light mb-10 leading-relaxed">
            Premium Digital Games, Wallet Cards & Accounts at the <span className="text-purple-400 font-bold">Best Reseller Prices</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <Link 
              href="/games"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Browse Game Catalog
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="https://discord.gg/TUkyptCNJ2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-purple-300 border border-purple-900/60 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-750 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <svg className="h-5 w-5 fill-current text-[#5865F2]" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.07-11.55,67.66,67.66,0,0,1-11.14-5.32c.94-.69,1.84-1.39,2.69-2.1a75.52,75.52,0,0,0,73.1,0c.85.71,1.75,1.41,2.69,2.1a67.66,67.66,0,0,1-11.14,5.32,77.7,77.7,0,0,0,7.07,11.55,105.73,105.73,0,0,0,31.54-18.83C128.79,48.24,122.9,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Join Discord Server
            </a>
          </div>

          {/* Quick Core Assurances */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-4xl w-full border-t border-purple-950/40 pt-8">
            {[
              { text: '100% Genuine Access', desc: 'Secure Steam & GOG accounts' },
              { text: 'Instant Reseller Delivery', desc: 'Within minutes via email/chat' },
              { text: 'Best Pricing', desc: 'Beats Steam & Epic store sales' },
              { text: 'Discord Support', desc: 'Direct tickets with staff' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-5 w-5 text-purple-400 mb-2" />
                <span className="text-sm font-semibold text-[#f3f4f6]">{item.text}</span>
                <span className="text-xs text-[#f3f4f6]/50 mt-0.5">{item.desc}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. FEATURED GAMES CAROUSEL SECTION */}
      {featuredGames.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight uppercase">Featured Launches</h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden glass-panel border border-purple-950/40 aspect-[16/9] md:aspect-[21/9]">
            {featuredGames.map((game, index) => (
              <div 
                key={game.id}
                className={`absolute inset-0 w-full h-full flex transition-opacity duration-700 ease-in-out ${
                  index === activeCarousel ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Cover Image Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center filter brightness-[0.4] scale-105 transition-all"
                  style={{ backgroundImage: `url(${game.cover_image})` }}
                />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060414] via-[#060414]/75 to-transparent md:bg-gradient-to-r md:from-[#060414] md:via-[#060414]/90 md:to-transparent z-10 flex flex-col justify-end p-6 md:p-12 md:max-w-2xl text-left">
                  <div className="mb-2 animate-float">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-950/50 text-purple-400 border border-purple-900/40">
                      {game.category?.name || 'FEATURED'}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#f3f4f6] mb-4 line-clamp-2 leading-tight">
                    {game.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#f3f4f6]/70 line-clamp-3 mb-6 font-light leading-relaxed">
                    {game.description}
                  </p>
                  
                  {/* Prices & CTAs */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#f3f4f6]/50 uppercase tracking-widest font-semibold">Reseller Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">
                          {currencySymbol}{game.sale_price || game.price}
                        </span>
                        {game.sale_price && (
                          <span className="text-sm text-[#f3f4f6]/40 line-through">
                            {currencySymbol}{game.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/games/${game.slug}`}
                      className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 hover:shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {featuredGames.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-purple-900/40 bg-black/60 text-[#f3f4f6] hover:bg-purple-600 hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-purple-900/40 bg-black/60 text-[#f3f4f6] hover:bg-purple-600 hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                  {featuredGames.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCarousel(i)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        i === activeCarousel ? 'w-8 bg-purple-600 shadow-sm' : 'w-2.5 bg-purple-950 hover:bg-purple-900'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}      {/* 3. CATEGORIES GRID SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-purple-950/40">
        <div className="flex items-center gap-2 mb-8">
          <LayoutGrid className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight uppercase">Curated Catalog</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              href={`/games?category=${cat.slug}`}
              className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 relative group cursor-pointer border border-purple-950/40 hover:border-purple-500 hover:text-purple-400 bg-purple-950/15"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-950/40 border border-purple-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-purple-400">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-[#f3f4f6] leading-tight group-hover:text-purple-400 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-[#f3f4f6]/40 mt-1 uppercase font-semibold tracking-wider">
                View Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. TRENDING GAMES SECTION */}
      {trendingGames.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-purple-950/40">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-purple-400 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6] tracking-tight uppercase">Hot Right Now</h2>
            </div>
            <Link 
              href="/games" 
              className="flex items-center gap-1 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider cursor-pointer"
            >
              See All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingGames.map((game) => (
              <div 
                key={game.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col group border border-purple-950/40 hover:border-purple-500 hover:shadow-md transition-all duration-300 bg-[#0f0b24]/40"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-purple-950/20">
                  {game.sale_price && (
                    <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-red-500 text-white font-black text-xs rounded-md shadow-sm">
                      SALE
                    </div>
                  )}
                  {game.stock <= 5 && game.stock > 0 && (
                    <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-amber-600 text-white font-black text-[10px] uppercase rounded-md tracking-wider shadow-sm">
                      Low Stock
                    </div>
                  )}
                  {game.stock === 0 && (
                    <div className="absolute inset-0 z-20 bg-[#060414]/90 flex items-center justify-center text-red-500 font-black tracking-widest text-sm uppercase">
                      Out of Stock
                    </div>
                  )}
                  <img 
                    src={game.cover_image} 
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <Link
                      href={`/games/${game.slug}`}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-extrabold text-xs tracking-wider uppercase hover:bg-purple-700 shadow-sm active:scale-95 transition-all"
                    >
                      Quick View
                    </Link>
                  </div>
                </div>

                {/* Details Container */}
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5">
                    {game.category?.name || 'PC Game'}
                  </span>
                  <Link 
                    href={`/games/${game.slug}`}
                    className="text-base font-extrabold text-[#f3f4f6] group-hover:text-purple-400 transition-colors line-clamp-1 mb-2"
                  >
                    {game.title}
                  </Link>

                  {/* Mode & Platform Row */}
                  <div className="flex items-center justify-between text-xs text-[#f3f4f6]/60 mb-4 pb-3 border-b border-purple-950/40">
                    <span className="font-medium">{game.platform}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 font-bold border border-purple-900/40 uppercase tracking-wide">
                      {game.mode}
                    </span>
                  </div>

                  {/* Price & CTA Block */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#f3f4f6]/45 uppercase tracking-widest font-semibold">Reseller Rate</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-purple-400">
                          {currencySymbol}{game.sale_price || game.price}
                        </span>
                        {game.sale_price && (
                          <span className="text-xs text-[#f3f4f6]/30 line-through">
                            {currencySymbol}{game.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link 
                      href={`/games/${game.slug}`}
                      className="p-2.5 rounded-lg border border-purple-900 bg-purple-950/40 text-purple-400 hover:text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 cursor-pointer"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CUSTOM ORDER CALL TO ACTION SECTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 mt-8">
        <div className="glass-panel border-purple-950/40 rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-md bg-[#0a071c]">
          <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-600/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-pink-600/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex flex-col gap-3 text-center md:text-left flex-grow">
            <span className="text-purple-400 font-extrabold uppercase tracking-widest text-xs">Custom Orders Welcome</span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#f3f4f6]">Looking for a specific game?</h3>
            <p className="text-sm text-[#f3f4f6]/60 max-w-lg leading-relaxed font-light">
              If a digital key, offline bundle, or premium account is not listed in our catalog, direct message us. We will procure it for you at the absolute best reseller market rates!
            </p>
          </div>

          <div className="flex shrink-0 w-full md:w-auto items-center justify-center">
            <a 
              href="https://discord.gg/TUkyptCNJ2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4.5 rounded-2xl font-black text-white bg-[#5865F2] hover:bg-[#4752C4] hover:shadow-[0_4px_15px_rgba(88,101,242,0.4)] hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
            >
              <svg className="h-5 w-5 fill-current text-white" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,7.07-11.55,67.66,67.66,0,0,1-11.14-5.32c.94-.69,1.84-1.39,2.69-2.1a75.52,75.52,0,0,0,73.1,0c.85.71,1.75,1.41,2.69,2.1a67.66,67.66,0,0,1-11.14,5.32,77.7,77.7,0,0,0,7.07,11.55,105.73,105.73,0,0,0,31.54-18.83C128.79,48.24,122.9,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
              </svg>
              Join Discord Server
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
