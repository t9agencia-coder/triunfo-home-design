import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/podpay";
import { processPaidPurchase } from "@/lib/purchase";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parâmetro id é obrigatório" }, { status: 400 });
    }

    let txId: string | null = null;
    let txStatus: string | null = null;

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
            txId = tx.id as string;
            txStatus = tx.status as string;
          }
        }
      } catch { /* fallback */ }
    }

    /* Fallback: PodPay */
    if (!txId) {
      const podResult = await getTransactionStatus(id);
      if (podResult.ok) {
        txId = podResult.data.id;
        txStatus = podResult.data.status;
      }
    }

    if (!txId || !txStatus) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
    }

    /* Fallback: se o pagamento foi confirmado, dispara Purchase + Utmify
       (caso o webhook não tenha sido chamado ou tenha falhado) */
    if (txStatus === "paid") {
      void processPaidPurchase({ txId, totalCents: 0 });
    }

    return NextResponse.json({ id: txId, status: txStatus });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("payment-status error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
