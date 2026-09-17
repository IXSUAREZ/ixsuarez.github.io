ALTER TABLE idempotency_keys ADD COLUMN operation TEXT NOT NULL DEFAULT 'create';
ALTER TABLE idempotency_keys ADD COLUMN response_revision INTEGER NOT NULL DEFAULT 1;
