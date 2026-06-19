"use client"

import { useState, useEffect, useRef } from "react"

const PRICE = 29.90
const TITLE = "Kit Acessórios Premium"
const NEXT  = "/upsell2"

export default function Upsell1Page() {
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
    <div style={{ minHeight: "100vh", backgroundColor: "#fff8f0", fontFamily: "sans-serif" }}>
      <div style={{ backgroundColor: "#dc2626", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: "14px", fontWeight: 600 }}>
        ⚠️ OFERTA EXCLUSIVA — Disponível apenas por: {mins}:{secs}
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 16px" }}>

        {view === "offer" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, border: "1px solid #fcd34d" }}>
                🎁 AGUARDE — Temos uma oferta especial para você!
              </span>
            </div>

            <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: 800, color: "#111827", marginBottom: "8px", lineHeight: 1.3 }}>
              Kit Acessórios Premium para sua Lavadora
            </h1>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>
              Bico Turbo + Escova Giratória + Prolongador 1m — aumente o poder de limpeza em até 3x
            </p>

            <div style={{ backgroundColor: "#fff", border: "2px solid #ff4d03", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "48px" }}>
                🔫
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>Kit Acessórios LAV1300</h2>
              <ul style={{ textAlign: "left", fontSize: "14px", color: "#374151", paddingLeft: "20px", marginBottom: "16px" }}>
                <li>Bico Turbo de alta pressão</li>
                <li>Escova giratória multiuso</li>
                <li>Prolongador 1m com engate rápido</li>
                <li>Compatível com LAV1300 Vonder</li>
              </ul>
              <div style={{ marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "line-through" }}>De R$ 87,90</span>
              </div>
              <div>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#dc2626" }}>R$ {PRICE.toFixed(2).replace(".", ",")}</span>
                <span style={{ fontSize: "13px", color: "#16a34a", marginLeft: "8px", fontWeight: 600 }}>-66%</span>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Parcele em até 12x no cartão</div>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center", marginBottom: "12px", background: "#fff5f5", padding: "10px", borderRadius: "8px", border: "1px solid #fdd" }}>{error}</p>
            )}

            <button onClick={handleAccept} disabled={loading} style={{ width: "100%", padding: "16px", backgroundColor: loading ? "#9ca3af" : "#16a34a", color: "#fff", border: "none", borderRadius: "10px", fontSize: "17px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginBottom: "12px", boxShadow: loading ? "none" : "0 4px 12px rgba(22,163,74,0.4)" }}>
              {loading ? "Gerando PIX..." : `✅ SIM! Quero adicionar por R$ ${PRICE.toFixed(2).replace(".", ",")}`}
            </button>

            <button onClick={skip} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
              Não obrigado, continuar sem o kit
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
