CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  backend_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS domain_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_domain TEXT NOT NULL,
  event_id TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX IF NOT EXISTS idx_domain_routes_lookup
  ON domain_routes (email_domain, is_active, priority);

CREATE TABLE IF NOT EXISTS email_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  event_id TEXT NOT NULL,
  reason TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX IF NOT EXISTS idx_email_exceptions_lookup
  ON email_exceptions (email, is_active, expires_at);

CREATE TABLE IF NOT EXISTS resolve_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  resolved_event_id TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'not_found', 'rejected')),
  reason_code TEXT NOT NULL,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_resolve_logs_created_at
  ON resolve_logs (created_at);
