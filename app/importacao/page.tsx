"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentLoadingOverlay from "../../components/PaymentLoadingOverlay";

const O  = "#011843";
const OD = "#000d26";
const OL = "#f8efec";
const OM = "#e9dfe0";
const TD = "#201a1b";
const TM = "#71686a";
const TL = "#71686a";
const BG = "#faf8f7";
const RED  = "#bd2c3b";
const REDL = "#fdeef0";
const GREEN  = "#167555";
const GREENL = "#edf8f4";

type StepState = "pending" | "active" | "success" | "failed";

const STEPS = [
  { label: "Pedido",  sub: "efetuado"  },
  { label: "Em",      sub: "separação" },
  { label: "Envio",   sub: ""          },
  { label: "Entrega", sub: ""          },
];



export default function ImportacaoPage() {
  const router = useRouter();
  const [steps,          setSteps]          = useState<StepState[]>(["pending","pending","pending","pending"]);

  const [alertVisible,   setAlertVisible]   = useState(false);
  const [btnEnabled,     setBtnEnabled]     = useState(false);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalStep,      setModalStep]      = useState<1|2>(1);
  const [traceWidth,     setTraceWidth]     = useState(0);
  const [countdown,      setCountdown]      = useState(600);
  const [countdownOn,    setCountdownOn]    = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePagarImportacao = async () => {
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
          valor: 28.27,
          descricao: "upsell 1",
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
      sessionStorage.setItem("funnelNext", "/tenf")
      sessionStorage.setItem("paymentContext", JSON.stringify({
        type: "upsell",
        title: "Taxa de Desembaraço Aduaneiro",
        value: "R$ 28,27",
        icon: "📦",
      }))
      router.push("/payment")
    } catch (error: any) {
      console.error("[Importacao] Erro ao processar pagamento:", error)
      alert(error.message || "Erro ao processar pagamento. Tente novamente.")
      setIsProcessingPayment(false)
    }
  }

  /* ── animação de cada step ── */
  function advance(index: number, result: "success"|"failed", cb: ()=>void) {
    setSteps(p => { const n=[...p] as StepState[]; n[index]="active"; return n; });
    setTimeout(() => {
      setSteps(p => { const n=[...p] as StepState[]; n[index]=result; return n; });
        cb();
    }, 900);
  }

  useEffect(() => {
    advance(0, "success", ()=>{});
    setTimeout(() => advance(1, "success", ()=>{}), 2000);
    setTimeout(() => advance(2, "failed",  ()=>{
      setTimeout(() => { setAlertVisible(true); setBtnEnabled(true); }, 1200);
    }), 4000);
  }, []);

  /* ── countdown regressivo ── */
  useEffect(() => {
    if (!countdownOn || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c-1), 1000);
    return () => clearTimeout(t);
  }, [countdown, countdownOn]);

  function handleCalcular() {
    setModalOpen(true);
    setTimeout(() => {
      setTraceWidth(100);
      setTimeout(() => { setModalStep(2); setCountdownOn(true); }, 2200);
    }, 600);
  }

  const mins = String(Math.floor(countdown/60)).padStart(2,"0");
  const secs = String(countdown%60).padStart(2,"0");

  const stepBg   = (s:StepState) => s==="success"?GREEN:s==="failed"?RED:s==="active"?O:"#d1d5db";
  const lineBg   = (s:StepState) => s==="success"?GREEN:s==="failed"?RED:"#e5e7eb";
  const labelClr = (s:StepState) => s==="failed"?RED:s==="success"?GREEN:TM;

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", backgroundColor:BG, minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div style={{ background:`linear-gradient(135deg,${OD},${O})`, padding:"16px 20px" }}>
        <div style={{ maxWidth:520, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="/">
            <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" style={{ height:32, display:"block" }} />
          </a>
          <div style={{ backgroundColor:"rgba(255,255,255,.2)", borderRadius:8, padding:"6px 12px" }}>
            <p style={{ color:"rgba(255,255,255,.7)", fontSize:10, margin:0 }}>Pedido</p>
            <p style={{ color:"white", fontWeight:700, fontSize:13, margin:0 }}>#00044792</p>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ maxWidth:520, margin:"0 auto", padding:"16px 16px 40px" }}>

        {/* Card de rastreio */}
        <div style={{ backgroundColor:"white", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.08)", border:"1px solid #e5e7eb", marginBottom:16, overflow:"hidden" }}>

          <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6" }}>
            <p style={{ fontSize:13, fontWeight:700, color:TD, margin:"0 0 2px" }}>📦 Status do Pedido</p>
            <p style={{ fontSize:12, color:TL, margin:0 }}>Acompanhe cada etapa em tempo real</p>
          </div>

          {/* Steps */}
          <div style={{ padding:"28px 16px 20px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"center" }}>
              {steps.map((state, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", flex: i<steps.length-1 ? 1 : "none" }}>

                  {/* círculo + label */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:56 }}>
                    <div style={{
                      width:44, height:44, borderRadius:"50%",
                      backgroundColor: stepBg(state),
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexShrink:0,
                      boxShadow: state==="active" ? `0 0 0 5px ${OM}` : state==="failed" ? "0 0 0 5px #fee2e2" : "none",
                      transition:"all .4s ease",
                    }}>
                      {state==="success" ? (
                        <span style={{ color:"white", fontSize:18, fontWeight:700 }}>✓</span>
                      ) : state==="failed" ? (
                        <span style={{ color:"white", fontSize:18, fontWeight:700 }}>✗</span>
                      ) : state==="active" ? (
                        <span style={{ color:"white", fontSize:10 }}>•••</span>
                      ) : (
                        <span style={{ color:"white", fontSize:13, fontWeight:700 }}>{i+1}</span>
                      )}
                    </div>

                    <div style={{ textAlign:"center" }}>
                      <p style={{ fontSize:10, fontWeight:700, color:labelClr(state), margin:0, lineHeight:1.2 }}>{STEPS[i].label}</p>
                      {STEPS[i].sub && <p style={{ fontSize:9, color:TL, margin:0, lineHeight:1.2 }}>{STEPS[i].sub}</p>}
                    </div>
                  </div>

                  {/* linha conectora */}
                  {i < steps.length-1 && (
                    <div style={{
                      flex:1, height:3, borderRadius:2, marginBottom:22,
                      backgroundColor: lineBg(state),
                      transition:"background-color .5s ease",
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            backgroundColor: steps[2]==="failed" ? REDL : GREENL,
            padding:"12px 20px", display:"flex", alignItems:"center", gap:10,
            borderTop:`1px solid ${steps[2]==="failed"?"#fecaca":"#bbf7d0"}`,
          }}>
            <span style={{ fontSize:20 }}>{steps[2]==="failed"?"🚨":"⏳"}</span>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:steps[2]==="failed"?RED:GREEN, margin:"0 0 1px" }}>
                {steps[2]==="failed" ? "ENTREGA BLOQUEADA" : "PROCESSANDO PEDIDO"}
              </p>
              <p style={{ fontSize:11, color:TL, margin:0 }}>
                {steps[2]==="failed" ? "Pendência identificada — ação necessária" : "Aguarde a confirmação das etapas"}
              </p>
            </div>
          </div>
        </div>

        {/* Card de alerta — fade-in após steps */}
        <div style={{
          opacity: alertVisible ? 1 : 0,
          transform: alertVisible ? "translateY(0)" : "translateY(20px)",
          transition:"opacity .8s ease, transform .8s ease",
          pointerEvents: alertVisible ? "auto" : "none",
        }}>

          {/* card principal do alerta */}
          <div style={{ backgroundColor:"white", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,.10)", border:`2px solid ${OM}`, marginBottom:16, overflow:"hidden" }}>

            <div style={{ background:`linear-gradient(135deg,${OD},${O})`, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:48, height:48, backgroundColor:"rgba(255,255,255,.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:26 }}>⚠️</span>
              </div>
              <div>
                <p style={{ color:"white", fontWeight:800, fontSize:16, margin:"0 0 2px" }}>Pendência Identificada</p>
                <p style={{ color:"rgba(255,255,255,.8)", fontSize:12, margin:0 }}>Taxa de desembaraço aduaneiro</p>
              </div>
            </div>

            <div style={{ padding:20 }}>
              <p style={{ fontSize:14, color:TM, lineHeight:1.7, margin:"0 0 16px" }}>
                Durante o processo de separação e envio foi identificada uma{" "}
                <strong style={{ color:TD }}>taxa obrigatória de desembaraço aduaneiro</strong>{" "}
                referente ao produto importado que você adquiriu.
              </p>

              <div style={{ backgroundColor:OL, border:`1px solid ${OM}`, borderLeft:`4px solid ${O}`, borderRadius:10, padding:"14px 16px", marginBottom:20, display:"flex", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
                <p style={{ fontSize:13, color:OD, margin:0, lineHeight:1.6 }}>
                  <strong>Boa notícia!</strong> A Triunfo Home Design possui um programa especial de isenção que pode cobrir essa
                  taxa por você. Verifique agora se você é elegível.
                </p>
              </div>

              <button
                disabled={!btnEnabled}
                onClick={handleCalcular}
                style={{
                  width:"100%", padding:16, fontSize:15, fontWeight:700, color:"white",
                  background: btnEnabled ? `linear-gradient(135deg,${O},${OD})` : "#9ca3af",
                  border:"none", borderRadius:12,
                  cursor: btnEnabled ? "pointer" : "not-allowed",
                  fontFamily:"'Poppins',sans-serif",
                  boxShadow: btnEnabled ? `0 4px 16px rgba(234,88,12,.4)` : "none",
                  animation: btnEnabled ? "pulse 2s infinite" : "none",
                  letterSpacing:"0.5px",
                }}
              >
                🔍 CALCULAR MINHA TAXA AGORA
              </button>

              <p style={{ fontSize:11, color:TL, textAlign:"center", margin:"10px 0 0" }}>
                Gratuito · Resultado imediato · Sem compromisso
              </p>
            </div>
          </div>

          {/* Trust bar */}
          <div style={{ backgroundColor:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px 20px", display:"flex", justifyContent:"space-around" }}>
            {[
              { icon:"🔒", label:"Pagamento Seguro"  },
              { icon:"📦", label:"Entrega Garantida" },
              { icon:"💬", label:"Suporte 24h"       },
            ].map((item, i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <p style={{ fontSize:20, margin:"0 0 4px" }}>{item.icon}</p>
                <p style={{ fontSize:10, color:TL, fontWeight:600, margin:0 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        /* overlay scrollável — resolve o corte em telas pequenas */
        <div
          onClick={e => { if(e.target===e.currentTarget) setModalOpen(false); }}
          style={{
            position:"fixed", inset:0, zIndex:50,
            backgroundColor:"rgba(17,24,39,.78)",
            backdropFilter:"blur(4px)",
            overflowY:"auto",          /* <— scroll quando conteúdo > tela */
            WebkitOverflowScrolling:"touch",
            padding:"24px 16px 40px",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
          }}
        >
          <div style={{
            backgroundColor:"white",
            width:"100%",
            maxWidth:420,
            borderRadius:20,
            /* sem overflow:hidden — evita o corte do conteúdo interno */
            boxShadow:"0 24px 48px rgba(0,0,0,.28)",
            /* garante que o borderRadius seja respeitado mesmo sem overflow:hidden */
            isolation:"isolate",
          }}>

            {/* ── Step 1: calculando ── */}
            {modalStep===1 && (
              <div style={{ padding:"36px 28px", textAlign:"center" }}>
                <div style={{ fontSize:52, marginBottom:16 }}>🔍</div>
                <h2 style={{ fontSize:20, fontWeight:700, color:TD, margin:"0 0 8px" }}>Calculando sua taxa...</h2>
                <p style={{ fontSize:13, color:TL, margin:"0 0 28px" }}>Consultando os dados do seu pedido</p>
                <div style={{ width:"100%", height:8, backgroundColor:"#e5e7eb", borderRadius:999, overflow:"hidden", marginBottom:12 }}>
                  <div style={{
                    width:`${traceWidth}%`, height:"100%",
                    background:`linear-gradient(90deg,${O},${OD})`,
                    borderRadius:999, transition:"width 2s ease-out",
                  }} />
                </div>
                <p style={{ fontSize:12, color:TL }}>Por favor aguarde...</p>
              </div>
            )}

            {/* ── Step 2: resultado (compacto, sem scroll) ── */}
            {modalStep===2 && (
              <>
                {/* header */}
                <div style={{ background:`linear-gradient(135deg,${OD},${O})`, padding:"14px 20px", borderRadius:"20px 20px 0 0", textAlign:"center" }}>
                  <p style={{ color:"white", fontWeight:700, fontSize:14, margin:0 }}>✅ Programa de Isenção</p>
                </div>

                <div style={{ padding:"16px 20px 20px" }}>

                  {/* comparação de preços em linha */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:14, backgroundColor:BG, borderRadius:12, padding:"12px 16px" }}>
                    <div style={{ textAlign:"center" }}>
                      <p style={{ fontSize:10, color:TL, fontWeight:600, margin:"0 0 2px" }}>TAXA ORIGINAL</p>
                      <p style={{ fontSize:22, fontWeight:800, color:RED, margin:0, textDecoration:"line-through", opacity:.7 }}>R$386,41</p>
                    </div>
                    <div style={{ fontSize:22 }}>→</div>
                    <div style={{ textAlign:"center" }}>
                      <p style={{ fontSize:10, color:OD, fontWeight:600, margin:"0 0 2px" }}>VOCÊ PAGA</p>
                      <p style={{ fontSize:28, fontWeight:800, color:O, margin:0 }}>R$28,27</p>
                    </div>
                  </div>

                  {/* benefícios em linha */}
                  <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
                    {[
                      { icon:"🛡️", label:"Taxa isenta"    },
                      { icon:"🚚", label:"Entrega rápida" },
                      { icon:"📍", label:"Rastreamento"   },
                    ].map((b, i) => (
                      <div key={i} style={{ textAlign:"center" }}>
                        <p style={{ fontSize:22, margin:"0 0 3px" }}>{b.icon}</p>
                        <p style={{ fontSize:10, color:TM, fontWeight:600, margin:0 }}>{b.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handlePagarImportacao}
                    disabled={isProcessingPayment}
                    style={{
                      display:"block", width:"100%", padding:"15px",
                      background: isProcessingPayment ? "#9ca3af" : `linear-gradient(135deg,${O},${OD})`,
                      color:"white", fontWeight:700, fontSize:15,
                      borderRadius:12, border:"none",
                      textAlign:"center",
                      fontFamily:"'Poppins',sans-serif",
                      boxShadow: isProcessingPayment ? "none" : `0 4px 16px rgba(234,88,12,.45)`,
                      animation: isProcessingPayment ? "none" : "pulse 1.8s infinite",
                      letterSpacing:"0.5px", boxSizing:"border-box",
                      marginBottom:12,
                      cursor: isProcessingPayment ? "not-allowed" : "pointer",
                    }}
                  >
                    ✅ LIBERAR MINHA ENTREGA AGORA
                  </button>

                  {/* rodapé: countdown + aviso em linha */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, backgroundColor:OL, borderRadius:8, padding:"8px 12px" }}>
                      <span style={{ fontSize:16 }}>⏱️</span>
                      <div>
                        <p style={{ fontSize:9, color:OD, fontWeight:700, margin:0, letterSpacing:"0.5px" }}>EXPIRA EM</p>
                        <p style={{ fontSize:16, fontWeight:800, color:O, margin:0, fontVariantNumeric:"tabular-nums" }}>{mins}:{secs}</p>
                      </div>
                    </div>
                    <p style={{ fontSize:11, color:TL, margin:0, lineHeight:1.5, flex:1 }}>
                      ⚠️ Sem pagamento, a taxa de <strong style={{ color:RED }}>R$386,41</strong> será cobrada por lei.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isProcessingPayment && (
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
