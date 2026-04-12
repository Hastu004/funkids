CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('webpay', 'cash')),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending_payment')),
  source_label TEXT NOT NULL,
  notes TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  wants_account INTEGER NOT NULL DEFAULT 0,
  package_id TEXT NOT NULL,
  package_label TEXT NOT NULL,
  participations INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'transbank',
  payment_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  ticket_number TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webpay_transactions (
  order_id TEXT PRIMARY KEY,
  buy_order TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  redirect_url TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  response_code INTEGER,
  authorization_code TEXT,
  payment_type_code TEXT,
  transaction_date TEXT,
  accounting_date TEXT,
  card_number TEXT,
  vci TEXT,
  last_error TEXT,
  raw_response TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(channel);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_order_tickets_order_id ON order_tickets(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_tickets_ticket_number ON order_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_webpay_transactions_token ON webpay_transactions(token);
CREATE INDEX IF NOT EXISTS idx_webpay_transactions_buy_order ON webpay_transactions(buy_order);
CREATE INDEX IF NOT EXISTS idx_webpay_transactions_session_id ON webpay_transactions(session_id);
