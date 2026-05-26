'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ChevronLeft, 
  Gamepad2, 
  Sparkles, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { storeService } from '../../lib/supabase';
import { Game, Category } from '../../types';

interface GameFormProps {
  gameId?: string; // Optional: if present, we are in EDIT mode
}

export default function GameForm({ gameId }: GameFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [platform, setPlatform] = useState('PC (Steam)');
  const [mode, setMode] = useState<'online' | 'offline' | 'multiplayer' | 'co-op'>('offline');
  const [deliveryType, setDeliveryType] = useState<'automatic' | 'manual' | 'email'>('automatic');
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [featured, setFeatured] = useState(false);
  const [stock, setStock] = useState<number>(10);
  const [coverImage, setCoverImage] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    async function loadFormRequirements() {
      setFetchingData(true);
      try {
        const fetchedCats = await storeService.getCategories();
        setCategories(fetchedCats);
        if (fetchedCats.length > 0 && !categoryId) {
          setCategoryId(fetchedCats[0].id);
        }

        if (gameId) {
          // Edit mode: fetch existing game
          const games = await storeService.getGames();
          const game = games.find(g => g.id === gameId);
          if (game) {
            setTitle(game.title);
            setDescription(game.description);
            setCategoryId(game.category_id);
            setPlatform(game.platform);
            setMode(game.mode);
            setDeliveryType(game.delivery_type);
            setPrice(game.price);
            setSalePrice(game.sale_price);
            setFeatured(game.featured);
            setStock(game.stock);
            setCoverImage(game.cover_image);
            setGalleryInput(game.gallery_images?.join('\n') || '');
          } else {
            setError('Game not found in local database.');
          }
        }
      } catch (e) {
        console.error('Failed to load form dependencies:', e);
        setError('Failed to load active database tables.');
      } finally {
        setFetchingData(false);
      }
    }
    loadFormRequirements();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate fields
    if (!title.trim()) {
      setError('Please provide a game title.');
      setLoading(false);
      return;
    }
    if (!coverImage.trim()) {
      setError('Please provide a Cover Image URL.');
      setLoading(false);
      return;
    }

    // Process gallery input (split by newlines and clean empty lines)
    const galleryImages = galleryInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    const gamePayload = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      category_id: categoryId,
      platform,
      mode,
      delivery_type: deliveryType,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : undefined,
      featured,
      stock: Number(stock),
      cover_image: coverImage,
      gallery_images: galleryImages
    };

    try {
      await storeService.saveGame(
        gameId ? { ...gamePayload, id: gameId } : gamePayload
      );
      router.push('/admin/games');
    } catch (e: any) {
      setError(e.message || 'Failed to save product in database.');
    } finally {
      setLoading(false);
    }
  };

  const insertUnsplashPlaceholder = () => {
    const images = [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80'
    ];
    const randomImg = images[Math.floor(Math.random() * images.length)];
    setCoverImage(randomImg);
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center bg-[#030014] py-20 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Fetching dependencies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="flex items-center gap-4 border-b border-purple-950/40 pb-6">
        <button
          onClick={() => router.push('/admin/games')}
          className="p-2 rounded-lg border border-purple-500/20 bg-purple-950/20 text-purple-300 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase">
            {gameId ? 'EDIT SHOWCASE GAME' : 'ADD SHOWCASE GAME'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {gameId ? 'Modify metadata and stock inventory details.' : 'Introduce a new game title to your catalog.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/15 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-8 flex flex-col gap-6 glass-panel p-6 sm:p-8 rounded-2xl border-purple-950/50">
          
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2">Core Product Information</h3>
          
          {/* Game Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Game Title</label>
            <input 
              type="text"
              required
              placeholder="e.g., Elden Ring: Shadow of the Erdtree"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Showcase Description</label>
            <textarea 
              rows={6}
              required
              placeholder="Write a descriptive summary including game features, PC configurations, or specific activation keys notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Pricing & Stock Fields in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Base Price</label>
              <input 
                type="number"
                min="0"
                required
                placeholder="2999"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Sale Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Sale Price (Optional)</label>
              <input 
                type="number"
                min="0"
                placeholder="1499"
                value={salePrice || ''}
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Stock Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Inventory Stock</label>
              <input 
                type="number"
                min="0"
                required
                placeholder="15"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

          </div>

          {/* Media Links Section */}
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2 mt-4">Media Screenshots Gallery</h3>

          {/* Cover Image */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center justify-between">
              <span>Main Cover URL</span>
              <button 
                type="button" 
                onClick={insertUnsplashPlaceholder}
                className="text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-300 tracking-widest bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20"
              >
                Insert Unsplash Glow Cover
              </button>
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="url"
                required
                placeholder="Paste active cover graphic URL link..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
            {coverImage && (
              <div className="mt-2 h-32 w-24 rounded border border-purple-500/20 overflow-hidden relative bg-purple-950/30">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Screenshot Gallery list */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Screenshot Gallery (URLs, one per line)</label>
            <textarea 
              rows={4}
              placeholder="https://example.com/screenshot1.png&#10;https://example.com/screenshot2.png"
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all resize-none font-mono"
            />
          </div>

        </div>

        {/* Right Column: Sidebar Specs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border-purple-950/50 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2">Showcase Meta Details</h3>
            
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Game Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Platform Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Target Platform</label>
              <input 
                type="text"
                required
                placeholder="e.g. PC (Steam), PS5, GOG Account"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Gameplay mode */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Connection Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                <option value="offline">Offline Singleplayer</option>
                <option value="online">Online Access</option>
                <option value="multiplayer">Co-Op & Multiplayer</option>
                <option value="co-op">Co-Op Only</option>
              </select>
            </div>

            {/* Delivery type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Delivery Logistics</label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as any)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                <option value="automatic">Instant Key / Account Details</option>
                <option value="manual">Manual Reseller Activation (UPI)</option>
                <option value="email">Direct Delivery to Customer Email</option>
              </select>
            </div>

            {/* Featured Launch Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-purple-900/30 bg-purple-950/5 hover:border-purple-500/20 transition-all">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Featured Product</span>
                <span className="text-[10px] text-gray-500 mt-0.5">Showcase on Home page carousel</span>
              </div>
              <input 
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-5 w-5 rounded border-purple-900 bg-black/40 text-cyan-400 focus:ring-0 focus:outline-none transition-all cursor-pointer accent-cyan-400"
              />
            </div>

          </div>

          {/* Submit buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
            >
              {loading ? (
                <div className="h-4.5 w-4.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  Save Game Catalog
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/games')}
              className="w-full py-3 rounded-xl border border-purple-500/20 bg-purple-950/20 text-purple-300 hover:text-white transition-all text-xs font-semibold"
            >
              Cancel & Go Back
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
