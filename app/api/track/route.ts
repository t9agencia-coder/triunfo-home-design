import { NextRequest, NextResponse } from "next/server";
import { saveSession, checkAndMarkDedup, SessionData } from "@/lib/redis";
import { upsertSession, logEvent } from "@/lib/db";
import { sendCAPIEvents } from "@/lib/meta/capi";
import { buildUserData, buildEvent } from "@/lib/meta/events";
import { hashPII, splitName } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      eventName:  string;
      eventId:    string;
      sessionId:  string;
      fbp?:       string;
      fbc?:       string;
      url?:       string;
      referer?:   string;
      utms?:      Record<string, string>;
      data?:      Record<string, unknown>;
      /* PII em claro — enviado apenas no AddToCart */
      pii?: {
        email?:  string;
        phone?:  string;
        name?:   string;
        city?:   string;
        state?:  string;
        zip?:    string;
      };
    };

    const { eventName, eventId, sessionId, fbp, fbc, url, referer, utms, data, pii } = body;

    if (!eventName || !eventId || !sessionId) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    /* ── IP e User-Agent reais ──────────────────────────────── */
    const ip        = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    /* ── Sessão: merge e persistência ──────────────────────── */
    const sessionData: Partial<SessionData> = {
      fbp:          fbp          || undefined,
      fbc:          fbc          || undefined,
      fbclid:       utms?.fbclid || undefined,
      utm_source:   utms?.utm_source   || undefined,
      utm_medium:   utms?.utm_medium   || undefined,
      utm_campaign: utms?.utm_campaign || undefined,
      utm_content:  utms?.utm_content  || undefined,
      utm_term:     utms?.utm_term     || undefined,
      ip:           ip,
      user_agent:   userAgent,
      landing_page: url     || undefined,
      referer:      referer || undefined,
    };

    /* Hashar PII e guardar na sessão quando presente (AddToCart) */
    if (pii) {
      const { firstName, lastName } = splitName(pii.name ?? "");
      sessionData.pii = hashPII({
        email:     pii.email,
        phone:     pii.phone,
        firstName: firstName || undefined,
        lastName:  lastName  || undefined,
        city:      pii.city,
        state:     pii.state,
        zip:       pii.zip,
      });
    }

    /* Salva em Redis e Postgres em paralelo (erros não bloqueiam) */
    const sessionForDB = {
      ...sessionData,
      ...utms,
    };

    await Promise.allSettled([
      saveSession(sessionId, sessionData),
      upsertSession(sessionId, sessionForDB as Record<string, unknown>),
    ]);

    /* ── Deduplicação ──────────────────────────────────────── */
    const isDuplicate = await checkAndMarkDedup(eventId);
    if (isDuplicate) {
      return NextResponse.json({ ok: true, deduplicated: true });
    }

    /* ── Construir evento CAPI ─────────────────────────────── */
    const sessionFull: SessionData = {
      ...sessionData,
      ip,
      user_agent: userAgent,
    };

    const userData = buildUserData({
      session: sessionFull,
      ...(pii ?? {}),
    });

    const customData: Record<string, unknown> = {
      ...(data ?? {}),
      currency: (data?.currency as string) || "BRL",
    };

    const capiEvent = buildEvent(eventName, {
      eventId,
      userData,
      sourceUrl:  url,
      customData: Object.keys(customData).length > 0 ? customData : undefined,
    });

    /* ── Enviar para Meta CAPI ─────────────────────────────── */
    const result = await sendCAPIEvents([capiEvent]);

    /* ── Audit log ─────────────────────────────────────────── */
    await logEvent({
      eventId,
      eventName,
      sessionId,
      payloadSent:    capiEvent as unknown as Record<string, unknown>,
      responseBody:   result.body,
      responseStatus: result.status,
      success:        result.success,
      errorMessage:   result.error,
    });

    return NextResponse.json({ ok: true, success: result.success });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    console.error("[/api/track]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
