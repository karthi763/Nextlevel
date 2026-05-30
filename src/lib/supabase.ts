import { createClient } from '@supabase/supabase-js';
import { MockDb } from './mockDb';
import { Game, Category, Invoice, StoreSettings } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase only if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Unified database operations provider that seamlessly switches between Supabase and Local Mock Storage
export const storeService = {
  // 1. CATEGORIES OPERATIONS
  async getCategories(): Promise<Category[]> {
    if (!supabase) return MockDb.getCategories();
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('Supabase getCategories failed, falling back to Local Storage:', e);
      return MockDb.getCategories();
    }
  },

  async saveCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    if (!supabase) return MockDb.saveCategory(category);

    try {
      if (category.id) {
        // Update
        const { data, error } = await supabase
          .from('categories')
          .update({ name: category.name, slug: category.slug })
          .eq('id', category.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('categories')
          .insert({ name: category.name, slug: category.slug })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } catch (e) {
      console.warn('Supabase saveCategory failed, falling back to Local Storage:', e);
      return MockDb.saveCategory(category);
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (!supabase) return MockDb.deleteCategory(id);

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase deleteCategory failed, falling back to Local Storage:', e);
      return MockDb.deleteCategory(id);
    }
  },

  // 2. GAMES OPERATIONS
  async getGames(): Promise<Game[]> {
    if (!supabase) return MockDb.getGames();

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(g => ({
        ...g,
        category: g.categories // Map from relation
      }));
    } catch (e) {
      console.warn('Supabase getGames failed, falling back to Local Storage:', e);
      return MockDb.getGames();
    }
  },

  async getGameBySlug(slug: string): Promise<Game | undefined> {
    if (!supabase) return MockDb.getGameBySlug(slug);

    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, categories(*)')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      if (!data) return undefined;

      return {
        ...data,
        category: data.categories
      };
    } catch (e) {
      console.warn(`Supabase getGameBySlug(${slug}) failed, falling back to Local Storage:`, e);
      return MockDb.getGameBySlug(slug);
    }
  },

  async saveGame(game: Omit<Game, 'id'> & { id?: string }): Promise<Game> {
    if (!supabase) return MockDb.saveGame(game);

    try {
      const dbPayload = {
        title: game.title,
        slug: game.slug,
        description: game.description,
        category_id: game.category_id,
        platform: game.platform,
        mode: game.mode,
        delivery_type: game.delivery_type,
        price: game.price,
        sale_price: game.sale_price,
        featured: game.featured,
        stock: game.stock,
        cover_image: game.cover_image,
        gallery_images: game.gallery_images
      };

      if (game.id) {
        // Update
        const { data, error } = await supabase
          .from('games')
          .update(dbPayload)
          .eq('id', game.id)
          .select('*, categories(*)')
          .single();
        if (error) throw error;
        return { ...data, category: data.categories };
      } else {
        // Insert
        const { data, error } = await supabase
          .from('games')
          .insert(dbPayload)
          .select('*, categories(*)')
          .single();
        if (error) throw error;
        return { ...data, category: data.categories };
      }
    } catch (e) {
      console.warn('Supabase saveGame failed, falling back to Local Storage:', e);
      return MockDb.saveGame(game);
    }
  },

  async deleteGame(id: string): Promise<boolean> {
    if (!supabase) return MockDb.deleteGame(id);

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase deleteGame failed, falling back to Local Storage:', e);
      return MockDb.deleteGame(id);
    }
  },

  // 3. INVOICES OPERATIONS
  async getInvoices(): Promise<Invoice[]> {
    if (!supabase) return MockDb.getInvoices();

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(inv => ({
        ...inv,
        items: inv.invoice_items
      }));
    } catch (e) {
      console.warn('Supabase getInvoices failed, falling back to Local Storage:', e);
      return MockDb.getInvoices();
    }
  },

  async saveInvoice(invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at'> & { id?: string }): Promise<Invoice> {
    if (!supabase) return MockDb.saveInvoice(invoice);

    try {
      if (invoice.id) {
        // Edit / Update Existing
        const { data: invData, error: invError } = await supabase
          .from('invoices')
          .update({
            customer_name: invoice.customer_name,
            customer_discord: invoice.customer_discord,
            customer_username: invoice.customer_username,
            discount: invoice.discount,
            tax_rate: invoice.tax_rate,
            total_amount: invoice.total_amount
          })
          .eq('id', invoice.id)
          .select()
          .single();

        if (invError) throw invError;

        // Delete previous Invoice items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);

        // Insert new Invoice items
        if (invoice.items && invoice.items.length > 0) {
          const itemRows = invoice.items.map(item => ({
            invoice_id: invoice.id,
            game_id: item.game_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }));

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemRows);

          if (itemsError) throw itemsError;
        }

        return {
          ...invData,
          items: invoice.items
        };
      }

      // Create New
      // 1. Get total invoices count to generate Invoice Number (or let DB handle it)
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });
      
      const currentCount = (count || 0) + 1;
      const year = new Date().getFullYear();
      const invoiceNumber = `NLS-${year}-${String(currentCount).padStart(3, '0')}`;

      // 2. Insert Invoice header
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_name: invoice.customer_name,
          customer_discord: invoice.customer_discord,
          customer_username: invoice.customer_username,
          discount: invoice.discount,
          tax_rate: invoice.tax_rate,
          total_amount: invoice.total_amount
        })
        .select()
        .single();

      if (invError) throw invError;

      // 3. Insert Invoice items
      if (invoice.items && invoice.items.length > 0) {
        const itemRows = invoice.items.map(item => ({
          invoice_id: invData.id,
          game_id: item.game_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemRows);

        if (itemsError) throw itemsError;

        // 4. Update Game stocks
        for (const item of invoice.items) {
          try {
            const { error: rpcError } = await supabase.rpc('decrement_game_stock', {
              target_game_id: item.game_id,
              qty: item.quantity
            });
            if (rpcError) throw rpcError;
          } catch (rpcErr) {
            // Fallback if RPC function does not exist yet (manually fetch and decrement)
            const { data: game } = await supabase.from('games').select('stock').eq('id', item.game_id).single();
            if (game) {
              await supabase.from('games')
                .update({ stock: Math.max(0, game.stock - item.quantity) })
                .eq('id', item.game_id);
            }
          }
        }
      }

      return {
        ...invData,
        items: invoice.items
      };
    } catch (e) {
      console.warn('Supabase saveInvoice failed, falling back to Local Storage:', e);
      return MockDb.saveInvoice(invoice);
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    if (!supabase) return MockDb.deleteInvoice(id);

    try {
      await supabase.from('invoice_items').delete().eq('invoice_id', id);
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase deleteInvoice failed, falling back to Local Storage:', e);
      return MockDb.deleteInvoice(id);
    }
  },

  // 4. STORE SETTINGS OPERATIONS
  async getSettings(): Promise<StoreSettings> {
    if (!supabase) return MockDb.getSettings();

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'store_settings')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Setting not found, save default
          const defaultSettings = MockDb.getSettings();
          await this.saveSettings(defaultSettings);
          return defaultSettings;
        }
        throw error;
      }
      return data.value as StoreSettings;
    } catch (e) {
      console.warn('Supabase getSettings failed, falling back to Local Storage:', e);
      return MockDb.getSettings();
    }
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    if (!supabase) return MockDb.saveSettings(settings);

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'store_settings',
          value: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return settings;
    } catch (e) {
      console.warn('Supabase saveSettings failed, falling back to Local Storage:', e);
      return MockDb.saveSettings(settings);
    }
  },

  // 5. DASHBOARD STATS
  async getStats() {
    if (!supabase) return MockDb.getStats();

    try {
      const games = await this.getGames();
      const invoices = await this.getInvoices();

      const featuredGames = games.filter(g => g.featured).length;
      const totalInvoices = invoices.length;
      const revenueSummary = invoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0);
      const lowStockAlerts = games.filter(g => g.stock <= 10).length;

      const recentActivity = invoices
        .slice(0, 6)
        .map(inv => ({
          id: inv.id,
          customer: inv.customer_name,
          amount: inv.total_amount,
          date: inv.created_at || new Date().toISOString(),
          itemsCount: inv.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
        }));

      return {
        totalGames: games.length,
        featuredGames,
        totalInvoices,
        revenueSummary,
        lowStockAlerts,
        recentActivity
      };
    } catch (e) {
      console.warn('Supabase getStats failed, falling back to Local Storage:', e);
      return MockDb.getStats();
    }
  }
};
