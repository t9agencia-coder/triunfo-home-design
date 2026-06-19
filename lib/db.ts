import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;
let _migrated = false;

function getSql(): NeonQueryFunction<false, false> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

async function migrate(sql: NeonQueryFunction<false, false>) {
  if (_migrated) return;
  try {
    await sql`
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
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tracking_events (
        id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id       TEXT        UNIQUE NOT NULL,
        event_name     TEXT        NOT NULL,
        provider       TEXT        NOT NULL DEFAULT 'meta',
        session_id     TEXT,
        transaction_id TEXT,
        payload_sent   JSONB,
        response_body  JSONB,
        response_status INT,
        success        BOOLEAN,
        error_message  TEXT,
        attempt        INT         DEFAULT 1,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_te_event_name     ON tracking_events (event_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_te_transaction_id ON tracking_events (transaction_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_te_session_id     ON tracking_events (session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_te_success        ON tracking_events (success)`;
    _migrated = true;
  } catch (e) {
    console.error("[db] migrate error:", e);
  }
}

export async function upsertSession(id: string, data: Record<string, unknown>): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await migrate(sql);
  try {
    const { fbp, fbc, fbclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, ip, user_agent, landing_page, referer } = data as Record<string, string>;
    await sql`
      INSERT INTO tracking_sessions
        (id, fbp, fbc, fbclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, ip, user_agent, landing_page, referer)
      VALUES
        (${id}, ${fbp ?? null}, ${fbc ?? null}, ${fbclid ?? null},
         ${utm_source ?? null}, ${utm_medium ?? null}, ${utm_campaign ?? null},
         ${utm_content ?? null}, ${utm_term ?? null}, ${ip ?? null},
         ${user_agent ?? null}, ${landing_page ?? null}, ${referer ?? null})
      ON CONFLICT (id) DO UPDATE SET
        fbp          = COALESCE(EXCLUDED.fbp,          tracking_sessions.fbp),
        fbc          = COALESCE(EXCLUDED.fbc,          tracking_sessions.fbc),
        fbclid       = COALESCE(EXCLUDED.fbclid,       tracking_sessions.fbclid),
        utm_source   = COALESCE(EXCLUDED.utm_source,   tracking_sessions.utm_source),
        utm_medium   = COALESCE(EXCLUDED.utm_medium,   tracking_sessions.utm_medium),
        utm_campaign = COALESCE(EXCLUDED.utm_campaign, tracking_sessions.utm_campaign),
        utm_content  = COALESCE(EXCLUDED.utm_content,  tracking_sessions.utm_content),
        utm_term     = COALESCE(EXCLUDED.utm_term,     tracking_sessions.utm_term),
        updated_at   = NOW()
    `;
  } catch (e) {
    console.error("[db] upsertSession error:", e);
  }
}

export async function logEvent(params: {
  eventId:        string;
  eventName:      string;
  provider?:      string;
  sessionId?:     string;
  transactionId?: string;
  payloadSent:    Record<string, unknown>;
  responseBody?:  Record<string, unknown>;
  responseStatus?: number;
  success:        boolean;
  errorMessage?:  string;
  attempt?:       number;
}): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await migrate(sql);
  try {
    await sql`
      INSERT INTO tracking_events
        (event_id, event_name, provider, session_id, transaction_id,
         payload_sent, response_body, response_status, success, error_message, attempt)
      VALUES
        (${params.eventId}, ${params.eventName}, ${params.provider ?? "meta"},
         ${params.sessionId ?? null}, ${params.transactionId ?? null},
         ${JSON.stringify(params.payloadSent)},
         ${params.responseBody ? JSON.stringify(params.responseBody) : null},
         ${params.responseStatus ?? null}, ${params.success},
         ${params.errorMessage ?? null}, ${params.attempt ?? 1})
      ON CONFLICT (event_id) DO NOTHING
    `;
  } catch (e) {
    console.error("[db] logEvent error:", e);
  }
}
