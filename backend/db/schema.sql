CREATE TABLE streamers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'kick',
  blurb TEXT,
  live INTEGER DEFAULT 0,
  viewers INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  thumbnail TEXT,
  badge TEXT,
  approved INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  channel_url TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE appearance (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  ua TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_streamers_approved_live ON streamers(approved, live DESC);
CREATE INDEX IF NOT EXISTS idx_streamers_platform ON streamers(platform);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_streamers_featured ON streamers(featured, approved);
