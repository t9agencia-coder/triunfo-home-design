"use client";

import { useEffect, useRef, useState } from "react";

const O  = "#011843";
const OD = "#000d26";
const TD = "#201a1b";
const TM = "#71686a";
const BG = "#faf8f7";

interface PixData {
  transactionId: string;
  copyPaste:     string;
  qrCodeImage:   string;
  status:        string;
}

interface PaymentContext {
  title: string;
  value: string;
  icon:  string;
}

export default function PaymentPage() {
  const [pixData,    setPixData]    = useState<PixData | null>(null);
  const [ctx,        setCtx]        = useState<PaymentContext | null>(null);
  const [funnelNext, setFunnelNext] = useState<string>("/");
  const [paid,       setPaid]       = useState(false);
  const [copied,     setCopied]     = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pixPaymentData");
      const ctxRaw = sessionStorage.getItem("paymentContext");
      const next = sessionStorage.getItem("funnelNext") || "/";

      if (raw) setPixData(JSON.parse(raw) as PixData);
      if (ctxRaw) setCtx(JSON.parse(ctxRaw) as PaymentContext);
      setFunnelNext(next);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!pixData?.transactionId) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/payment-status?id=${pixData.transactionId}`);
        const data = await res.json() as { status: string };
        if (data.status === "paid") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          setPaid(true);
          setTimeout(() => {
            if (funnelNext.startsWith("http")) {
              window.location.href = funnelNext;
            } else {
              window.location.href = funnelNext;
            }
          }, 2000);
        }
      } catch (_) {}
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [pixData, funnelNext]);

  async function copyCode() {
    if (!pixData?.copyPaste) return;
    try {
      await navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {}
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: BG, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${OD}, ${O})`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <a href="/"><img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" style={{ height: 32, display: "block" }} /></a>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 40px" }}>

        {paid ? (
          /* ── Pago ── */
          <div style={{
            backgroundColor: "white", borderRadius: 16, padding: "40px 24px",
            textAlign: "center", border: "2px solid #22c55e",
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <h2 style={{ color: "#15803d", margin: "0 0 8px", fontSize: 20 }}>Pagamento Confirmado!</h2>
            <p style={{ color: TM, fontSize: 14, margin: 0 }}>Redirecionando...</p>
          </div>

        ) : !pixData ? (
          /* ── Sem dados ── */
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: TM }}>Carregando dados do pagamento...</p>
          </div>

        ) : (
          /* ── QR Code ── */
          <div style={{ backgroundColor: "white", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden", border: "1px solid #e5e7eb" }}>

            {/* Contexto */}
            <div style={{ background: `linear-gradient(135deg, ${OD}, ${O})`, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{ctx?.icon || "💳"}</div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 15, margin: "0 0 2px" }}>{ctx?.title || "Pagamento PIX"}</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 20, fontWeight: 800, margin: 0 }}>{ctx?.value || ""}</p>
            </div>

            <div style={{ padding: "20px 20px 24px" }}>

              {/* QR Code */}
              {pixData.qrCodeImage && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                  <img
                    src={pixData.qrCodeImage}
                    alt="QR Code PIX"
                    style={{ width: 220, height: 220, borderRadius: 12, border: "4px solid #e5e7eb", objectFit: "contain", display: "block" }}
                  />
                </div>
              )}

              <p style={{ fontSize: 12, fontWeight: 700, color: TM, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", marginBottom: 8 }}>
                Ou copie o código PIX
              </p>

              {/* Copy-paste */}
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fafafa", marginBottom: 16 }}>
                <div
                  style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: TD, lineHeight: 1.6, wordBreak: "break-all", maxHeight: 80, overflowY: "auto", userSelect: "all", cursor: "text" }}
                  onClick={(e) => {
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(e.currentTarget);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }}
                >
                  {pixData.copyPaste}
                </div>
                <button
                  onClick={copyCode}
                  style={{
                    width: "100%", padding: "13px 16px",
                    background: copied ? "#22c55e" : O,
                    color: "#fff", border: 0, cursor: "pointer",
                    fontWeight: 900, fontSize: 14, letterSpacing: "0.04em",
                    fontFamily: "'Poppins', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.2s",
                  }}
                >
                  {copied ? (
                    <><span>✓</span> Código copiado!</>
                  ) : (
                    <><span>📋</span> Copiar código PIX</>
                  )}
                </button>
              </div>

              {/* Instruções */}
              <div style={{ backgroundColor: "#f8f9ff", border: "1px solid #e0e4f0", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: TD }}>Como pagar:</p>
                <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Abra o app do seu banco", 'Toque em "Pagar" e escolha "PIX"', "Escaneie o QR Code ou cole o código", "Confirme e finalize o pagamento"].map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: TM }}>{s}</li>
                  ))}
                </ol>
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: TM }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s ease-in-out infinite" }} />
                Aguardando confirmação do pagamento...
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
