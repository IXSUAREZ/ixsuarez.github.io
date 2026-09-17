CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  private_token_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  scenario_json TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  calculator_version TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS plans_updated_at_idx ON plans(updated_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS plans_email_idx ON plans(email);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key_hash TEXT PRIMARY KEY,
  request_hash TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  token_ciphertext TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY(plan_id) REFERENCES plans(id)
);

CREATE TABLE IF NOT EXISTS owner_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  idle_expires_at TEXT NOT NULL,
  hard_expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS owner_sessions_expiry_idx ON owner_sessions(hard_expires_at);

CREATE TABLE IF NOT EXISTS rate_events (
  event_id TEXT PRIMARY KEY,
  bucket TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_events_lookup_idx ON rate_events(bucket, subject_hash, occurred_at);
