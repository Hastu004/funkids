CREATE TABLE IF NOT EXISTS internal_notification_deliveries (
  order_id TEXT PRIMARY KEY,
  recipients TEXT NOT NULL,
  sent_at TEXT,
  last_error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_internal_notification_deliveries_sent_at ON internal_notification_deliveries(sent_at);
