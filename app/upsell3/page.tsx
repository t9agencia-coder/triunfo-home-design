"use client"

import { useState, useEffect, useRef } from "react"

const PRICE = 17.90
const TITLE = "Garantia Total 2 Anos"
const NEXT  = "https://www.google.com"

export default function Upsell3Page() {
  const [view, setView]         = useState<"offer" | "pix">("offer")
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [copied, setCopied]     = useState(false)
  const [tx, setTx]             = useState<{ id: string; pixQrCode: string; pixQrCodeImage: string } | null>(null)
  const pollingRef              = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current) }, [])

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0")
  const secs = String(timeLeft % 60).padStart(2, "0")

  function skip() { window.location.href = NEXT }

  function startPolling(id: string) {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/payment-status?id=${id}`)
        const d = await r.json()
        if (d.status === "paid") {
          clearInterval(pollingRef.current!)
          window.location.href = NEXT
        }
      } catch (_) {}
    }, 3000)
  }

  async function handleAccept() {
    setLoading(true)
    setError("")
    try {
      let customer: Record<string, unknown> = {}
      try { customer = JSON.parse(localStorage.getItem("_thd_customer") || "{}") } catch (_) {}

      const res = await fetch("/api/create-pix", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:     customer.name    || "Cliente",
          email:    customer.email   || "",
          phone:    customer.phone   || "",
          cpf:      customer.cpf     || "",
          amount:   PRICE,
          title:    TITLE,
          quantity: 1,
          address:  customer.address || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Erro ao gerar PIX")
      setTx(data)
      setView("pix")
      startPolling(data.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao gerar PIX")
    }
    setLoading(false)
  }

  async function copyCode() {
    if (!tx) return
    try { await navigator.clipboard.writeText(tx.pixQrCode) } catch (_) {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf4ff", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#7e22ce", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: "14px", fontWeight: 600 }}>
        🛡️ PROTEÇÃO TOTAL — Oferta expira em: {mins}:{secs}
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>

        {view === "offer" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ backgroundColor: "#f3e8ff", color: "#6b21a8", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, border: "1px solid #d8b4fe" }}>
                🏆 OFERTA FINAL — PROTEÇÃO PREMIUM
              </span>
            </div>

            <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "8px", lineHeight: 1.3 }}>
              Garantia Estendida 2 Anos
            </h1>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              Proteja seu investimento com cobertura total contra defeitos e problemas técnicos por 2 anos
            </p>

            <div style={{ backgroundColor: "#fff", border: "2px solid #7e22ce", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "48px" }}>
                🛡️
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Garantia Total 2 Anos</h2>
              <ul style={{ textAlign: "left", fontSize: "14px", color: "#374151", paddingLeft: "20px", marginBottom: "16px" }}>
                <li>Cobertura contra defeitos de fabricação</li>
                <li>Suporte técnico prioritário 24h</li>
                <li>Troca rápida em caso de problema</li>
                <li>Sem burocracia — processo 100% online</li>
              </ul>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "line-through" }}>De R$ 47,90</span>
              </div>
              <div>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#dc2626" }}>R$ {PRICE.toFixed(2).replace(".", ",")}</span>
                <span style={{ fontSize: "13px", color: "#16a34a", marginLeft: "8px", fontWeight: 600 }}>-63%</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Ativado automaticamente com o seu pedido</div>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginBottom: "12px", background: "#fff5f5", padding: "10px", borderRadius: "8px", border: "1px solid #fdd" }}>{error}</p>
            )}

            <button onClick={handleAccept} disabled={loading} style={{ width: "100%", padding: "16px", backgroundColor: loading ? "#9ca3af" : "#7e22ce", color: "#fff", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: "12px", boxShadow: loading ? "none" : "0 4px 12px rgba(126,34,206,0.4)" }}>
              {loading ? "Gerando PIX..." : `✅ SIM! Quero a Garantia por R$ ${PRICE.toFixed(2).replace(".", ",")}`}
            </button>

            <button onClick={skip} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
              Não obrigado, continuar sem a garantia
            </button>
          </>
        )}

        {view === "pix" && tx && (
          <>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>📱</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111827", marginBottom: "6px" }}>
                Pague R$ {PRICE.toFixed(2).replace(".", ",")} via PIX
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280" }}>Escaneie o QR Code ou copie o código</p>
            </div>

            {tx.pixQrCodeImage && (
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <img src={tx.pixQrCodeImage} alt="QR Code PIX" style={{ width: 200, height: 200, border: "1px solid #e5e7eb", borderRadius: "8px" }} />
              </div>
            )}

            <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", fontSize: "11px", wordBreak: "break-all", color: "#374151", marginBottom: "12px", maxHeight: "80px", overflow: "auto" }}>
              {tx.pixQrCode}
            </div>

            <button onClick={copyCode} style={{ width: "100%", padding: "14px", backgroundColor: copied ? "#16a34a" : "#111827", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginBottom: "12px", transition: "background 0.2s" }}>
              {copied ? "✅ Código Copiado!" : "📋 Copiar Código PIX"}
            </button>

            <div style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
              <span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#f59e0b", borderRadius: "50%", marginRight: 6, animation: "pulse 1.5s infinite" }} />
              Aguardando confirmação do pagamento...
            </div>

            <button onClick={skip} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
              Pular e continuar sem adicionar
            </button>

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
          </>
        )}

      </div>
    </div>
  )
}
