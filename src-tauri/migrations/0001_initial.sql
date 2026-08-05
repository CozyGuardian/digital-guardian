CREATE TABLE personal_spec (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE personal_spec_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    personal_spec_id INTEGER NOT NULL REFERENCES personal_spec(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    identifier TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('username', 'email')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    config_snapshot TEXT NOT NULL
);

CREATE TABLE findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    site TEXT NOT NULL,
    identifier TEXT NOT NULL,
    found INTEGER NOT NULL CHECK (found IN (0, 1)),
    classification TEXT NOT NULL CHECK (classification IN ('expected', 'unexpected', 'missing')),
    url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE risk_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    finding_id INTEGER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('safe', 'watch', 'at_risk')),
    reason TEXT
);

CREATE TABLE ai_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    action_items TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
