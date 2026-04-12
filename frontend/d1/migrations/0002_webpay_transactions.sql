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

CREATE INDEX IF NOT EXISTS idx_webpay_transactions_token ON webpay_transactions(token);
CREATE INDEX IF NOT EXISTS idx_webpay_transactions_buy_order ON webpay_transactions(buy_order);
CREATE INDEX IF NOT EXISTS idx_webpay_transactions_session_id ON webpay_transactions(session_id);
