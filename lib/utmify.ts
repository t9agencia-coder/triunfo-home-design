const UTMIFY_API = "https://api.utmify.com.br/api-credentials/orders";

export interface UtmifyOrder {
  orderId:           string;
  platform:          string;
  paymentMethod:     "pix";
  status:            "waiting_payment" | "paid" | "refused" | "refunded";
  createdAt:         string;
  approvedDate:      string | null;
  refundedAt:        string | null;
  customer: {
    name:     string;
    email:    string;
    phone:    string | null;
    document: string | null;
    country?: string;
    ip?:      string;
  };
  products: Array<{
    id:           string;
    name:         string;
    planId:       string | null;
    planName:     string | null;
    quantity:     number;
    priceInCents: number;
  }>;
  trackingParameters: {
    src:          string | null;
    sck:          string | null;
    utm_source:   string | null;
    utm_campaign: string | null;
    utm_medium:   string | null;
    utm_content:  string | null;
    utm_term:     string | null;
  };
  commission: {
    totalPriceInCents:    number;
    gatewayFeeInCents:   number;
    userCommissionInCents: number;
    currency?: string;
  };
  isTest?: boolean;
}

export async function sendOrderToUtmify(order: UtmifyOrder): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) {
    console.warn("[utmify] UTMIFY_API_TOKEN não configurado");
    return { ok: false, error: "Token não configurado" };
  }

  try {
    const res = await fetch(UTMIFY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": token,
      },
      body: JSON.stringify(order),
    });

    const body = await res.json() as Record<string, unknown>;
    if (!res.ok) {
      console.error("[utmify] erro:", res.status, body);
      return { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(body)}` };
    }

    console.log("[utmify] sucesso:", order.orderId, order.status);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[utmify] fetch error:", msg);
    return { ok: false, error: msg };
  }
}
