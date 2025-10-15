-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15, -- in minutes
  is_combo BOOLEAN DEFAULT false,
  combo_items TEXT[], -- Array of item names for combos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables table
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(available);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to menu_items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to tables" ON tables
  FOR SELECT USING (true);

CREATE POLICY "Allow public access to orders" ON orders
  FOR ALL USING (true);

CREATE POLICY "Allow public access to order_items" ON order_items
  FOR ALL USING (true);

-- Insert sample data
INSERT INTO menu_items (name, description, price, category, preparation_time, available) VALUES
('Kulhad Chai', 'Traditional clay pot tea with aromatic spices', 25.00, 'chai', 5, true),
('Masala Chai', 'Spiced tea with milk and traditional Indian spices', 30.00, 'chai', 7, true),
('Iced Tea', 'Refreshing cold tea with lemon', 35.00, 'iced-tea', 3, true),
('Hot Coffee', 'Freshly brewed coffee', 40.00, 'hot-coffee', 5, true),
('Cold Coffee', 'Chilled coffee with ice cream', 60.00, 'cold-coffee', 8, true),
('Veg Burger', 'Delicious vegetarian burger with fresh vegetables', 120.00, 'burgers', 15, true),
('Chicken Burger', 'Juicy chicken burger with special sauce', 150.00, 'burgers', 18, true),
('Veg Maggie', 'Instant noodles with vegetables and spices', 80.00, 'maggie', 10, true),
('Cheese Maggie', 'Maggie with extra cheese and vegetables', 100.00, 'maggie', 12, true),
('Grilled Sandwich', 'Toasted sandwich with vegetables and cheese', 90.00, 'sandwiches', 12, true),
('Club Sandwich', 'Multi-layer sandwich with chicken and vegetables', 140.00, 'sandwiches', 15, true),
('Pasta Arrabiata', 'Spicy tomato pasta with herbs', 160.00, 'pasta', 20, true),
('White Sauce Pasta', 'Creamy pasta with white sauce', 180.00, 'pasta', 22, true),
('Garlic Bread', 'Toasted bread with garlic butter', 70.00, 'bread', 8, true),
('French Fries', 'Crispy golden fries', 80.00, 'fries', 10, true),
('Margherita Pizza', 'Classic pizza with tomato and mozzarella', 200.00, 'pizza', 25, true),
('Veggie Pizza', 'Pizza loaded with fresh vegetables', 250.00, 'pizza', 28, true),
('Chocolate Milkshake', 'Rich chocolate shake with ice cream', 120.00, 'milkshakes', 5, true),
('Strawberry Milkshake', 'Fresh strawberry shake', 130.00, 'milkshakes', 5, true),
('Virgin Mojito', 'Refreshing mint and lime mocktail', 90.00, 'mocktails', 7, true),
('Blue Lagoon', 'Blue colored refreshing mocktail', 100.00, 'mocktails', 8, true);

-- Insert sample tables
INSERT INTO tables (number, capacity, qr_code) VALUES
(1, 2, 'QR_TABLE_001'),
(2, 4, 'QR_TABLE_002'),
(3, 2, 'QR_TABLE_003'),
(4, 6, 'QR_TABLE_004'),
(5, 4, 'QR_TABLE_005'),
(6, 2, 'QR_TABLE_006'),
(7, 8, 'QR_TABLE_007'),
(8, 4, 'QR_TABLE_008'),
(9, 2, 'QR_TABLE_009'),
(10, 6, 'QR_TABLE_010');