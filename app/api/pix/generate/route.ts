import { NextRequest, NextResponse } from "next/server";
import { createPixTransaction } from "@/lib/podpay";

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11
    ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
    : cpf;
}

interface HubPagTransaction {
  id:     string;
  status: string;
  pix?: {
    qrcode:    string;
    copypaste: string;
  };
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, cpf, phone, valor, descricao } = body;

    if (!nome || !cpf || !valor) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios: nome, cpf, valor" }, { status: 400 });
    }

    const amountCents = Math.round(Number(valor) * 100);
    const productName = descricao || "Produto";

    /* ── Tentativa 1: HubPag ────────────────────────────────── */
    let txId: string | null = null;
    let txStatus: string | null = null;
    let txPixCode = "";
    let txPixImg = "";
    let gateway = "HubPag";

    const hubPagKey = process.env.HUBPAG_API_KEY;
    if (hubPagKey) {
      const payload = {
        amount: amountCents,
        method: "pix",
        customer: {
          name:  nome,
          email: email || "",
          phone: phone || "",
          document: { type: "CPF", value: maskCpf(cpf) },
        },
        products: [{
          name:     productName,
          price:    amountCents,
          quantity: "1",
          type:     "digital",
        }],
      };

      try {
        const res = await fetch("https://app.hubpague.io/api/payments", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${hubPagKey}`,
          },
          body: JSON.stringify(payload),
        });

        const rawText = await res.text();
        console.log(`[pix/generate] HubPag status=${res.status} body=${rawText.slice(0, 800)}`);

        let hubData: HubPagTransaction;
        try { hubData = JSON.parse(rawText) as HubPagTransaction; } catch { hubData = { id: "", status: "" }; }

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
          console.warn(`[pix/generate] HubPag falhou: ${errMsg}`);
        }
      } catch (e) {
        console.warn("[pix/generate] HubPag exception:", e instanceof Error ? e.message : e);
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
          name: nome,
          email: email || "",
          phone: phone || "",
          document: { type: "cpf", number: cpf.replace(/\D/g, "") },
        },
        items: [{
          title:     productName,
          unitPrice: amountCents,
          quantity:  1,
          tangible:  false,
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
        console.log(`[pix/generate] PodPay sucesso: txId=${txId}`);
      } else {
        console.error("[pix/generate] PodPay também falhou:", podResult.error);
      }
    }

    if (!txId) {
      return NextResponse.json(
        { success: false, error: "Nenhum gateway disponível no momento. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success:       true,
      transactionId: txId,
      copyPaste:     txPixCode,
      qrCodeImage:   txPixImg,
      status:        txStatus,
      acquirerSlug:  gateway === "HubPag" ? "hubpag" : "podpay",
      gateway,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro interno";
    console.error("[pix/generate] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
