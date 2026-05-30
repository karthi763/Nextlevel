'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Gamepad2, 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ShoppingBag,
  Info,
  ChevronRight
} from 'lucide-react';
import { storeService } from '../../lib/supabase';
import { Game, Category, StoreSettings } from '../../types';

function GamesListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync category from URL search query (e.g. /games?category=steam)
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setSelectedCategorySlug(urlCategory);
    } else {
      setSelectedCategorySlug('all');
    }
  }, [searchParams]);

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
        console.error('Error loading catalog data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currencySymbol = settings?.currency_symbol || '₹';

  // Platforms dynamic list based on seeded games
  const platforms = useMemo(() => {
    const allPlatforms = games.map(g => g.platform.split(' (')[0].trim()); // Group by platform base like "PC", "PS5"
    const unique = Array.from(new Set(allPlatforms));
    return unique.filter(Boolean);
  }, [games]);

  // Handle Category Filter Change & update URL cleanly
  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.replace(`/games?${params.toString()}`);
  };

  // Filter & Sort Logic
  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.description.toLowerCase().includes(q) ||
        g.platform.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategorySlug !== 'all') {
      result = result.filter(g => g.category?.slug === selectedCategorySlug);
    }

    // Mode filter (online, offline, multiplayer, co-op)
    if (selectedMode !== 'all') {
      result = result.filter(g => g.mode === selectedMode);
    }

    // Platform base filter
    if (selectedPlatform !== 'all') {
      result = result.filter(g => g.platform.toLowerCase().includes(selectedPlatform.toLowerCase()));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [games, searchQuery, selectedCategorySlug, selectedMode, selectedPlatform, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    handleCategorySelect('all');
    setSelectedMode('all');
    setSelectedPlatform('all');
    setSortBy('featured');
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-transparent py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
          <span className="text-[#f3f4f6]/60 font-medium font-sans">Loading Reseller Catalog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-transparent py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-purple-400 via-violet-400 to-pink-500 bg-clip-text text-transparent uppercase">
            RESELLER CATALOG
          </h1>
          <p className="text-sm text-purple-300/60 mt-2">
            Showing {filteredAndSortedGames.length} premium digital listings and codes.
          </p>
        </div>

        {/* Search Bar & Sorting Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 mb-8 border border-purple-950/40 bg-[#0f0824]/30">
          <div className="relative w-full md:flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400/50" />
            <input 
              type="text"
              placeholder="Search by title, platform or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-purple-950 bg-purple-950/20 text-white text-sm placeholder-purple-300/40 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_12px_rgba(124,58,237,0.15)] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-pink-500"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sort Select */}
            <div className="relative w-full md:w-56">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-purple-950 bg-[#0a071c] text-white text-sm focus:outline-none focus:border-purple-500 transition-all cursor-pointer pr-10"
              >
                <option value="featured" className="bg-[#0a071c] text-white">Featured First</option>
                <option value="price-low" className="bg-[#0a071c] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#0a071c] text-white">Price: High to Low</option>
                <option value="name-asc" className="bg-[#0a071c] text-white">Alphabetical (A-Z)</option>
                <option value="newest" className="bg-[#0a071c] text-white">Release Date</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-purple-400/50 pointer-events-none" />
            </div>

            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden shrink-0 p-3 rounded-xl border border-purple-950/40 bg-purple-950/30 text-purple-400 hover:bg-[#7c3aed] hover:text-white transition-all flex items-center justify-center cursor-pointer"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="flex gap-8 items-start">
          
          {/* A. SIDEBAR FILTERS (DESKTOP) */}
          <aside className="hidden md:flex flex-col gap-6 w-64 shrink-0 glass-panel p-6 rounded-2xl border border-purple-950/40 bg-[#0f0824]/40 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-purple-950/30 pb-4">
              <span className="font-bold text-white tracking-widest flex items-center gap-1.5 text-xs uppercase font-sans">
                <SlidersHorizontal className="h-4 w-4 text-purple-400" />
                Refine Search
              </span>
              {(selectedCategorySlug !== 'all' || selectedMode !== 'all' || selectedPlatform !== 'all') && (
                <button 
                  onClick={clearAllFilters}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase text-purple-300/40 tracking-wider">Product Categories</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleCategorySelect('all')}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedCategorySlug === 'all' 
                      ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                      : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedCategorySlug === cat.slug 
                        ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                        : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Connection Mode Filter */}
            <div className="flex flex-col gap-2 border-t border-purple-950/30 pt-4">
              <span className="text-[10px] font-bold uppercase text-purple-300/40 tracking-wider">Gameplay / Mode</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['all', 'online', 'offline', 'multiplayer', 'co-op'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`text-center text-xs py-2 px-1.5 rounded-lg font-bold capitalize border border-transparent transition-all cursor-pointer ${
                      selectedMode === mode 
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 shadow-sm' 
                        : 'bg-purple-950/20 text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/40'
                    }`}
                  >
                    {mode === 'all' ? 'Any Mode' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Platform Filter */}
            <div className="flex flex-col gap-2 border-t border-purple-950/30 pt-4">
              <span className="text-[10px] font-bold uppercase text-purple-300/40 tracking-wider">Device / Platform</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`text-left text-xs py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedPlatform === 'all' 
                      ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                      : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                  }`}
                >
                  Any Platform
                </button>
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`text-left text-xs py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedPlatform === plat 
                        ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                        : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* B. CATALOG ITEMS GRID */}
          <div className="flex-grow">
            {filteredAndSortedGames.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center border-purple-950/40 bg-[#0f0824]/40 flex flex-col items-center justify-center gap-4 shadow-sm">
                <Info className="h-12 w-12 text-purple-500 animate-float" />
                <h3 className="text-xl font-black text-white">No game found!</h3>
                <p className="text-sm text-purple-300/60 max-w-sm font-light leading-relaxed">
                  We could not find any active listing matching your current filter. Please clear filters or search query and try again.
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-xl neon-btn text-sm font-bold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedGames.map((game) => (
                  <div 
                    key={game.id}
                    className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-purple-950/20 hover:border-purple-500/35 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group bg-[#08051a]/40"
                  >
                    {/* Cover image container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-purple-950/10">
                      {game.featured && (
                        <div className="absolute top-3 left-3 z-20 px-2 py-0.5 rounded bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                          Featured
                        </div>
                      )}
                      {game.sale_price && (
                        <div className={`absolute top-3 z-20 px-2 py-0.5 rounded bg-pink-500 text-white font-extrabold text-[9px] uppercase tracking-wider ${game.featured ? 'left-18' : 'left-3'}`}>
                          -{Math.round(((game.price - game.sale_price) / game.price) * 100)}%
                        </div>
                      )}
                      
                      {game.stock <= 5 && game.stock > 0 && (
                        <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded bg-amber-600 text-white font-black text-[9px] uppercase tracking-widest shadow-sm">
                          Low Stock
                        </div>
                      )}
                      {game.stock === 0 && (
                        <div className="absolute inset-0 z-20 bg-black/85 flex items-center justify-center text-red-500 font-black tracking-widest text-xs uppercase">
                          Out of Stock
                        </div>
                      )}
                      <img 
                        src={game.cover_image} 
                        alt={game.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060414]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <Link
                          href={`/games/${game.slug}`}
                          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs tracking-wider uppercase active:scale-95 transition-all"
                        >
                          Show Details
                        </Link>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex flex-col flex-grow bg-transparent">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1">
                        {game.category?.name || 'Catalog Item'}
                      </span>
                      <Link 
                        href={`/games/${game.slug}`}
                        className="text-base font-extrabold text-white group-hover:text-purple-400 transition-colors line-clamp-1 mb-2"
                      >
                        {game.title}
                      </Link>

                      {/* Device & Mode Row */}
                      <div className="flex items-center justify-between text-xs text-purple-300/60 mb-4 pb-3 border-b border-purple-950/20">
                        <span className="font-semibold line-clamp-1">{game.platform}</span>
                        <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-400 font-bold border border-purple-900/30 uppercase tracking-wide shrink-0">
                          {game.mode}
                        </span>
                      </div>

                      {/* Price Block */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-purple-400/50 uppercase tracking-widest font-semibold">Reseller Price</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-purple-300">
                              {currencySymbol}{game.sale_price || game.price}
                            </span>
                            {game.sale_price && (
                              <span className="text-xs text-purple-400/30 line-through">
                                {currencySymbol}{game.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link 
                          href={`/games/${game.slug}`}
                          className="px-3.5 py-2.5 rounded-lg border border-purple-950/45 bg-[#0f0824]/40 text-purple-300 hover:text-white hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="h-4 w-4 shrink-0" />
                          Buy
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* C. MOBILE SIDEBAR DRAWER (OVERLAY) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
          
          <div className="w-80 h-full bg-[#0a071c] p-6 border-l border-purple-950/40 flex flex-col gap-6 overflow-y-auto animate-slideLeft shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-purple-950/30 pb-4">
              <span className="font-extrabold text-white text-base tracking-widest uppercase">Filter Search</span>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg bg-purple-950/40 border border-purple-900/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-purple-300/40 tracking-wider">Categories</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { handleCategorySelect('all'); setMobileFiltersOpen(false); }}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedCategorySlug === 'all' 
                      ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                      : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { handleCategorySelect(cat.slug); setMobileFiltersOpen(false); }}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedCategorySlug === cat.slug 
                        ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                        : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="flex flex-col gap-2 border-t border-purple-950/30 pt-4">
              <span className="text-xs font-bold uppercase text-purple-300/40 tracking-wider">Mode</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['all', 'online', 'offline', 'multiplayer', 'co-op'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setSelectedMode(mode); setMobileFiltersOpen(false); }}
                    className={`text-center text-xs py-2 px-1.5 rounded-lg font-bold capitalize border border-transparent transition-all cursor-pointer ${
                      selectedMode === mode 
                        ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 shadow-sm' 
                        : 'bg-purple-950/20 text-purple-300/60 hover:text-purple-200'
                    }`}
                  >
                    {mode === 'all' ? 'Any Mode' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="flex flex-col gap-2 border-t border-purple-950/30 pt-4">
              <span className="text-xs font-bold uppercase text-purple-300/40 tracking-wider">Device</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setSelectedPlatform('all'); setMobileFiltersOpen(false); }}
                  className={`text-left text-xs py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedPlatform === 'all' 
                      ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                      : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                  }`}
                >
                  Any Platform
                </button>
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => { setSelectedPlatform(plat); setMobileFiltersOpen(false); }}
                    className={`text-left text-xs py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedPlatform === plat 
                        ? 'bg-purple-600/20 text-purple-200 border-l-2 border-purple-500 font-bold' 
                        : 'text-purple-300/60 hover:text-purple-200 hover:bg-purple-950/20'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
              className="mt-auto w-full py-3.5 rounded-xl border border-purple-950 bg-purple-950/50 text-purple-400 font-bold text-xs uppercase tracking-wider hover:bg-purple-900/40 transition-all cursor-pointer"
            >
              Clear Filters
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default function GamesListing() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-transparent py-32 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
          <span className="text-sm text-purple-300/65 font-medium">Loading catalog search...</span>
        </div>
      </div>
    }>
      <GamesListingContent />
    </Suspense>
  );
}
