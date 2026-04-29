CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  character TEXT NOT NULL DEFAULT 'unknown',
  location TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '칭호 없음',
  title_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_scores_rank
ON scores(score DESC, created_at ASC);
