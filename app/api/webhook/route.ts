import { NextRequest, NextResponse } from "next/server";
import { processPaidPurchase } from "@/lib/purchase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    console.log("[webhook] payload recebido:", JSON.stringify(body).slice(0, 500));

    // HubPag pode enviar flat ou envolvido em .data
    const tx = (body?.data as Record<string, unknown>) ?? body;
    const txId   = tx?.id     as string | undefined;
    const status = tx?.status as string | undefined;
    const total  = tx?.total  as number | undefined;

    if (!txId || !status) {
      console.log("[webhook] payload ignorado — txId ou status ausentes");
      return NextResponse.json({ ok: true });
    }

    if (status !== "paid") {
      console.log(`[webhook] status=${status} — sem ação`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[webhook] pagamento confirmado: txId=${txId} total=${total}`);

    await processPaidPurchase({
      txId,
      totalCents: total ?? 0,
    });

    return NextResponse.json({ ok: true });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    console.error("[webhook] erro:", msg);
    return NextResponse.json({ ok: true });
  }
}
