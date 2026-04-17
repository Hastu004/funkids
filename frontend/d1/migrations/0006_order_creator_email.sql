ALTER TABLE orders ADD COLUMN creator_email TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_creator_email ON orders(creator_email);
