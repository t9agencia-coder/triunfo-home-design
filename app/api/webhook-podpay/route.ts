import { NextRequest, NextResponse } from "next/server";
import { processPaidPurchase } from "@/lib/purchase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    console.log("[webhook-podpay] payload recebido:", JSON.stringify(body).slice(0, 500));

    const podData = body?.data as Record<string, unknown> ?? body;
    const txId   = podData?.id     as string | undefined;
    const status = podData?.status as string | undefined;
    const total  = podData?.amount as number | undefined;

    if (!txId || !status) {
      console.log("[webhook-podpay] payload ignorado — txId ou status ausentes");
      return NextResponse.json({ ok: true });
    }

    if (status !== "paid") {
      console.log(`[webhook-podpay] status=${status} — ignorado`);
      return NextResponse.json({ ok: true });
    }

    console.log(`[webhook-podpay] pagamento confirmado: txId=${txId} total=${total}`);

    await processPaidPurchase({
      txId,
      totalCents: total ?? 0,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    console.error("[webhook-podpay] erro:", msg);
    return NextResponse.json({ ok: true });
  }
}
