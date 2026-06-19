import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

function getClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_client) {
    _client = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _client;
}

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 dias
const DEDUP_TTL   = 60 * 60 * 24;     // 24 horas

export interface SessionData {
  fbp?:          string;
  fbc?:          string;
  fbclid?:       string;
  utm_source?:   string;
  utm_medium?:   string;
  utm_campaign?: string;
  utm_content?:  string;
  utm_term?:     string;
  ip?:           string;
  user_agent?:   string;
  landing_page?: string;
  referer?:      string;
  /* PII hashado (armazenado quando AddToCart é disparado) */
  pii?: Record<string, string[]>;
  created_at?: string;
}

export async function saveSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
  const r = getClient();
  if (!r) return;
  try {
    const existing = await getSession(sessionId);
    const merged = { ...existing, ...data, updated_at: new Date().toISOString() };
    if (!merged.created_at) merged.created_at = new Date().toISOString();
    await r.set(`session:${sessionId}`, JSON.stringify(merged), { ex: SESSION_TTL });
  } catch (e) {
    console.error("[redis] saveSession error:", e);
  }
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const r = getClient();
  if (!r) return null;
  try {
    const raw = await r.get<unknown>(`session:${sessionId}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : (raw as SessionData);
  } catch (e) {
    console.error("[redis] getSession error:", e);
    return null;
  }
}

export async function linkTransactionToSession(transactionId: string, sessionId: string): Promise<void> {
  const r = getClient();
  if (!r) return;
  try {
    await r.set(`txn:${transactionId}`, sessionId, { ex: SESSION_TTL });
  } catch (e) {
    console.error("[redis] linkTransaction error:", e);
  }
}

export async function getSessionByTransaction(transactionId: string): Promise<SessionData | null> {
  const r = getClient();
  if (!r) return null;
  try {
    const sessionId = await r.get<string>(`txn:${transactionId}`);
    if (!sessionId) return null;
    return getSession(typeof sessionId === "string" ? sessionId : String(sessionId));
  } catch (e) {
    console.error("[redis] getSessionByTransaction error:", e);
    return null;
  }
}

/** Retorna true se o eventId já foi processado (duplicado), false se é novo. */
export async function checkAndMarkDedup(eventId: string): Promise<boolean> {
  const r = getClient();
  if (!r) return false;
  try {
    const result = await r.set(`dedup:${eventId}`, "1", { ex: DEDUP_TTL, nx: true });
    return result === null; // null = chave já existia = duplicado
  } catch (e) {
    console.error("[redis] dedup error:", e);
    return false;
  }
}
