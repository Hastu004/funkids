CREATE TABLE IF NOT EXISTS receipt_deliveries (
  order_id TEXT PRIMARY KEY,
  recipient_email TEXT,
  sent_at TEXT,
  last_error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_receipt_deliveries_sent_at ON receipt_deliveries(sent_at);
