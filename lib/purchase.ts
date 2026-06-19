import { getSessionByTransaction, checkAndMarkDedup, SessionData } from "@/lib/redis";
import { logEvent } from "@/lib/db";
import { sendCAPIEvents } from "@/lib/meta/capi";
import { buildUserData, buildPurchaseEvent } from "@/lib/meta/events";
import { sendOrderToUtmify, UtmifyOrder } from "@/lib/utmify";

export async function processPaidPurchase(params: {
  txId: string;
  totalCents: number;
  now?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { txId, totalCents } = params;
  const now = params.now || new Date().toISOString();

  console.log(`[purchase] processando pagamento: txId=${txId} totalCents=${totalCents}`);

  /* ── Recuperar sessão de rastreamento ───────────────────── */
  const session = await getSessionByTransaction(txId);

  if (!session) {
    console.warn(`[purchase] sessão não encontrada para txId=${txId}`);
  }

  const sessionData: SessionData = session ?? {};

  /* ── Deduplicação ────────────────────────────────────────── */
  const eventId = `purchase_${txId}`;
  const isDuplicate = await checkAndMarkDedup(eventId);
  if (isDuplicate) {
    console.log(`[purchase] evento duplicado, ignorando: ${eventId}`);
    return { ok: true };
  }

  /* ── Montar e enviar Purchase via CAPI ──────────────────── */
  const value = totalCents ? totalCents / 100 : 0;

  const userData = buildUserData({
    session: sessionData,
    pii:     sessionData.pii,
  });

  const purchaseEvent = buildPurchaseEvent({
    eventId,
    userData,
    value,
    transactionId: txId,
  });

  const capiResult = await sendCAPIEvents([purchaseEvent]);

  console.log(`[purchase] CAPI Purchase — status=${capiResult.status} success=${capiResult.success}`, capiResult.body);

  /* ── Audit log ──────────────────────────────────────────── */
  await logEvent({
    eventId,
    eventName:      "Purchase",
    transactionId:  txId,
    payloadSent:    purchaseEvent as unknown as Record<string, unknown>,
    responseBody:   capiResult.body,
    responseStatus: capiResult.status,
    success:        capiResult.success,
    errorMessage:   capiResult.error,
  });

  /* ── Enviar paid para Utmify (non-blocking) ─────────────── */
  void sendUtmifyPaid(txId, totalCents, sessionData, now);

  return { ok: true };
}

async function sendUtmifyPaid(
  txId: string,
  totalCents: number,
  session: SessionData,
  now: string,
) {
  const rawPII = session.raw_pii;
  if (!rawPII?.name) {
    console.warn("[purchase/utmify] raw_pii ausente, pulando Utmify");
    return;
  }

  const createdAt = session.created_at || now;
  const amountCents = totalCents || Number((session as Record<string, string>).total_price_in_cents) || 0;

  const order: UtmifyOrder = {
    orderId:       txId,
    platform:      "TriunfoHomeDesign",
    paymentMethod: "pix",
    status:        "paid",
    createdAt:     createdAt.replace("T", " ").slice(0, 19),
    approvedDate:  now.replace("T", " ").slice(0, 19),
    refundedAt:    null,
    customer: {
      name:     rawPII.name,
      email:    rawPII.email || "",
      phone:    rawPII.phone || null,
      document: rawPII.document || null,
      country:  "BR",
    },
    products: [{
      id:           "flexhome-armario-multifuncional",
      name:         "FlexHome - Armário Multifuncional",
      planId:       null,
      planName:     null,
      quantity:     1,
      priceInCents: amountCents,
    }],
    trackingParameters: {
      src:          null,
      sck:          null,
      utm_source:   session.utm_source   || null,
      utm_campaign: session.utm_campaign || null,
      utm_medium:   session.utm_medium   || null,
      utm_content:  session.utm_content  || null,
      utm_term:     session.utm_term     || null,
    },
    commission: {
      totalPriceInCents:    amountCents,
      gatewayFeeInCents:    0,
      userCommissionInCents: amountCents,
    },
  };

  const result = await sendOrderToUtmify(order);
  console.log(`[purchase/utmify] paid result:`, result);
}
