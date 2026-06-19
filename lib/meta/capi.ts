const META_API_VERSION = "v20.0";

export interface CAPIUserData {
  em?:                 string[];
  ph?:                 string[];
  fn?:                 string[];
  ln?:                 string[];
  ct?:                 string[];
  st?:                 string[];
  country?:            string[];
  zp?:                 string[];
  external_id?:        string[];
  client_ip_address?:  string;
  client_user_agent?:  string;
  fbp?:                string;
  fbc?:                string;
}

export interface CAPIEvent {
  event_name:       string;
  event_time:       number;
  event_id:         string;
  event_source_url?: string;
  action_source:    "website";
  user_data:        CAPIUserData;
  custom_data?:     Record<string, unknown>;
}

export interface CAPIResult {
  status:  number;
  body:    Record<string, unknown>;
  success: boolean;
  error?:  string;
}

export async function sendCAPIEvents(events: CAPIEvent[]): Promise<CAPIResult> {
  const pixelId     = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    const msg = "META_PIXEL_ID ou META_ACCESS_TOKEN não configurados";
    console.warn("[meta/capi]", msg);
    return { status: 0, body: {}, success: false, error: msg };
  }

  const payload: Record<string, unknown> = {
    data:         events,
    access_token: accessToken,
  };

  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`;
    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const body = await res.json() as Record<string, unknown>;
    const success = res.ok && (body as { events_received?: number }).events_received !== undefined;

    if (!success) console.warn("[meta/capi] resposta inesperada:", body);
    return { status: res.status, body, success };

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[meta/capi] fetch error:", msg);
    return { status: 0, body: {}, success: false, error: msg };
  }
}
