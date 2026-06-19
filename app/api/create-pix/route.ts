import { NextRequest, NextResponse } from "next/server";
import { linkTransactionToSession, saveSession } from "@/lib/redis";
import { hashPII, splitName } from "@/lib/hash";

interface PodPayTransaction {
  id:             string;
  status:         string;
  pixQrCode:      string;
  pixQrCodeImage: string;
  [key: string]:  unknown;
}

interface PodPayResponse {
  success?: boolean;
  data?:    PodPayTransaction;
  error?:   unknown;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.PODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, phone, cpf, amount, title, quantity, address, sessionId } = body;

    if (!name || !cpf || !amount) {
      return NextResponse.json({ error: "Campos obrigatórios: name, cpf, amount" }, { status: 400 });
    }

    const host     = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const payload = {
      paymentMethod: "pix",
      postbackUrl: `${protocol}://${host}/api/webhook`,
      customer: {
        document: { type: "cpf", number: cpf.replace(/\D/g, "") },
        name,
        email: email || "",
        phone: phone ? phone.replace(/\D/g, "") : "",
        address: address ? {
          zip:          address.zip,
          street:       address.street,
          number:       address.number,
          complement:   address.complement || "",
          neighborhood: address.neighborhood,
          city:         address.city,
          state:        address.state,
        } : undefined,
      },
      amount: Math.round(amount * 100),
      items: [{
        title:     title || "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]",
        unitPrice: Math.round(amount * 100),
        quantity:  quantity || 1,
        tangible:  true,
      }],
    };

    const response = await fetch("https://api.podpay.app/v1/transactions", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body:    JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log(`[create-pix] PodPay status=${response.status} body=${rawText.slice(0, 800)}`);

    let data: PodPayResponse;
    try {
      data = JSON.parse(rawText) as PodPayResponse;
    } catch {
      return NextResponse.json(
        { error: `Gateway retornou resposta inválida (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    if (!response.ok || !data.success) {
      const errData = data.error;
      let errMsg = "Erro ao processar pagamento";
      if (typeof errData === "string") errMsg = errData;
      else if (errData && typeof errData === "object") {
        const e = errData as Record<string, string>;
        errMsg = e.message || e.code || JSON.stringify(errData);
      }
      console.error("[create-pix] PodPay rejeitou:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: response.ok ? 422 : response.status });
    }

    const tx = data.data;
    if (!tx?.id) {
      return NextResponse.json({ error: "Resposta inesperada do gateway" }, { status: 502 });
    }

    /* Associar transação à sessão de rastreamento (non-blocking) */
    if (sessionId && tx.id) {
      const { firstName, lastName } = splitName(name ?? "");
      const hashedPII = hashPII({
        email:     email,
        phone:     phone ? phone.replace(/\D/g, "") : undefined,
        firstName: firstName || undefined,
        lastName:  lastName  || undefined,
        city:      address?.city,
        state:     address?.state,
        zip:       address?.zip,
      });

      void Promise.allSettled([
        linkTransactionToSession(tx.id, sessionId),
        saveSession(sessionId, { pii: hashedPII }),
      ]);
    }

    return NextResponse.json({
      id:             tx.id,
      status:         tx.status,
      pixQrCode:      tx.pixQrCode,
      pixQrCodeImage: tx.pixQrCodeImage,
      amount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("create-pix error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
