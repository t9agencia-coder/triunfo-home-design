-- Rodar uma única vez no SQL Editor do Supabase
-- (Database → SQL Editor → New query → cole e execute)

CREATE TABLE IF NOT EXISTS thd_sessions (
  session_id TEXT PRIMARY KEY,
  data       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thd_txn_sessions (
  transaction_id TEXT PRIMARY KEY,
  session_id     TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thd_dedup (
  event_id   TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking_sessions (
  id           TEXT PRIMARY KEY,
  fbp          TEXT,
  fbc          TEXT,
  fbclid       TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,
  ip           TEXT,
  user_agent   TEXT,
  landing_page TEXT,
  referer      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS tracking_events CASCADE;

CREATE TABLE tracking_events (
  id              BIGSERIAL PRIMARY KEY,
  event_id        TEXT UNIQUE NOT NULL,
  event_name      TEXT NOT NULL,
  provider        TEXT NOT NULL DEFAULT 'meta',
  session_id      TEXT,
  transaction_id  TEXT,
  payload_sent    JSONB,
  response_body   JSONB,
  response_status INT,
  success         BOOLEAN,
  error_message   TEXT,
  attempt         INT DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_te_event_name     ON tracking_events (event_name);
CREATE INDEX idx_te_transaction_id ON tracking_events (transaction_id);
CREATE INDEX idx_te_session_id     ON tracking_events (session_id);
