import { NextRequest, NextResponse } from "next/server";
import { linkTransactionToSession, saveSession } from "@/lib/redis";
import { hashPII, splitName } from "@/lib/hash";

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}` : cpf;
}

interface HubPagTransaction {
  id:     string;
  total:  number;
  status: string;
  pix?: {
    qrcode:    string;
    copypaste: string;
    end2EndId: string | null;
  };
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.HUBPAG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key não configurada" }, { status: 500 });
    }

    const body = await req.json();
    const { name, email, phone, cpf, amount, title, quantity, address, sessionId } = body;

    if (!name || !cpf || !amount) {
      return NextResponse.json({ error: "Campos obrigatórios: name, cpf, amount" }, { status: 400 });
    }

    const amountCents = Math.round(amount * 100);

    const payload: Record<string, unknown> = {
      amount: amountCents,
      method: "pix",
      customer: {
        name,
        email: email || "",
        phone: phone || "",
        document: {
          type:  "CPF",
          value: maskCpf(cpf),
        },
      },
      products: [{
        name:     title || "FlexHome - Armário Multifuncional",
        price:    amountCents,
        quantity: String(quantity || 1),
        type:     "physical",
      }],
    };

    if (address) {
      payload.delivery = {
        street:       address.street       || "",
        number:       address.number       || "",
        complement:   address.complement   || "",
        neighborhood: address.neighborhood || "",
        city:         address.city         || "",
        state:        address.state        || "",
        zipcode:      address.zip          || "",
      };
    }

    const response = await fetch("https://app.hubpague.io/api/payments", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log(`[create-pix] HubPag status=${response.status} body=${rawText.slice(0, 800)}`);

    let data: HubPagTransaction;
    try {
      data = JSON.parse(rawText) as HubPagTransaction;
    } catch {
      return NextResponse.json(
        { error: `Gateway retornou resposta inválida (HTTP ${response.status})` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const errData = data as unknown as Record<string, unknown>;
      const errMsg = String(errData?.message || errData?.error || "Erro ao processar pagamento");
      console.error("[create-pix] HubPag rejeitou:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: response.status });
    }

    if (!data?.id) {
      return NextResponse.json({ error: "Resposta inesperada do gateway" }, { status: 502 });
    }

    const copypaste = data.pix?.copypaste || "";
    // Se HubPag não retornar imagem do QR, gera via serviço público
    const qrCodeImage =
      (data.pix?.qrcode && data.pix.qrcode.trim() !== "")
        ? data.pix.qrcode
        : copypaste
          ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(copypaste)}`
          : "";

    /* Associar transação à sessão de rastreamento (non-blocking) */
    if (sessionId && data.id) {
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
        linkTransactionToSession(data.id, sessionId),
        saveSession(sessionId, { pii: hashedPII }),
      ]);
    }

    return NextResponse.json({
      id:             data.id,
      status:         data.status,
      pixQrCode:      copypaste,
      pixQrCodeImage: qrCodeImage,
      amount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("create-pix error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
