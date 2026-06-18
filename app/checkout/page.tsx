"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();

  const variant = searchParams.get("variant") || "2 Pretos";
  const colorName = searchParams.get("colorName") || "Grafite e branco";
  const price = Number(searchParams.get("price")) || 109.9;
  const compareAt = Number(searchParams.get("compareAt")) || 219.8;
  const units = Number(searchParams.get("units")) || 2;
  const image = searchParams.get("image") || "/images/dYdvdqs6VrAy.png";
  const title = searchParams.get("title") || "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]";

  const variantUrls: Record<string, string> = {
    "2 Pretos": "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326975727724&store=33269",
    "2 Brancos": "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326971813372&store=33269",
    "1 Preto e 1 Branco": "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326933997479&store=33269",
  };

  const paymentUrl = variantUrls[variant] || variantUrls["2 Pretos"];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  function formatCpf(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }

  function formatPhone(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function handleFinish() {
    window.location.href = paymentUrl;
  }

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
          <div className="checkout-card active">
            <div className="checkout-card-header">
              <h2><span className="step-number">1</span> Identificação</h2>
            </div>
            <div className="step-content">
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
          </div>

          <div className="checkout-card">
            <div className="checkout-card-header">
              <h2><span className="step-number">2</span> Pagamento</h2>
            </div>
            <div className="step-content">
              <p>Você será redirecionado para o ambiente seguro de pagamento após finalizar.</p>
              <div className="payment-tabs">
                <button className="payment-tab active" type="button">💳 Cartão de Crédito</button>
                <button className="payment-tab" type="button">📱 Pix</button>
              </div>
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

          <button className="button button-primary button-large finish-button" onClick={handleFinish}>
            FINALIZAR COMPRA
          </button>

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
