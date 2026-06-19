import { NextRequest, NextResponse } from "next/server";
import { getSessionByTransaction } from "@/lib/redis";
import { logEvent } from "@/lib/db";
import { sendCAPIEvents } from "@/lib/meta/capi";
import { buildUserData, buildPurchaseEvent } from "@/lib/meta/events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    console.log("[webhook] payload recebido:", JSON.stringify(body));

    // HubPag pode enviar flat ou envolvido em .data
    const tx = (body?.data as Record<string, unknown>) ?? body;
    const txId   = tx?.id     as string | undefined;
    const status = tx?.status as string | undefined;
    const total  = tx?.total  as number | undefined; // centavos

    if (!txId || !status) {
      return NextResponse.json({ ok: true });
    }

    /* Processar somente pagamentos confirmados */
    if (status !== "paid") {
      console.log(`[webhook] status=${status} — sem ação`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[webhook] pagamento confirmado: txId=${txId} total=${total}`);

    /* ── Recuperar sessão de rastreamento ───────────────────── */
    const session = await getSessionByTransaction(txId);

    if (!session) {
      console.warn(`[webhook] sessão não encontrada para txId=${txId}`);
    }

    /* ── Montar evento Purchase ─────────────────────────────── */
    const eventId = `purchase_${txId}`;
    const value   = total ? total / 100 : 0; // HubPag envia em centavos

    const userData = buildUserData({
      session: session ?? {},
      pii:     (session as { pii?: Record<string, string[]> })?.pii,
    });

    const purchaseEvent = buildPurchaseEvent({
      eventId,
      userData,
      value,
      transactionId: txId,
    });

    /* ── Enviar Purchase via CAPI ───────────────────────────── */
    const result = await sendCAPIEvents([purchaseEvent]);

    console.log(`[webhook] CAPI Purchase — status=${result.status} success=${result.success}`, result.body);

    /* ── Audit log ──────────────────────────────────────────── */
    await logEvent({
      eventId,
      eventName:      "Purchase",
      transactionId:  txId,
      payloadSent:    purchaseEvent as unknown as Record<string, unknown>,
      responseBody:   result.body,
      responseStatus: result.status,
      success:        result.success,
      errorMessage:   result.error,
    });

    return NextResponse.json({ ok: true });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    console.error("[webhook] erro:", msg);
    return NextResponse.json({ ok: true }); // sempre 200 para o gateway não retentar desnecessariamente
  }
}
