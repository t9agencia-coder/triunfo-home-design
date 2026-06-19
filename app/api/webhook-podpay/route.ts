import { NextRequest, NextResponse } from "next/server";
import { getSessionByTransaction } from "@/lib/redis";
import { logEvent } from "@/lib/db";
import { sendCAPIEvents } from "@/lib/meta/capi";
import { buildUserData, buildPurchaseEvent } from "@/lib/meta/events";
import { sendOrderToUtmify, UtmifyOrder } from "@/lib/utmify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    console.log("[webhook-podpay] payload:", JSON.stringify(body));

    const podData = body?.data as Record<string, unknown> ?? body;
    const txId   = podData?.id     as string | undefined;
    const status = podData?.status as string | undefined;
    const total  = podData?.amount as number | undefined;

    if (!txId || !status) {
      return NextResponse.json({ ok: true });
    }

    if (status !== "paid") {
      console.log(`[webhook-podpay] status=${status} — ignorado`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[webhook-podpay] pagamento confirmado: txId=${txId}`);

    /* ── Sessão ─────────────────────────────────────────────── */
    const session = await getSessionByTransaction(txId);

    if (!session) {
      console.warn(`[webhook-podpay] sessão não encontrada para txId=${txId}`);
    }

    /* ── Purchase CAPI ──────────────────────────────────────── */
    const eventId = `purchase_${txId}`;
    const value   = total ? total / 100 : 0;

    const userData = buildUserData({
      session: session ?? {},
      pii:     (session as { pii?: Record<string, string[]> })?.pii,
    });

    const purchaseEvent = buildPurchaseEvent({
      eventId, userData, value, transactionId: txId,
    });

    const result = await sendCAPIEvents([purchaseEvent]);
    console.log(`[webhook-podpay] CAPI Purchase — status=${result.status} success=${result.success}`);

    /* ── Audit log ──────────────────────────────────────────── */
    await logEvent({
      eventId, eventName: "Purchase", transactionId: txId,
      payloadSent: purchaseEvent as unknown as Record<string, unknown>,
      responseBody: result.body, responseStatus: result.status,
      success: result.success, errorMessage: result.error,
    });

    /* ── Utmify paid ────────────────────────────────────────── */
    void sendUtmifyPaid(txId, total ?? 0, session, new Date().toISOString());

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    console.error("[webhook-podpay] erro:", msg);
    return NextResponse.json({ ok: true });
  }
}

async function sendUtmifyPaid(
  txId: string,
  totalCents: number,
  session: Record<string, unknown> | null,
  now: string,
) {
  if (!session) return;

  const rawPII = session.raw_pii as Record<string, string> | undefined;
  if (!rawPII?.name) {
    console.warn("[webhook-podpay/utmify] raw_pii ausente");
    return;
  }

  const createdAt = (session.created_at as string) || now;
  const amountCents = totalCents || 0;

  const order: UtmifyOrder = {
    orderId:       txId,
    platform:      "TriunfoHomeDesign",
    paymentMethod: "pix",
    status:        "paid",
    createdAt:     createdAt.replace("T", " ").slice(0, 19),
    approvedDate:  now.replace("T", " ").slice(0, 19),
    refundedAt:    null,
    customer: {
      name: rawPII.name, email: rawPII.email || "", phone: rawPII.phone || null,
      document: rawPII.document || null, country: "BR",
    },
    products: [{
      id: "flexhome-armario-multifuncional", name: "FlexHome - Armário Multifuncional",
      planId: null, planName: null, quantity: 1, priceInCents: amountCents,
    }],
    trackingParameters: {
      src: null, sck: null,
      utm_source: (session.utm_source as string) || null,
      utm_campaign: (session.utm_campaign as string) || null,
      utm_medium: (session.utm_medium as string) || null,
      utm_content: (session.utm_content as string) || null,
      utm_term: (session.utm_term as string) || null,
    },
    commission: {
      totalPriceInCents: amountCents, gatewayFeeInCents: 0, userCommissionInCents: amountCents,
    },
  };

  const r = await sendOrderToUtmify(order);
  console.log(`[webhook-podpay/utmify] result:`, r);
}
