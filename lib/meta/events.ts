import { CAPIEvent, CAPIUserData } from "./capi";
import { hashPII, splitName } from "../hash";
import { SessionData } from "../redis";

export function buildUserData(params: {
  session:    SessionData;
  email?:     string;
  phone?:     string;
  name?:      string;
  city?:      string;
  state?:     string;
  zip?:       string;
  /** PII já hashado (vindo do Redis ao processar o webhook) */
  pii?:       Record<string, string[]>;
}): CAPIUserData {
  const base: CAPIUserData = {
    client_ip_address: params.session.ip,
    client_user_agent: params.session.user_agent,
    fbp: params.session.fbp,
    fbc: params.session.fbc ?? buildFbc(params.session.fbclid),
  };

  /* PII já hashado (vindo do Redis) */
  if (params.pii) {
    return { ...base, ...params.pii };
  }

  /* PII em claro — hashar agora */
  const { firstName, lastName } = splitName(params.name ?? "");
  const hashed = hashPII({
    email:      params.email,
    phone:      params.phone,
    firstName:  firstName || undefined,
    lastName:   lastName  || undefined,
    city:       params.city,
    state:      params.state,
    zip:        params.zip,
  });

  return { ...base, ...hashed };
}

export function buildEvent(
  eventName: string,
  params: {
    eventId:     string;
    userData:    CAPIUserData;
    sourceUrl?:  string;
    customData?: Record<string, unknown>;
  }
): CAPIEvent {
  return {
    event_name:       eventName,
    event_time:       Math.floor(Date.now() / 1000),
    event_id:         params.eventId,
    action_source:    "website",
    event_source_url: params.sourceUrl,
    user_data:        params.userData,
    custom_data:      params.customData,
  };
}

export function buildPurchaseEvent(params: {
  eventId:        string;
  userData:       CAPIUserData;
  value:          number;
  currency?:      string;
  transactionId?: string;
  sourceUrl?:     string;
}): CAPIEvent {
  return buildEvent("Purchase", {
    eventId:    params.eventId,
    userData:   params.userData,
    sourceUrl:  params.sourceUrl ?? "https://triunfo-home-design.vercel.app/checkout",
    customData: {
      value:          params.value,
      currency:       params.currency ?? "BRL",
      order_id:       params.transactionId,
      content_type:   "product",
      content_ids:    ["flexhome-armario-multifuncional"],
    },
  });
}

function buildFbc(fbclid?: string): string | undefined {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}
