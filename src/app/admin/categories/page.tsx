'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  FolderLock, 
  Grid,
  Info 
} from 'lucide-react';
import { storeService } from '../../../lib/supabase';
import { Category } from '../../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const fetchedCats = await storeService.getCategories();
      setCategories(fetchedCats);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('Please provide a category name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingCategory) {
        // Edit mode
        const updated = await storeService.saveCategory({
          id: editingCategory.id,
          name: categoryName.trim(),
          slug
        });
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEditingCategory(null);
      } else {
        // Create mode
        const created = await storeService.saveCategory({
          name: categoryName.trim(),
          slug
        });
        setCategories(prev => [...prev, created]);
      }
      setCategoryName('');
    } catch (e: any) {
      setError(e.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete category "${name}"?\n(Warning: Games inside this category will be unassigned).`)) {
      try {
        const success = await storeService.deleteCategory(id);
        if (success) {
          setCategories(prev => prev.filter(c => c.id !== id));
        } else {
          alert('Delete failed! Please try again.');
        }
      } catch (e) {
        console.error('Failed to delete category:', e);
        alert('An error occurred during deletion.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-[#030014] py-24 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-purple-500 border-t-cyan-400 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Gathering categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Panel */}
      <div className="border-b border-purple-950/40 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">MANAGE CATEGORIES</h1>
        <p className="text-xs text-gray-500 mt-1">Organize showcase listings into groups like Steam, Online Accounts, Offline Games, or Wallet Cards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Category List (Table style) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-purple-950/50">
            <div className="p-4 bg-purple-950/20 border-b border-purple-950/60 flex items-center gap-2">
              <FolderLock className="h-5 w-5 text-purple-400 animate-float" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">Active Groupings ({categories.length})</span>
            </div>

            <div className="overflow-x-auto">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm flex flex-col items-center gap-3">
                  <Info className="h-10 w-10 text-purple-400" />
                  <span>No categories available. Add one on the right!</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-purple-950/70 bg-purple-950/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">System Slug</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/40 text-sm text-gray-300">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-purple-950/10 transition-colors">
                        <td className="py-4 px-6 font-bold text-white text-sm">{cat.name}</td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-500">{cat.slug}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => handleEditClick(cat)}
                              className="p-2 rounded bg-purple-950/30 border border-purple-500/10 text-gray-400 hover:text-white hover:bg-purple-900/20 transition-all cursor-pointer"
                              title="Rename Group"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-2 rounded bg-purple-950/30 border border-purple-500/10 text-gray-500 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                              title="Delete Category"
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

        {/* Right Column: Add/Edit Category Form */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl border-purple-500/20">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-purple-950/40 pb-2 mb-6">
            {editingCategory ? 'RENAME CATEGORY' : 'CREATE CATEGORY'}
          </h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-950/15 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Category Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Group Name</label>
              <input 
                type="text"
                placeholder="e.g. PlayStation Accounts"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="px-4 py-3 rounded-lg border border-purple-900/40 bg-black/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs"
              >
                {submitting ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingCategory ? 'Update Grouping' : 'Save Category'}
                  </>
                )}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full py-3 rounded-xl border border-purple-500/20 bg-purple-950/20 text-purple-300 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Cancel Rename
                </button>
              )}
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
