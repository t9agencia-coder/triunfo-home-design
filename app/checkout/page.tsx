"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const variant = searchParams.get("variant") || "2 Pretos";
  const colorName = searchParams.get("colorName") || "Grafite e branco";
  const price = Number(searchParams.get("price")) || 109.9;
  const compareAt = Number(searchParams.get("compareAt")) || 219.8;
  const units = Number(searchParams.get("units")) || 2;
  const image = searchParams.get("image") || "/images/dYdvdqs6VrAy.png";
  const title = searchParams.get("title") || "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState<{
    id: string;
    status: string;
    pixQrCode: string;
    pixQrCodeImage: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function formatCpf(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  function formatPhone(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function validateForm() {
    if (!name.trim()) return "Informe seu nome completo.";
    if (!email.trim() || !email.includes("@")) return "Informe um e-mail válido.";
    var phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) return "Informe um telefone válido com DDD.";
    var cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) return "Informe um CPF válido com 11 dígitos.";
    return "";
  }

  async function handleFinish() {
    var validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);

    try {
      var response = await fetch("/api/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          amount: price,
          title,
          quantity: units,
        }),
      });

      var data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao processar pagamento. Tente novamente.");
        setLoading(false);
        return;
      }

      setTransaction(data);
      startPolling(data.id);
    } catch (e: any) {
      setError(e.message || "Erro de conexão. Tente novamente.");
    }

    setLoading(false);
  }

  function startPolling(id: string) {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        var res = await fetch(`/api/payment-status?id=${id}`);
        var data = await res.json();
        if (data.status === "paid") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          setTransaction((prev) => prev ? { ...prev, status: "paid" } : null);
        }
      } catch (e) {
        // silently retry
      }
    }, 5000);
  }

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function copyPixCode() {
    if (!transaction?.pixQrCode) return;
    try {
      await navigator.clipboard.writeText(transaction.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text from hidden input
    }
  }

  var paid = transaction?.status === "paid";

  return (
    <div className="checkout-body">
      <header className="checkout-header">
        <a href="/">
          <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" />
        </a>
        <span className="checkout-security">🔒 Compra Segura</span>
      </header>

      <div className="timer-bar">
        🕐 Corra! Últimas unidades com frete grátis
      </div>

      <div className="checkout-layout container">
        <div className="checkout-steps">
          <div className={`checkout-card ${transaction ? "locked" : "active"}`}>
            <div className="checkout-card-header">
              <h2><span className="step-number">1</span> Identificação</h2>
            </div>
            <div className="step-content" hidden={!!transaction}>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="name">Nome completo</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefone / WhatsApp</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" maxLength={15} />
                </div>
                <div className="field">
                  <label htmlFor="cpf">CPF</label>
                  <input id="cpf" type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                </div>
              </div>
            </div>
            {transaction && (
              <div className="step-content">
                <p style={{ color: "var(--success)", fontWeight: 700, fontSize: 14, margin: 0 }}>
                  ✅ {name} — CPF {cpf}
                </p>
              </div>
            )}
          </div>

          <div className={`checkout-card ${transaction ? "active" : ""}`}>
            <div className="checkout-card-header">
              <h2><span className="step-number">2</span> Pagamento</h2>
            </div>
            <div className="step-content">
              {!transaction && (
                <p>Você pode pagar via <strong>PIX</strong> — aprovação instantânea.</p>
              )}

              {transaction && !paid && (
                <div className="payment-panel">
                  <h3>📱 Pague com PIX</h3>
                  <p>Escaneie o QR Code abaixo ou copie o código para pagar</p>
                  <div className="qr-result">
                    {transaction.pixQrCodeImage && (
                      <img src={transaction.pixQrCodeImage} alt="QR Code PIX" />
                    )}
                    <div className="copy-row">
                      <input type="text" readOnly value={transaction.pixQrCode} onClick={(e) => (e.target as HTMLInputElement).select()} />
                      <button type="button" onClick={copyPixCode}>
                        {copied ? "✅ Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>
                  <div className="payment-hints">
                    <span>⏳ Aguardando pagamento...</span>
                    <span>🔁 O QR Code atualiza automaticamente</span>
                  </div>
                </div>
              )}

              {paid && (
                <div className="payment-panel" style={{ border: "2px solid var(--success)" }}>
                  <h3 style={{ color: "var(--success)" }}>✅ Pagamento Confirmado!</h3>
                  <p>Seu pedido foi processado com sucesso. Você receberá um e-mail com os detalhes.</p>
                  <div style={{ marginTop: 16 }}>
                    <a href="/" className="button button-primary" style={{ textDecoration: "none", display: "inline-block", padding: "14px 32px" }}>
                      VOLTAR À LOJA
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h2>Resumo do pedido</h2>
          <div className="summary-items">
            <div className="summary-item">
              <img src={image} alt={title} />
              <div>
                <strong>{title}</strong>
                <span>Cor: {colorName} · Qtd: {units}</span>
                <span>Variante: {variant}</span>
                <b>R$ {price.toFixed(2)}</b>
              </div>
            </div>
          </div>

          <div className="coupon-row">
            <input type="text" placeholder="Cupom de desconto" />
            <button type="button">Aplicar</button>
          </div>

          <div className="summary-totals">
            <div><span>Subtotal</span><strong>R$ {price.toFixed(2)}</strong></div>
            <div><span>Frete</span><strong style={{ color: "#167555" }}>Grátis</strong></div>
            <div className="summary-discount" hidden></div>
            <div className="grand-total">
              <span>Total</span>
              <strong>R$ {price.toFixed(2)}</strong>
            </div>
          </div>

          <div className="savings-highlight">
            💰 Você economiza <strong>R$ {(compareAt - price).toFixed(2)}</strong> nesta oferta!
          </div>

          <button
            className="button button-primary button-large finish-button"
            onClick={handleFinish}
            disabled={loading || !!transaction}
          >
            {loading ? "PROCESSANDO..." : transaction ? "PAGAMENTO INICIADO" : "FINALIZAR COMPRA"}
          </button>

          {error && (
            <p style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13, textAlign: "center", marginTop: 10 }}>{error}</p>
          )}

          <div className="guarantee">
            🔒 Compra protegida por criptografia SSL · Satisfação garantida ou seu dinheiro de volta
          </div>
        </div>
      </div>

      <div className="checkout-footer">
        <p>© {new Date().getFullYear()} Triunfo Home Design. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="checkout-body" style={{ padding: "40px", textAlign: "center" }}>Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
