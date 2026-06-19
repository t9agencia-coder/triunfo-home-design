import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.HUBPAG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parâmetro id é obrigatório" }, { status: 400 });
    }

    const response = await fetch(`https://app.hubpague.io/api/transactions/${id}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    const rawText = await response.text();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Resposta inválida do gateway" }, { status: 502 });
    }

    if (!response.ok) {
      const errMsg = String(body?.message || body?.error || "Erro ao consultar transação");
      return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    // HubPag envolve a resposta em .data
    const tx = (body.data as Record<string, unknown>) ?? body;

    return NextResponse.json({
      id:     tx.id     as string,
      status: tx.status as string,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("payment-status error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
