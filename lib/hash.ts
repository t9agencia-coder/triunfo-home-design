import { createHash } from "crypto";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function hashPII(data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  externalId?: string;
}) {
  const out: Record<string, string[]> = {};

  if (data.email)     out.em          = [sha256(data.email)];
  if (data.phone)     out.ph          = [sha256(data.phone.replace(/\D/g, ""))];
  if (data.firstName) out.fn          = [sha256(data.firstName)];
  if (data.lastName)  out.ln          = [sha256(data.lastName)];
  if (data.city)      out.ct          = [sha256(data.city)];
  if (data.state)     out.st          = [sha256(data.state.toLowerCase())];
  if (data.zip)       out.zp          = [sha256(data.zip.replace(/\D/g, ""))];
  if (data.externalId) out.external_id = [sha256(data.externalId)];

  out.country = [sha256("br")];

  return out;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName:  parts.slice(1).join(" ") || "",
  };
}
