import { Game, Category, Invoice, StoreSettings } from '../types';

// Default mock data to populate if localStorage is empty
const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Steam Games', slug: 'steam' },
  { id: 'cat-2', name: 'Online Games', slug: 'online' },
  { id: 'cat-3', name: 'Offline Games', slug: 'offline' },
  { id: 'cat-4', name: 'Multiplayer & Co-op', slug: 'multiplayer' },
  { id: 'cat-5', name: 'Premium Accounts', slug: 'premium-accounts' },
  { id: 'cat-6', name: 'Gift Cards', slug: 'gift-cards' },
];

const defaultGames: Game[] = [
  {
    id: 'game-1',
    title: 'Cyberpunk 2077: Ultimate Edition',
    slug: 'cyberpunk-2077-ultimate-edition',
    description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped in a do-or-die fight for survival. Improved with next-gen features and including the gripping spy-thriller expansion Phantom Liberty.',
    category_id: 'cat-3',
    platform: 'PC (GOG / Steam)',
    mode: 'offline',
    delivery_type: 'automatic',
    price: 2999,
    sale_price: 1499,
    featured: true,
    stock: 45,
    cover_image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'game-2',
    title: 'Grand Theft Auto V: Premium Edition',
    slug: 'grand-theft-auto-v-premium-edition',
    description: 'The Grand Theft Auto V: Premium Edition includes the complete Grand Theft Auto V story experience, free access to the ever-evolving Grand Theft Auto Online and all existing gameplay upgrades and content.',
    category_id: 'cat-2',
    platform: 'PC (Rockstar Launcher)',
    mode: 'online',
    delivery_type: 'manual',
    price: 1999,
    sale_price: 999,
    featured: true,
    stock: 12,
    cover_image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'game-3',
    title: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    description: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age.',
    category_id: 'cat-3',
    platform: 'PC (Steam)',
    mode: 'offline',
    delivery_type: 'automatic',
    price: 3299,
    sale_price: 1299,
    featured: true,
    stock: 30,
    cover_image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'game-4',
    title: 'Steam $50 Wallet Gift Card',
    slug: 'steam-50-wallet-gift-card',
    description: 'Steam Gift Cards work just like a gift certificate, which can be redeemed on Steam for the purchase of games, software, wallet credit, and any other item you can purchase on Steam.',
    category_id: 'cat-6',
    platform: 'Steam Wallet',
    mode: 'online',
    delivery_type: 'email',
    price: 4500,
    sale_price: 4200,
    featured: false,
    stock: 100,
    cover_image: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=80',
    gallery_images: []
  },
  {
    id: 'game-5',
    title: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring-shadow-of-the-erdtree',
    description: 'Winner of hundreds of accolades, Elden Ring is an epic dark fantasy RPG set in a vast, immersive world. Shadow of the Erdtree introduces a completely new adventure in the Land of Shadow, filled with secrets, fearsome bosses, and legendary equipment.',
    category_id: 'cat-4',
    platform: 'PC (Steam Key)',
    mode: 'multiplayer',
    delivery_type: 'automatic',
    price: 3499,
    sale_price: 2799,
    featured: true,
    stock: 8,
    cover_image: 'https://images.unsplash.com/photo-1656083549247-f703551571d7?w=600&auto=format&fit=crop&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

const defaultSettings: StoreSettings = {
  store_name: 'Next Level Store',
  logo: '',
  whatsapp_number: '+919037609081',
  support_email: 'support@nextlevelstore.com',
  invoice_footer: 'Thank you for shopping with Next Level Store. Happy Gaming!',
  currency: 'INR',
  currency_symbol: '₹',
  enable_whatsapp: false
};

const defaultInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'NLS-2026-001',
    customer_name: 'Alex Mercer',
    customer_discord: 'alex_mercer#1234',
    customer_username: 'alex_merc',
    discount: 100,
    tax_rate: 18,
    total_amount: 1650.82,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
    items: [
      {
        id: 'item-1',
        game_id: 'game-1',
        game_title: 'Cyberpunk 2077: Ultimate Edition',
        quantity: 1,
        unit_price: 1499
      }
    ]
  },
  {
    id: 'inv-2',
    invoice_number: 'NLS-2026-002',
    customer_name: 'Sarah Connor',
    customer_discord: 'sarah_connor#9999',
    customer_username: 'sconnor_gamer',
    discount: 0,
    tax_rate: 18,
    total_amount: 1178.82,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    items: [
      {
        id: 'item-2',
        game_id: 'game-2',
        game_title: 'Grand Theft Auto V: Premium Edition',
        quantity: 1,
        unit_price: 999
      }
    ]
  }
];

// Helper to check if we are in client environment
const isClient = typeof window !== 'undefined';

// Safe getter/setter for local storage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!isClient) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (isClient) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Database interfaces
export const MockDb = {
  // Categories CRUD
  getCategories(): Category[] {
    return getStorageItem<Category[]>('nls_categories', defaultCategories);
  },

  saveCategory(category: Omit<Category, 'id'> & { id?: string }): Category {
    const categories = this.getCategories();
    if (category.id) {
      // Edit
      const index = categories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...category } as Category;
        setStorageItem('nls_categories', categories);
        return categories[index];
      }
    }
    // Create new
    const newCategory: Category = {
      id: `cat-${Math.random().toString(36).substring(2, 9)}`,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString()
    };
    categories.push(newCategory);
    setStorageItem('nls_categories', categories);
    return newCategory;
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length !== categories.length) {
      setStorageItem('nls_categories', filtered);
      return true;
    }
    return false;
  },

  // Games CRUD
  getGames(): Game[] {
    const games = getStorageItem<Game[]>('nls_games', defaultGames);
    const categories = this.getCategories();
    // Resolve Category objects
    return games.map(game => ({
      ...game,
      category: categories.find(c => c.id === game.category_id)
    }));
  },

  getGameBySlug(slug: string): Game | undefined {
    const games = this.getGames();
    return games.find(g => g.slug === slug);
  },

  saveGame(game: Omit<Game, 'id'> & { id?: string }): Game {
    const games = getStorageItem<Game[]>('nls_games', defaultGames);
    const slug = game.slug || game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (game.id) {
      // Edit
      const index = games.findIndex(g => g.id === game.id);
      if (index !== -1) {
        games[index] = {
          ...games[index],
          ...game,
          slug,
          gallery_images: game.gallery_images || []
        } as Game;
        setStorageItem('nls_games', games);
        return this.getGames().find(g => g.id === game.id)!;
      }
    }

    // Create new
    const newGame: Game = {
      ...game,
      id: `game-${Math.random().toString(36).substring(2, 9)}`,
      slug,
      gallery_images: game.gallery_images || [],
      created_at: new Date().toISOString()
    } as Game;
    games.push(newGame);
    setStorageItem('nls_games', games);
    return this.getGames().find(g => g.id === newGame.id)!;
  },

  deleteGame(id: string): boolean {
    const games = getStorageItem<Game[]>('nls_games', defaultGames);
    const filtered = games.filter(g => g.id !== id);
    if (filtered.length !== games.length) {
      setStorageItem('nls_games', filtered);
      return true;
    }
    return false;
  },

  // Invoices CRUD
  getInvoices(): Invoice[] {
    return getStorageItem<Invoice[]>('nls_invoices', defaultInvoices);
  },

  saveInvoice(invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at'> & { id?: string }): Invoice {
    const invoices = this.getInvoices();

    if (invoice.id) {
      // Edit / Update Existing
      const idx = invoices.findIndex(inv => inv.id === invoice.id);
      if (idx !== -1) {
        const updatedInvoice: Invoice = {
          ...invoices[idx],
          customer_name: invoice.customer_name,
          customer_discord: invoice.customer_discord,
          customer_username: invoice.customer_username || '',
          discount: Number(invoice.discount),
          tax_rate: Number(invoice.tax_rate),
          total_amount: invoice.total_amount,
          items: invoice.items?.map((item, index) => ({
            id: item.id || `item-${index}-${Math.random().toString(36).substring(2, 5)}`,
            game_id: item.game_id,
            game_title: item.game_title || '',
            quantity: item.quantity,
            unit_price: item.unit_price
          })) || []
        };
        invoices[idx] = updatedInvoice;
        setStorageItem('nls_invoices', invoices);
        return updatedInvoice;
      }
    }

    // Create New
    const count = invoices.length + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `NLS-${year}-${String(count).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      invoice_number: invoiceNumber,
      created_at: new Date().toISOString()
    } as Invoice;

    invoices.push(newInvoice);
    setStorageItem('nls_invoices', invoices);

    // Deduct stock for games sold
    const games = getStorageItem<Game[]>('nls_games', defaultGames);
    invoice.items?.forEach(item => {
      const gIdx = games.findIndex(g => g.id === item.game_id);
      if (gIdx !== -1) {
        games[gIdx].stock = Math.max(0, games[gIdx].stock - item.quantity);
      }
    });
    setStorageItem('nls_games', games);

    return newInvoice;
  },

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    if (filtered.length !== invoices.length) {
      setStorageItem('nls_invoices', filtered);
      return true;
    }
    return false;
  },

  // Settings
  getSettings(): StoreSettings {
    return getStorageItem<StoreSettings>('nls_settings', defaultSettings);
  },

  saveSettings(settings: StoreSettings): StoreSettings {
    setStorageItem('nls_settings', settings);
    return settings;
  },

  // Dashboard Stats
  getStats() {
    const games = this.getGames();
    const invoices = this.getInvoices();
    
    const featuredGames = games.filter(g => g.featured).length;
    const totalInvoices = invoices.length;
    
    const revenueSummary = invoices.reduce((acc, inv) => acc + Number(inv.total_amount), 0);
    const lowStockAlerts = games.filter(g => g.stock <= 10).length;

    // Last 6 invoices for activity log
    const recentActivity = invoices
      .slice(-6)
      .reverse()
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
  }
};
