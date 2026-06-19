import { NextRequest, NextResponse } from "next/server";
import { getSessionByTransaction } from "@/lib/redis";
import { logEvent } from "@/lib/db";
import { sendCAPIEvents } from "@/lib/meta/capi";
import { buildUserData, buildPurchaseEvent } from "@/lib/meta/events";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      success?: boolean;
      data?: {
        id?:            string;
        status?:        string;
        amount?:        number;
        paymentMethod?: string;
      };
    };

    console.log("[webhook] payload recebido:", JSON.stringify(body));

    const tx = body?.data;
    if (!tx?.id || !tx?.status) {
      return NextResponse.json({ ok: true });
    }

    /* Processar somente pagamentos confirmados */
    if (tx.status !== "paid") {
      console.log(`[webhook] status=${tx.status} — sem ação`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[webhook] pagamento confirmado: txId=${tx.id} valor=${tx.amount}`);

    /* ── Recuperar sessão de rastreamento ───────────────────── */
    const session = await getSessionByTransaction(tx.id);

    if (!session) {
      console.warn(`[webhook] sessão não encontrada para txId=${tx.id}`);
    }

    /* ── Montar evento Purchase ─────────────────────────────── */
    const eventId = `purchase_${tx.id}`;
    const value   = tx.amount ? tx.amount / 100 : 0; // PodPay envia em centavos

    const userData = buildUserData({
      session: session ?? {},
      pii:     (session as { pii?: Record<string, string[]> })?.pii,
    });

    const purchaseEvent = buildPurchaseEvent({
      eventId,
      userData,
      value,
      transactionId: tx.id,
    });

    /* ── Enviar Purchase via CAPI ───────────────────────────── */
    const result = await sendCAPIEvents([purchaseEvent]);

    console.log(`[webhook] CAPI Purchase — status=${result.status} success=${result.success}`, result.body);

    /* ── Audit log ──────────────────────────────────────────── */
    await logEvent({
      eventId,
      eventName:      "Purchase",
      transactionId:  tx.id,
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
