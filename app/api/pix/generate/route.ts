import { NextRequest, NextResponse } from "next/server";

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11
    ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
    : cpf;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.HUBPAG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key não configurada" }, { status: 500 });
    }

    const body = await req.json();
    const { nome, email, cpf, phone, valor, descricao } = body;

    if (!nome || !cpf || !valor) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios: nome, cpf, valor" }, { status: 400 });
    }

    const amountCents = Math.round(Number(valor) * 100);

    const payload = {
      amount: amountCents,
      method: "pix",
      customer: {
        name:  nome,
        email: email || "",
        phone: phone || "",
        document: {
          type:  "CPF",
          value: maskCpf(cpf),
        },
      },
      products: [{
        name:     descricao || "Produto",
        price:    amountCents,
        quantity: "1",
        type:     "digital",
      }],
    };

    const response = await fetch("https://app.hubpague.io/api/payments", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log(`[pix/generate] HubPag status=${response.status} body=${rawText.slice(0, 800)}`);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, error: `Gateway inválido (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const errMsg = String((data as Record<string, unknown>)?.message || (data as Record<string, unknown>)?.error || "Erro ao processar pagamento");
      return NextResponse.json({ success: false, error: errMsg }, { status: response.status });
    }

    const pix = (data.pix as Record<string, string>) ?? {};
    const copypaste = pix.copypaste || "";
    const qrCodeImage =
      pix.qrcode && pix.qrcode.trim() !== ""
        ? pix.qrcode
        : copypaste
          ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(copypaste)}`
          : "";

    return NextResponse.json({
      success:       true,
      transactionId: data.id as string,
      copyPaste:     copypaste,
      qrCodeImage,
      status:        (data.status as string) || "pending",
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("[pix/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
