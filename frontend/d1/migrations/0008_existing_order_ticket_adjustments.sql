CREATE TABLE IF NOT EXISTS order_ticket_adjustments (
  order_id TEXT PRIMARY KEY,
  multiplier INTEGER NOT NULL,
  applied_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_ticket_adjustments_applied_at
  ON order_ticket_adjustments(applied_at);
