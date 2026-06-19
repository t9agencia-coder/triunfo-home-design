import { NextRequest, NextResponse } from "next/server";
import { linkTransactionToSession, saveSession } from "@/lib/redis";
import { hashPII, splitName } from "@/lib/hash";
import { sendOrderToUtmify } from "@/lib/utmify";
import { createPixTransaction } from "@/lib/podpay";

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
    const body = await req.json();
    const { name, email, phone, cpf, amount, title, quantity, address, sessionId, utms } = body;

    if (!name || !cpf || !amount) {
      return NextResponse.json({ error: "Campos obrigatórios: name, cpf, amount" }, { status: 400 });
    }

    const amountCents = Math.round(amount * 100);
    const rawUtms = utms as Record<string, string> | undefined;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;

    /* ── Tentativa 1: HubPag ────────────────────────────────── */
    let txId: string | null = null;
    let txStatus: string | null = null;
    let txPixCode = "";
    let txPixImg = "";
    let gateway = "HubPag";

    const hubPagKey = process.env.HUBPAG_API_KEY;
    if (hubPagKey) {
      const hubPagPayload: Record<string, unknown> = {
        amount: amountCents,
        method: "pix",
        customer: {
          name,
          email: email || "",
          phone: phone || "",
          document: { type: "CPF", value: maskCpf(cpf) },
        },
        products: [{
          name:     title || "FlexHome - Armário Multifuncional",
          price:    amountCents,
          quantity: String(quantity || 1),
          type:     "physical",
        }],
      };

      if (address) {
        hubPagPayload.delivery = {
          street:       address.street       || "",
          number:       address.number       || "",
          complement:   address.complement   || "",
          neighborhood: address.neighborhood || "",
          city:         address.city         || "",
          state:        address.state        || "",
          zipcode:      address.zip          || "",
        };
      }

      try {
        const res = await fetch("https://app.hubpague.io/api/payments", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${hubPagKey}`,
          },
          body: JSON.stringify(hubPagPayload),
        });

        const rawText = await res.text();
        console.log(`[create-pix] HubPag status=${res.status} body=${rawText.slice(0, 800)}`);

        let hubData: HubPagTransaction;
        try { hubData = JSON.parse(rawText) as HubPagTransaction; } catch { hubData = { id: "", total: 0, status: "" }; }

        if (res.ok && hubData?.id) {
          txId = hubData.id;
          txStatus = hubData.status || "pending";
          txPixCode = hubData.pix?.copypaste || "";
          const hasQr = hubData.pix?.qrcode && hubData.pix.qrcode.trim() !== "";
          txPixImg = hasQr
            ? hubData.pix!.qrcode
            : txPixCode
              ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(txPixCode)}`
              : "";
        } else {
          const errMsg = String((hubData as unknown as Record<string, unknown>)?.message || "HubPag indisponível");
          console.warn(`[create-pix] HubPag falhou: ${errMsg}`);
        }
      } catch (e) {
        console.warn("[create-pix] HubPag exception:", e instanceof Error ? e.message : e);
      }
    }

    /* ── Tentativa 2: PodPay (fallback) ─────────────────────── */
    if (!txId) {
      gateway = "PodPay";
      const postbackUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/webhook-podpay`
        : undefined;

      const podResult = await createPixTransaction({
        amountCents,
        customer: {
          name,
          email: email || "",
          phone: phone || "",
          document: { type: "cpf", number: cpf.replace(/\D/g, "") },
        },
        items: [{
          title:     title || "FlexHome - Armário Multifuncional",
          unitPrice: amountCents,
          quantity:  Number(quantity || 1),
          tangible:  true,
        }],
        postbackUrl,
      });

      if (podResult.ok) {
        const d = podResult.data;
        txId = d.id;
        txStatus = d.status || "pending";
        txPixCode = d.pixQrCode || "";
        txPixImg = d.pixQrCodeImage
          ? d.pixQrCodeImage
          : txPixCode
            ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(txPixCode)}`
            : "";
        console.log(`[create-pix] PodPay sucesso: txId=${txId}`);
      } else {
        console.error("[create-pix] PodPay também falhou:", podResult.error);
      }
    }

    if (!txId) {
      return NextResponse.json(
        { error: "Nenhum gateway disponível no momento. Tente novamente." },
        { status: 502 }
      );
    }

    /* ── Associar transação à sessão de rastreamento ────────── */
    if (sessionId) {
      const { firstName, lastName } = splitName(name ?? "");
      const hashedPII = hashPII({
        email, phone: phone ? phone.replace(/\D/g, "") : undefined,
        firstName: firstName || undefined, lastName: lastName || undefined,
        city: address?.city, state: address?.state, zip: address?.zip,
      });

      await Promise.allSettled([
        linkTransactionToSession(txId, sessionId),
        saveSession(sessionId, {
          pii: hashedPII,
          raw_pii: { name, email: email || "", phone: phone || "", document: cpf.replace(/\D/g, "") },
        }),
      ]);

      /* Enviar waiting_payment para Utmify */
      void sendOrderToUtmify({
        orderId:       txId,
        platform:      "TriunfoHomeDesign",
        paymentMethod: "pix",
        status:        "waiting_payment",
        createdAt:     new Date().toISOString().replace("T", " ").slice(0, 19),
        approvedDate:  null,
        refundedAt:    null,
        customer: { name, email: email || "", phone: phone || null, document: cpf.replace(/\D/g, ""), country: "BR", ip },
        products: [{
          id: "flexhome-armario-multifuncional", name: title || "FlexHome - Armário Multifuncional",
          planId: null, planName: null, quantity: Number(quantity || 1), priceInCents: amountCents,
        }],
        trackingParameters: {
          src: rawUtms?.src || null, sck: rawUtms?.sck || null,
          utm_source: rawUtms?.utm_source || null, utm_campaign: rawUtms?.utm_campaign || null,
          utm_medium: rawUtms?.utm_medium || null, utm_content: rawUtms?.utm_content || null,
          utm_term: rawUtms?.utm_term || null,
        },
        commission: { totalPriceInCents: amountCents, gatewayFeeInCents: 0, userCommissionInCents: amountCents },
      });
    }

    return NextResponse.json({
      id: txId, status: txStatus, pixQrCode: txPixCode, pixQrCodeImage: txPixImg, amount, gateway,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("create-pix error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
