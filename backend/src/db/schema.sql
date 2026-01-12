CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT,
  region TEXT,
  languages TEXT,
  availability TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  related_project_id TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  owner_user_id INTEGER NOT NULL,
  keywords TEXT,
  source_url TEXT,
  asset_type TEXT,
  confidentiality TEXT,
  source_project_id TEXT,
  workspace_id INTEGER,
  version_major INTEGER NOT NULL DEFAULT 1,
  version_minor INTEGER NOT NULL DEFAULT 0,
  version_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users (id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
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
  outcome TEXT,
  issues TEXT,
  reviewer_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES knowledge_assets (id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS expertise_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  skills TEXT,
  domains TEXT,
  certifications TEXT,
  current_projects TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  recommendation_score REAL NOT NULL,
  explanation TEXT,
  generated_on TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES knowledge_assets (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS integration_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_guid TEXT NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  source_system TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  processed_on TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_statuses (
  status TEXT PRIMARY KEY
);

INSERT OR IGNORE INTO asset_statuses (status) VALUES
  ('Draft'),
  ('PendingReview'),
  ('Published');

CREATE TABLE IF NOT EXISTS tag_categories (
  category TEXT PRIMARY KEY
);

INSERT OR IGNORE INTO tag_categories (category) VALUES
  ('Industry'),
  ('Capability'),
  ('Region'),
  ('DeliverableType'),
  ('AssetType'),
  ('AccessLevel');

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

INSERT OR IGNORE INTO workspaces (id, name, related_project_id) VALUES
  (1, 'Core Knowledge Base', 'PRJ-1001'),
  (2, 'Client Delivery', 'PRJ-2048'),
  (3, 'Innovation Lab', 'PRJ-3005');
