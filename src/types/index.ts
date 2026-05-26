export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category?: Category; // Joined relation
  platform: string;
  mode: 'online' | 'offline' | 'multiplayer' | 'co-op';
  delivery_type: 'automatic' | 'manual' | 'email';
  price: number;
  sale_price?: number;
  featured: boolean;
  stock: number;
  cover_image: string;
  gallery_images: string[];
  created_at?: string;
}

export interface Admin {
  id: string;
  email: string;
  role: 'super_admin' | 'staff';
  created_at?: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  game_id: string;
  game?: Game; // Joined relation
  quantity: number;
  unit_price: number;
  // Dynamic temporary field for UI builder
  game_title?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_discord: string;
  customer_username?: string;
  discount: number;
  tax_rate: number;
  total_amount: number;
  created_at?: string;
  items?: InvoiceItem[];
}

export interface StoreSettings {
  store_name: string;
  logo?: string;
  whatsapp_number: string;
  support_email: string;
  invoice_footer?: string;
  currency: string; // e.g., 'USD', 'INR', 'EUR'
  currency_symbol: string; // e.g., '$', '₹', '€'
}
