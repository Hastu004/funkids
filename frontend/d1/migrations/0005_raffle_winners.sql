CREATE TABLE IF NOT EXISTS raffle_winners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  ticket_number TEXT NOT NULL,
  ticket_count INTEGER NOT NULL,
  package_label TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_raffle_winners_created_at ON raffle_winners(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raffle_winners_order_id ON raffle_winners(order_id);
