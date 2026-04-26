ALTER TABLE orders ADD COLUMN rut TEXT;
ALTER TABLE orders ADD COLUMN benefit_consumed_at TEXT;
ALTER TABLE orders ADD COLUMN benefit_consumed_by TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_rut ON orders(rut);
CREATE INDEX IF NOT EXISTS idx_orders_benefit_consumed_at ON orders(benefit_consumed_at);
