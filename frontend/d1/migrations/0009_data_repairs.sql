CREATE TABLE IF NOT EXISTS data_repairs (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_repairs_applied_at ON data_repairs(applied_at);
