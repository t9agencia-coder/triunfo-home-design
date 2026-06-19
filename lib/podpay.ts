const PODPAY_API = "https://api.podpay.app/v1";

export interface PodPayCustomer {
  name: string;
  email: string;
  phone: string;
  document: {
    type: "cpf";
    number: string;
  };
}

export interface PodPayItem {
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
}

export interface PodPayTransaction {
  id: string;
  status: string;
  amount: number;
  paymentMethod: string;
  customer: PodPayCustomer;
  pixQrCode?: string;
  pixQrCodeImage?: string;
  createdAt: string;
}

export interface PodPayResponse {
  success: boolean;
  data: PodPayTransaction;
  meta: { timestamp: string; version: string; requestId: string };
  error?: { code: string; message: string; details?: Record<string, unknown> };
}

function getApiKey(): string {
  return process.env.PODPAY_API_KEY || "";
}

export async function createPixTransaction(params: {
  amountCents: number;
  customer: PodPayCustomer;
  items: PodPayItem[];
  postbackUrl?: string;
}): Promise<{ ok: false; error: string } | { ok: true; data: PodPayTransaction }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: "PODPAY_API_KEY não configurada" };
  }

  const body: Record<string, unknown> = {
    paymentMethod: "pix",
    amount: params.amountCents,
    customer: params.customer,
    items: params.items,
  };

  if (params.postbackUrl) {
    body.postbackUrl = params.postbackUrl;
  }

  try {
    const res = await fetch(`${PODPAY_API}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json()) as PodPayResponse;

    if (!res.ok || !json.success) {
      const msg = json.error?.message || `HTTP ${res.status}`;
      console.error("[podpay] erro ao criar transação:", msg, json.error);
      return { ok: false, error: msg };
    }

    return { ok: true, data: json.data };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[podpay] fetch error:", msg);
    return { ok: false, error: msg };
  }
}

export async function getTransactionStatus(id: string): Promise<{ ok: false; error: string } | { ok: true; data: PodPayTransaction }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: "PODPAY_API_KEY não configurada" };
  }

  try {
    const res = await fetch(`${PODPAY_API}/transactions/${id}`, {
      headers: { "x-api-key": apiKey },
    });

    const json = (await res.json()) as PodPayResponse;

    if (!res.ok || !json.success) {
      const msg = json.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }

    return { ok: true, data: json.data };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return { ok: false, error: msg };
  }
}
