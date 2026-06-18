import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.PODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, phone, cpf, amount, title, quantity, description } = body;

    if (!name || !cpf || !amount) {
      return NextResponse.json({ error: "Campos obrigatórios: name, cpf, amount" }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const payload = {
      paymentMethod: "pix",
      postbackUrl: `${protocol}://${host}/api/webhook`,
      customer: {
        document: {
          type: "cpf",
          number: cpf.replace(/\D/g, ""),
        },
        name,
        email: email || "",
        phone: phone ? phone.replace(/\D/g, "") : "",
      },
      amount: Math.round(amount * 100),
      items: [
        {
          title: title || "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]",
          unitPrice: Math.round(amount * 100),
          quantity: quantity || 1,
          tangible: true,
        },
      ],
    };

    const response = await fetch("https://api.podpay.app/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("PodPay error:", data);
      return NextResponse.json(
        { error: data.error?.message || data.error?.code || "Erro ao processar pagamento" },
        { status: response.status }
      );
    }

    const tx = data.data;

    return NextResponse.json({
      id: tx.id,
      status: tx.status,
      pixQrCode: tx.pixQrCode,
      pixQrCodeImage: tx.pixQrCodeImage,
      amount,
    });
  } catch (error: any) {
    console.error("create-pix error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
