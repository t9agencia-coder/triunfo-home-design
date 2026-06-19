/**
 * Audit log de eventos — implementado sobre Supabase Postgres.
 * Substitui a dependência do Neon (@neondatabase/serverless).
 *
 * Tabelas necessárias (rodar uma vez no SQL Editor do Supabase):
 *   -- ver lib/supabase-schema.sql
 */
import { getSupabase } from "./supabase";

export async function upsertSession(id: string, data: Record<string, unknown>): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const row = {
      id,
      fbp:          data.fbp          ?? null,
      fbc:          data.fbc          ?? null,
      fbclid:       data.fbclid       ?? null,
      utm_source:   data.utm_source   ?? null,
      utm_medium:   data.utm_medium   ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_content:  data.utm_content  ?? null,
      utm_term:     data.utm_term     ?? null,
      ip:           data.ip           ?? null,
      user_agent:   data.user_agent   ?? null,
      landing_page: data.landing_page ?? null,
      referer:      data.referer      ?? null,
      updated_at:   new Date().toISOString(),
    };
    await sb.from("tracking_sessions").upsert(row, { onConflict: "id" });
  } catch (e) {
    console.error("[db] upsertSession:", e);
  }
}

export async function logEvent(params: {
  eventId:         string;
  eventName:       string;
  provider?:       string;
  sessionId?:      string;
  transactionId?:  string;
  payloadSent:     Record<string, unknown>;
  responseBody?:   Record<string, unknown>;
  responseStatus?: number;
  success:         boolean;
  errorMessage?:   string;
  attempt?:        number;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from("tracking_events").upsert(
      {
        event_id:        params.eventId,
        event_name:      params.eventName,
        provider:        params.provider       ?? "meta",
        session_id:      params.sessionId      ?? null,
        transaction_id:  params.transactionId  ?? null,
        payload_sent:    params.payloadSent,
        response_body:   params.responseBody   ?? null,
        response_status: params.responseStatus ?? null,
        success:         params.success,
        error_message:   params.errorMessage   ?? null,
        attempt:         params.attempt        ?? 1,
      },
      { onConflict: "event_id", ignoreDuplicates: true }
    );
  } catch (e) {
    console.error("[db] logEvent:", e);
  }
}
