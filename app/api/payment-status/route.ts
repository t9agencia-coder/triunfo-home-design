import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.PODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parâmetro id é obrigatório" }, { status: 400 });
    }

    const response = await fetch(`https://api.podpay.app/v1/transactions/${id}`, {
      headers: { "x-api-key": apiKey },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { error: data.error?.message || "Erro ao consultar transação" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: data.data.id,
      status: data.data.status,
    });
  } catch (error: any) {
    console.error("payment-status error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
