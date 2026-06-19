import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/podpay";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parâmetro id é obrigatório" }, { status: 400 });
    }

    /* Tentar HubPag primeiro */
    const hubPagKey = process.env.HUBPAG_API_KEY;
    if (hubPagKey) {
      try {
        const res = await fetch(`https://app.hubpague.io/api/transactions/${id}`, {
          headers: { "Authorization": `Bearer ${hubPagKey}` },
        });

        if (res.ok) {
          const rawText = await res.text();
          const body = JSON.parse(rawText) as Record<string, unknown>;
          const tx = (body.data as Record<string, unknown>) ?? body;
          if (tx?.id) {
            return NextResponse.json({ id: tx.id as string, status: tx.status as string });
          }
        }
      } catch { /* fallback */ }
    }

    /* Fallback: PodPay */
    const podResult = await getTransactionStatus(id);
    if (podResult.ok) {
      return NextResponse.json({ id: podResult.data.id, status: podResult.data.status });
    }

    return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("payment-status error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
