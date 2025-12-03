-- Performance Indexes Migration
-- Adds indexes to improve query performance across the application

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Index for filtering orders by table
CREATE INDEX IF NOT EXISTS idx_orders_table_id 
ON orders(table_id);

-- Index for filtering orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Index for sorting orders by creation date
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- Composite index for dashboard queries (status + created_at)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
ON orders(status, created_at DESC);

-- Index for customer phone lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone 
ON orders(customer_phone) 
WHERE customer_phone IS NOT NULL;

-- ============================================
-- ORDER_ITEMS TABLE INDEXES
-- ============================================

-- Index for JOIN operations with orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index for JOIN operations with menu items
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id 
ON order_items(menu_item_id);

-- Composite index for order item queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_menu 
ON order_items(order_id, menu_item_id);

-- ============================================
-- INVENTORY_ITEMS TABLE INDEXES
-- ============================================

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_inventory_items_category 
ON inventory_items(category) 
WHERE category IS NOT NULL;

-- Index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku 
ON inventory_items(sku);

-- Index for low stock queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_low_stock 
ON inventory_items(quantity_on_hand) 
WHERE quantity_on_hand <= reorder_threshold AND reorder_threshold > 0;

-- Index for active items
CREATE INDEX IF NOT EXISTS idx_inventory_items_active 
ON inventory_items(is_active, name) 
WHERE is_active = true;

-- ============================================
-- MENU_ITEMS TABLE INDEXES
-- ============================================

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_menu_items_category 
ON menu_items(category);

-- Index for filtering available items
CREATE INDEX IF NOT EXISTS idx_menu_items_available 
ON menu_items(available) 
WHERE available = true;

-- Composite index for menu queries (category + available)
CREATE INDEX IF NOT EXISTS idx_menu_items_category_available 
ON menu_items(category, available) 
WHERE available = true;

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_menu_items_name 
ON menu_items(name);

-- ============================================
-- STOCK_MOVEMENTS TABLE INDEXES
-- ============================================

-- Index for filtering by item
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_id 
ON stock_movements(item_id);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_stock_movements_type 
ON stock_movements(type);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at 
ON stock_movements(created_at DESC);

-- Composite index for item history queries
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_created 
ON stock_movements(item_id, created_at DESC);

-- ============================================
-- INVENTORY_ALERTS TABLE INDEXES
-- ============================================

-- Index for filtering unacknowledged alerts
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_acknowledged 
ON inventory_alerts(acknowledged, created_at DESC) 
WHERE acknowledged = false;

-- Index for item-specific alerts
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item_id 
ON inventory_alerts(item_id);

-- ============================================
-- MENU_INVENTORY_MAP TABLE INDEXES
-- ============================================

-- Index for menu item lookups
CREATE INDEX IF NOT EXISTS idx_menu_inventory_map_menu_item 
ON menu_inventory_map(menu_item_id);

-- Index for inventory item lookups
CREATE INDEX IF NOT EXISTS idx_menu_inventory_map_inventory_item 
ON menu_inventory_map(inventory_item_id);

-- ============================================
-- TABLES TABLE INDEXES
-- ============================================

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_tables_status 
ON tables(status);

-- Index for table number lookups
CREATE INDEX IF NOT EXISTS idx_tables_table_number 
ON tables(table_number);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================

-- These indexes will:
-- 1. Speed up ORDER BY operations (created_at indexes)
-- 2. Speed up WHERE clauses (status, category, available indexes)
-- 3. Speed up JOIN operations (foreign key indexes)
-- 4. Speed up partial matches (composite indexes)
-- 5. Reduce table scans for filtered queries (partial indexes with WHERE)

-- Trade-offs:
-- - Slightly slower INSERT/UPDATE/DELETE operations
-- - Additional storage space (typically 10-20% of table size)
-- - Indexes are automatically maintained by PostgreSQL

-- Monitoring:
-- Use EXPLAIN ANALYZE to verify index usage:
-- EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
