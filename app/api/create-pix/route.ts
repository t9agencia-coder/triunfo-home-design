import { NextRequest, NextResponse } from "next/server";
import { linkTransactionToSession, saveSession } from "@/lib/redis";
import { hashPII, splitName } from "@/lib/hash";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.PODPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, phone, cpf, amount, title, quantity, description, address, sessionId } = body;

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

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("PodPay error:", data);
      return NextResponse.json(
        { error: data.error?.message || data.error?.code || "Erro ao processar pagamento" },
        { status: response.status }
      );
    }

    const tx = data.data;

    /* Associar transação à sessão de rastreamento */
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

      await Promise.allSettled([
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
