/**
 * Módulo de sessão — implementado sobre Supabase Postgres.
 * Substitui a dependência do Upstash Redis.
 *
 * Tabelas necessárias (rodar uma vez no SQL Editor do Supabase):
 *   -- ver lib/supabase-schema.sql
 */
import { getSupabase } from "./supabase";

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
  pii?:          Record<string, string[]>;
  created_at?:   string;
  updated_at?:   string;
}

export async function saveSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data: row } = await sb
      .from("thd_sessions")
      .select("data")
      .eq("session_id", sessionId)
      .maybeSingle();

    const existing = (row?.data ?? {}) as SessionData;
    const merged: SessionData = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    if (!merged.created_at) merged.created_at = new Date().toISOString();

    await sb.from("thd_sessions").upsert(
      { session_id: sessionId, data: merged },
      { onConflict: "session_id" }
    );
  } catch (e) {
    console.error("[supabase] saveSession:", e);
  }
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: row } = await sb
      .from("thd_sessions")
      .select("data")
      .eq("session_id", sessionId)
      .maybeSingle();
    return (row?.data as SessionData) ?? null;
  } catch (e) {
    console.error("[supabase] getSession:", e);
    return null;
  }
}

export async function linkTransactionToSession(transactionId: string, sessionId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("thd_txn_sessions").upsert(
      { transaction_id: transactionId, session_id: sessionId },
      { onConflict: "transaction_id" }
    );
  } catch (e) {
    console.error("[supabase] linkTransaction:", e);
  }
}

export async function getSessionByTransaction(transactionId: string): Promise<SessionData | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data: row } = await sb
      .from("thd_txn_sessions")
      .select("session_id")
      .eq("transaction_id", transactionId)
      .maybeSingle();
    if (!row?.session_id) return null;
    return getSession(row.session_id as string);
  } catch (e) {
    console.error("[supabase] getSessionByTransaction:", e);
    return null;
  }
}

/** Retorna true se o eventId já foi processado (duplicado). */
export async function checkAndMarkDedup(eventId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("thd_dedup").insert({ event_id: eventId });
    if (error?.code === "23505") return true; // violação de unique = duplicado
    return false;
  } catch {
    return false;
  }
}
