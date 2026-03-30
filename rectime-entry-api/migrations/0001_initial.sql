PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  backend_url TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS domain_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email_domain TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  note TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS email_exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  event_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  note TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE INDEX IF NOT EXISTS domain_routes_idx_1
  ON domain_routes (email_domain);

CREATE INDEX IF NOT EXISTS domain_routes_idx_4
  ON domain_routes (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS domain_routes_idx_7
  ON domain_routes (email_domain, event_id);

CREATE INDEX IF NOT EXISTS email_exceptions_idx_10
  ON email_exceptions (email);

CREATE INDEX IF NOT EXISTS email_exceptions_idx_13
  ON email_exceptions (event_id);

CREATE UNIQUE INDEX IF NOT EXISTS email_exceptions_idx_16
  ON email_exceptions (email, event_id);
