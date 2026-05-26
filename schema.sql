-- Next Level Store Database Schema
-- Paste this script into your Supabase SQL Editor to initialize all tables, relations, and policies.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    platform VARCHAR(100) NOT NULL, -- e.g., PC (Steam), PS5, Xbox Series X, Epic Games
    mode VARCHAR(50) CHECK (mode IN ('online', 'offline', 'multiplayer', 'co-op')) NOT NULL,
    delivery_type VARCHAR(50) CHECK (delivery_type IN ('automatic', 'manual', 'email')) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    featured BOOLEAN DEFAULT false NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    cover_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching and filtering games
CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(featured) WHERE featured = true;

-- 3. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY, -- Will correspond to Auth.users id
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) CHECK (role IN ('super_admin', 'staff')) DEFAULT 'staff' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_discord VARCHAR(255) NOT NULL,
    customer_username VARCHAR(255),
    discount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00 NOT NULL, -- percentage, e.g. 18.00 for GST
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES games(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 6. SETTINGS TABLE (Key-Value style store settings)
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES SETUP
---------------------------------------------------------

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies
CREATE POLICY "Allow public read access to categories" ON categories 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to categories" ON categories 
    FOR ALL USING (auth.role() = 'authenticated');

-- Games RLS Policies
CREATE POLICY "Allow public read access to games" ON games 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to games" ON games 
    FOR ALL USING (auth.role() = 'authenticated');

-- Admins RLS Policies
CREATE POLICY "Allow admin read access to admins list" ON admins 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow super_admin write access to admins list" ON admins 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid() AND admins.role = 'super_admin'
        )
    );

-- Invoices RLS Policies
CREATE POLICY "Allow authenticated read access to invoices" ON invoices 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write access to invoices" ON invoices 
    FOR ALL USING (auth.role() = 'authenticated');

-- Invoice Items RLS Policies
CREATE POLICY "Allow authenticated read access to invoice_items" ON invoice_items 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated write access to invoice_items" ON invoice_items 
    FOR ALL USING (auth.role() = 'authenticated');

-- Settings RLS Policies
CREATE POLICY "Allow public read access to settings" ON settings 
    FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to settings" ON settings 
    FOR ALL USING (auth.role() = 'authenticated');

---------------------------------------------------------
-- SEED INITIAL DATA
---------------------------------------------------------

-- 1. Seed Categories
INSERT INTO categories (id, name, slug) VALUES
('a1111111-1111-1111-1111-111111111111', 'Steam Games', 'steam'),
('b2222222-2222-2222-2222-222222222222', 'Online Games', 'online'),
('c3333333-3333-3333-3333-333333333333', 'Offline Games', 'offline'),
('d4444444-4444-4444-4444-444444444444', 'Multiplayer & Co-op', 'multiplayer'),
('e5555555-5555-5555-5555-555555555555', 'Premium Accounts', 'premium-accounts'),
('f6666666-6666-6666-6666-666666666666', 'Gift Cards', 'gift-cards')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Default Settings
INSERT INTO settings (key, value) VALUES
('store_settings', '{
  "store_name": "Next Level Store",
  "logo": "",
  "whatsapp_number": "+919037609081",
  "support_email": "support@nextlevelstore.com",
  "invoice_footer": "Thank you for buying from Next Level Store. Happy Gaming!",
  "currency": "INR",
  "currency_symbol": "₹"
}'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- 3. Seed Sample Games
INSERT INTO games (title, slug, description, category_id, platform, mode, delivery_type, price, sale_price, featured, stock, cover_image, gallery_images) VALUES
(
  'Cyberpunk 2077: Ultimate Edition', 
  'cyberpunk-2077-ultimate-edition', 
  'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped in a do-or-die fight for survival. Improved with next-gen features and including the gripping spy-thriller expansion Phantom Liberty.', 
  'c3333333-3333-3333-3333-333333333333', 
  'PC (GOG / Steam)', 
  'offline', 
  'automatic', 
  2999.00, 
  1499.00, 
  true, 
  45, 
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&auto=format&fit=crop&q=60']
),
(
  'Grand Theft Auto V: Premium Edition', 
  'grand-theft-auto-v-premium-edition', 
  'The Grand Theft Auto V: Premium Edition includes the complete Grand Theft Auto V story experience, free access to the ever-evolving Grand Theft Auto Online and all existing gameplay upgrades and content.', 
  'b2222222-2222-2222-2222-222222222222', 
  'PC (Rockstar Launcher)', 
  'online', 
  'manual', 
  1999.00, 
  999.00, 
  true, 
  12, 
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  ARRAY['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60']
),
(
  'Red Dead Redemption 2', 
  'red-dead-redemption-2', 
  'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age.', 
  'c3333333-3333-3333-3333-333333333333', 
  'PC (Steam)', 
  'offline', 
  'automatic', 
  3299.00, 
  1299.00, 
  true, 
  30, 
  'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  ARRAY['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60']
),
(
  'Steam $50 Wallet Gift Card', 
  'steam-50-wallet-gift-card', 
  'Steam Gift Cards work just like a gift certificate, which can be redeemed on Steam for the purchase of games, software, wallet credit, and any other item you can purchase on Steam.', 
  'f6666666-6666-6666-6666-666666666666', 
  'Steam Wallet', 
  'online', 
  'email', 
  4500.00, 
  4200.00, 
  false, 
  100, 
  'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  ARRAY[]::TEXT[]
),
(
  'Elden Ring', 
  'elden-ring', 
  'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.', 
  'd4444444-4444-4444-4444-444444444444', 
  'PC (Steam Key)', 
  'multiplayer', 
  'automatic', 
  3499.00, 
  2799.00, 
  true, 
  15, 
  'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 
  ARRAY['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60']
)
ON CONFLICT (slug) DO NOTHING;
