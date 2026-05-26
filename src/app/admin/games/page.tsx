'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Star, 
  ShoppingBag,
  ExternalLink,
  Info
} from 'lucide-react';
import { storeService } from '../../../lib/supabase';
import { Game, StoreSettings } from '../../../types';

export default function AdminGamesList() {
  const [games, setGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  async function loadGames() {
    setLoading(true);
    try {
      const [fetchedGames, fetchedSettings] = await Promise.all([
        storeService.getGames(),
        storeService.getSettings()
      ]);
      setGames(fetchedGames);
      setSettings(fetchedSettings);
    } catch (e) {
      console.error('Failed to load games list:', e);
    } finally {
      setLoading(false);
    }
  }

  const currencySymbol = settings?.currency_symbol || '₹';

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${title}" from the catalog?`)) {
      try {
        const success = await storeService.deleteGame(id);
        if (success) {
          setGames(prev => prev.filter(g => g.id !== id));
        } else {
          alert('Delete failed! Please try again.');
        }
      } catch (e) {
        console.error('Failed to delete game:', e);
        alert('An error occurred during deletion.');
      }
    }
  };

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Gathering games catalog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-950/40 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">MANAGE GAMES</h1>
          <p className="text-xs text-gray-500 mt-1">Configure showcase digital keys, platforms, reseller rates, and featured launches.</p>
        </div>
        <Link
          href="/admin/games/new"
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Game
        </Link>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
        <Search className="h-5 w-5 text-gray-500 shrink-0" />
        <input 
          type="text"
          placeholder="Filter catalog games by name, category or platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-white">Clear</button>
        )}
      </div>

      {/* Database Catalog Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-purple-950/50">
        <div className="overflow-x-auto">
          {filteredGames.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm flex flex-col items-center gap-3">
              <Info className="h-10 w-10 text-purple-400 animate-float" />
              <span>No games catalog found! Create your first digital product above.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-950/70 bg-purple-950/20 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4.5 px-6">Product</th>
                  <th className="py-4.5 px-6">Category</th>
                  <th className="py-4.5 px-6">Platform / Mode</th>
                  <th className="py-4.5 px-6">Reseller Price</th>
                  <th className="py-4.5 px-6">Stock Status</th>
                  <th className="py-4.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/40 text-sm text-gray-300">
                {filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-purple-950/10 transition-colors">
                    
                    {/* Game title & Thumbnail cover */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="h-12 w-9 rounded overflow-hidden shrink-0 border border-purple-500/15 bg-purple-950/30 relative">
                        <img src={game.cover_image} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-white text-sm line-clamp-1">{game.title}</span>
                          {game.featured && (
                            <Star className="h-3.5 w-3.5 fill-purple-400 text-purple-400 filter drop-shadow-[0_0_5px_rgba(139,92,246,0.3)] shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono tracking-wider line-clamp-1">{game.slug}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-950/50 text-purple-300 border border-purple-900/30">
                        {game.category?.name || 'Showcase'}
                      </span>
                    </td>

                    {/* Platform & Mode */}
                    <td className="py-4 px-6 flex flex-col gap-0.5">
                      <span className="font-semibold text-white text-xs">{game.platform}</span>
                      <span className="text-[10px] text-gray-500 capitalize">{game.mode} Mode</span>
                    </td>

                    {/* Price / Sale */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-cyan-400">
                          {currencySymbol}{game.sale_price || game.price}
                        </span>
                        {game.sale_price && (
                          <span className="text-[10px] text-gray-500 line-through">
                            {currencySymbol}{game.price}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Alert Status */}
                    <td className="py-4 px-6">
                      {game.stock === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/30 flex items-center gap-1 w-max">
                          Out of Stock
                        </span>
                      ) : game.stock <= 10 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/30 flex items-center gap-1 w-max">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                          Low: {game.stock} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 w-max">
                          Available: {game.stock}
                        </span>
                      )}
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/games/${game.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded bg-purple-950/30 border border-purple-500/10 text-gray-400 hover:text-cyan-400 hover:bg-purple-900/20 transition-all"
                          title="View Live Showcase"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/games/${game.id}`}
                          className="p-2 rounded bg-purple-950/30 border border-purple-500/10 text-gray-400 hover:text-white hover:bg-purple-900/20 transition-all"
                          title="Edit Catalog Details"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(game.id, game.title)}
                          className="p-2 rounded bg-purple-950/30 border border-purple-500/10 text-gray-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
