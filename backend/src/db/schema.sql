CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  owner_user_id INTEGER NOT NULL,
  keywords TEXT,
  source_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS metadata_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tag_type TEXT NOT NULL,
  tag_value TEXT NOT NULL,
  UNIQUE (tag_type, tag_value)
);

CREATE TABLE IF NOT EXISTS asset_tags (
  asset_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (asset_id, tag_id),
  FOREIGN KEY (asset_id) REFERENCES knowledge_assets (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES metadata_tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS governance_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  actor_user_id INTEGER NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES knowledge_assets (id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

INSERT OR IGNORE INTO metadata_tags (tag_type, tag_value) VALUES
  ('Industry', 'Finance'),
  ('Industry', 'Healthcare'),
  ('Industry', 'Education'),
  ('Capability', 'Analytics'),
  ('Capability', 'Automation'),
  ('Capability', 'Security'),
  ('Region', 'UK'),
  ('Region', 'EU'),
  ('Region', 'Global'),
  ('DeliverableType', 'Report'),
  ('DeliverableType', 'Prototype'),
  ('DeliverableType', 'API'),
  ('AssetType', 'Template'),
  ('AssetType', 'Report'),
  ('AssetType', 'Playbook'),
  ('AssetType', 'Code'),
  ('AssetType', 'Slide Deck'),
  ('AccessLevel', 'Internal'),
  ('AccessLevel', 'Client-Restricted'),
  ('AccessLevel', 'Public');
