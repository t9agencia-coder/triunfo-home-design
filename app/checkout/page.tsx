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

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cepTouched, setCepTouched] = useState(false);
  const [streetTouched, setStreetTouched] = useState(false);
  const [numberTouched, setNumberTouched] = useState(false);
  const [neighborhoodTouched, setNeighborhoodTouched] = useState(false);
  const [cityTouched, setCityTouched] = useState(false);
  const [stateTouched, setStateTouched] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [cepFetched, setCepFetched] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFlag, setCardFlag] = useState("");
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const [cardNameTouched, setCardNameTouched] = useState(false);
  const [cardExpiryTouched, setCardExpiryTouched] = useState(false);
  const [cardCvvTouched, setCardCvvTouched] = useState(false);

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

  function isValidCpf(value: string) {
    var digits = value.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    var r = (sum * 10) % 11;
    if (r === 10) r = 0;
    if (r !== parseInt(digits[9])) return false;
    sum = 0;
    for (var j = 0; j < 10; j++) sum += parseInt(digits[j]) * (11 - j);
    r = (sum * 10) % 11;
    if (r === 10) r = 0;
    return r === parseInt(digits[10]);
  }

  function formatCep(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, "$1-$2");
  }

  function formatPhone(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 11);
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function formatCardNumber(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 16);
    var flag = detectCardFlag(digits);
    setCardFlag(flag);
    if (flag === "amex") {
      return digits.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3");
    }
    return digits.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, "$1 $2 $3 $4").trim();
  }

  function formatCardExpiry(value: string) {
    var digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return digits.replace(/^(\d{2})(\d{0,2})$/, "$1/$2");
  }

  function detectCardFlag(digits: string) {
    if (/^4/.test(digits)) return "visa";
    if (/^5[1-5]/.test(digits)) return "mastercard";
    if (/^3[47]/.test(digits)) return "amex";
    if (/^6(?:011|5)/.test(digits)) return "discover";
    if (/^3(?:0[0-5]|[68])/.test(digits)) return "diners";
    if (/^35(?:2[89]|[3-8])/.test(digits)) return "jcb";
    if (/^50|^60|^65/.test(digits)) return "elo";
    if (/^38|^60/.test(digits)) return "hipercard";
    return "";
  }

  function isValidLuhn(value: string) {
    var digits = value.replace(/\D/g, "");
    if (digits.length < 13) return false;
    var sum = 0;
    var alt = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var n = parseInt(digits[i]);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  var flagIcons: Record<string, string> = {
    visa: "/images/ArGWVJHpgYvU.svg",
    mastercard: "/images/q0kdVVG0rtRH.svg",
    amex: "/images/ZevbLkVeF2gs.svg",
    discover: "/images/pYoM0lYcIBRp.svg",
    elo: "/images/PSdsna7V1PGI.svg",
    hipercard: "/images/fGHGNLPt08me.svg",
  };

  function flagIcon() {
    return flagIcons[cardFlag] || "";
  }

  async function fetchAddress(cepVal: string) {
    var clean = cepVal.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setFetchingCep(true);
    setCepFetched(false);
    try {
      var res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      var data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      } else {
        setStreet(""); setNeighborhood(""); setCity(""); setState("");
      }
    } catch {
      setStreet(""); setNeighborhood(""); setCity(""); setState("");
    }
    setFetchingCep(false);
    setCepFetched(true);
  }

  var nameError = nameTouched && name.trim().split(" ").length < 2 ? "Informe nome e sobrenome" : "";
  var emailError = emailTouched && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "E-mail inválido" : "";
  var phoneError = phoneTouched && phone.replace(/\D/g, "").length < 10 ? "Telefone inválido" : "";
  var cpfError = cpfTouched && !isValidCpf(cpf) ? "CPF inválido" : "";
  var cepError = cepTouched && cep.replace(/\D/g, "").length !== 8 ? "CEP inválido" : "";
  var streetError = streetTouched && !street.trim() ? "Informe o logradouro" : "";
  var numberError = numberTouched && !number.trim() ? "Informe o número" : "";
  var neighborhoodError = neighborhoodTouched && !neighborhood.trim() ? "Informe o bairro" : "";
  var cityError = cityTouched && !city.trim() ? "Informe a cidade" : "";
  var stateError = stateTouched && !state.trim() ? "Informe o estado" : "";
  var cardNumberError = cardNumberTouched && (!isValidLuhn(cardNumber) || cardNumber.replace(/\s/g, "").length < 15) ? "Número inválido" : "";
  var cardNameError = cardNameTouched && cardName.trim().split(" ").length < 2 ? "Nome inválido" : "";
  var cardExpiryError = cardExpiryTouched ? (function () { var m = parseInt(cardExpiry.split("/")[0]); var y = parseInt("20" + cardExpiry.split("/")[1]); var now = new Date(); return (!m || !y || m < 1 || m > 12 || y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) ? "Data inválida" : ""; })() : "";
  var cardCvvError = cardCvvTouched ? (function () { var len = cardCvv.length; var expected = cardFlag === "amex" ? 4 : 3; return len !== expected ? "CVV inválido" : ""; })() : "";

  var step1Valid = !nameError && !emailError && !phoneError && !cpfError && name.trim() && email.trim() && phone.replace(/\D/g, "").length >= 10 && isValidCpf(cpf);
  var step2Valid = !cepError && !streetError && !numberError && !neighborhoodError && !cityError && !stateError && cep.replace(/\D/g, "").length === 8 && street.trim() && number.trim() && neighborhood.trim() && city.trim() && state.trim();

  function goStep(n: number) {
    if (n < step && transaction) return;
    setStep(n);
  }

  function validateForm() {
    if (!name.trim()) return "Informe seu nome completo.";
    if (!email.trim() || !email.includes("@")) return "Informe um e-mail válido.";
    var phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) return "Informe um telefone válido com DDD.";
    if (!isValidCpf(cpf)) return "Informe um CPF válido.";
    var cepDigits = cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) return "Informe um CEP válido.";
    if (!street.trim()) return "Informe o logradouro.";
    if (!number.trim()) return "Informe o número.";
    if (!neighborhood.trim()) return "Informe o bairro.";
    if (!city.trim()) return "Informe a cidade.";
    if (!state.trim()) return "Informe o estado.";
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
          address: {
            zip: cep.replace(/\D/g, ""),
            street: street.trim(),
            number: number.trim(),
            complement: complement.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim(),
          },
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
    }
  }

  var paid = transaction?.status === "paid";

  var steps = [
    { n: 1, label: "Cliente" },
    { n: 2, label: "Endereço" },
    { n: 3, label: "Pagamento" },
  ];

  function Field({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
    return (
      <div className="field" style={{ position: "relative" }}>
        <label>{label}</label>
        {children}
        <div className={`field-hint ${error ? "error" : ""}`} style={{ visibility: error ? "visible" : "hidden" }}>
          {error || "."}
        </div>
      </div>
    );
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

      <div className="checkout-layout container" style={{ alignItems: "start" }}>
        <div className="checkout-steps">
          <div className="progress-bar">
            {steps.map((s, i) => (
              <span key={s.n} style={{ display: "contents" }}>
                {i > 0 && <span className={`progress-line ${step > s.n || paid ? "done" : ""}`} />}
                <button
                  type="button"
                  className={`progress-step ${step === s.n ? "active" : ""} ${step > s.n || paid ? "done" : ""}`}
                  onClick={() => goStep(s.n)}
                  disabled={!!transaction && s.n < step}
                  style={{ background: "none", border: 0, cursor: !!transaction && s.n < step ? "default" : "pointer", padding: 0, font: "inherit" }}
                >
                  <span className="progress-dot" />
                  <span className="progress-label">{s.label}</span>
                </button>
              </span>
            ))}
          </div>

          {step === 1 && !transaction && (
            <div className="checkout-card active">
              <div className="checkout-card-header">
                <h2><span className="step-number">1</span> Informações do Cliente</h2>
              </div>
              <div className="step-content">
                <div className="form-grid">
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="name">Nome completo</label>
                    <input id="name" type="text" value={name} onChange={(e) => { setName(e.target.value); setNameTouched(true); }} placeholder="Seu nome completo" className={nameError ? "invalid" : ""} style={name && !nameError ? { borderColor: "var(--success)" } : undefined} />
                    <div className={`field-hint ${nameError ? "error" : name && !nameError ? "success" : ""}`} style={{ visibility: nameTouched ? "visible" : "hidden" }}>
                      {nameError || (name && !nameError ? "✓ Nome válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }} placeholder="seu@email.com" className={emailError ? "invalid" : ""} style={email && !emailError ? { borderColor: "var(--success)" } : undefined} />
                    <div className={`field-hint ${emailError ? "error" : email && !emailError ? "success" : ""}`} style={{ visibility: emailTouched ? "visible" : "hidden" }}>
                      {emailError || (email && !emailError ? "✓ E-mail válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Telefone / WhatsApp</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneTouched(true); }} placeholder="(11) 99999-9999" maxLength={15} className={phoneError ? "invalid" : ""} style={phone && !phoneError ? { borderColor: "var(--success)" } : undefined} />
                    <div className={`field-hint ${phoneError ? "error" : phone && !phoneError ? "success" : ""}`} style={{ visibility: phoneTouched ? "visible" : "hidden" }}>
                      {phoneError || (phone && !phoneError ? "✓ Telefone válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" value={cpf} onChange={(e) => { setCpf(formatCpf(e.target.value)); setCpfTouched(true); }} placeholder="000.000.000-00" maxLength={14} className={cpfError ? "invalid" : ""} style={cpf && !cpfError ? { borderColor: "var(--success)" } : undefined} />
                    <div className={`field-hint ${cpfError ? "error" : cpf && !cpfError ? "success" : ""}`} style={{ visibility: cpfTouched ? "visible" : "hidden" }}>
                      {cpfError || (cpf && !cpfError ? "✓ CPF válido" : ".")}
                    </div>
                  </div>
                </div>

                <button className="button button-primary button-large" style={{ width: "100%", marginTop: 18 }} onClick={() => { setStep(2); if (!nameTouched) setNameTouched(true); if (!emailTouched) setEmailTouched(true); if (!phoneTouched) setPhoneTouched(true); if (!cpfTouched) setCpfTouched(true); }} disabled={!step1Valid}>
                  Continuar <span style={{ marginLeft: 6 }}>→</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && !transaction && (
            <div className="checkout-card active">
              <div className="checkout-card-header">
                <h2><span className="step-number">2</span> Endereço de Entrega</h2>
              </div>
              <div className="step-content">
                <div className="form-grid">
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="cep">CEP</label>
                    <div style={{ position: "relative" }}>
                      <input id="cep" type="text" value={cep} onChange={(e) => { var v = formatCep(e.target.value); setCep(v); setCepTouched(true); if (v.replace(/\D/g, "").length === 8) fetchAddress(v); }} placeholder="00000-000" maxLength={9} className={cepError ? "invalid" : ""} style={cep && !cepError ? { borderColor: "var(--success)" } : undefined} />
                      {fetchingCep && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--muted)" }}>Buscando...</span>}
                    </div>
                    <div className={`field-hint ${cepError ? "error" : cep && !cepError && cepFetched ? "success" : ""}`} style={{ visibility: cepTouched ? "visible" : "hidden" }}>
                      {cepError ? "CEP inválido — preencha o endereço manualmente" : (cep && !cepError && cepFetched ? "✓ CEP encontrado" : ".")}
                    </div>
                  </div>
                </div>

                {cepFetched && (
                  <>
                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="street">Rua</label>
                        <input id="street" type="text" value={street} onChange={(e) => { setStreet(e.target.value); setStreetTouched(true); }} placeholder="Rua, Avenida..." className={streetError ? "invalid" : ""} style={street && !streetError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${streetError ? "error" : ""}`} style={{ visibility: streetTouched ? "visible" : "hidden" }}>{streetError || "."}</div>
                      </div>
                      <div className="field">
                        <label htmlFor="number">Número</label>
                        <input id="number" type="text" value={number} onChange={(e) => { setNumber(e.target.value); setNumberTouched(true); }} placeholder="Nº" className={numberError ? "invalid" : ""} style={number && !numberError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${numberError ? "error" : ""}`} style={{ visibility: numberTouched ? "visible" : "hidden" }}>{numberError || "."}</div>
                      </div>
                    </div>

                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="complement" style={{ opacity: 0.7 }}>Complemento <span style={{ fontWeight: 400 }}>(opcional)</span></label>
                        <input id="complement" type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." />
                      </div>
                      <div className="field">
                        <label htmlFor="neighborhood">Bairro</label>
                        <input id="neighborhood" type="text" value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setNeighborhoodTouched(true); }} placeholder="Bairro" className={neighborhoodError ? "invalid" : ""} style={neighborhood && !neighborhoodError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${neighborhoodError ? "error" : ""}`} style={{ visibility: neighborhoodTouched ? "visible" : "hidden" }}>{neighborhoodError || "."}</div>
                      </div>
                    </div>

                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <input id="city" type="text" value={city} onChange={(e) => { setCity(e.target.value); setCityTouched(true); }} placeholder="Cidade" className={cityError ? "invalid" : ""} style={city && !cityError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${cityError ? "error" : ""}`} style={{ visibility: cityTouched ? "visible" : "hidden" }}>{cityError || "."}</div>
                      </div>
                      <div className="field">
                        <label htmlFor="state">Estado</label>
                        <input id="state" type="text" value={state} onChange={(e) => { setState(e.target.value.toUpperCase()); setStateTouched(true); }} placeholder="UF" maxLength={2} className={stateError ? "invalid" : ""} style={state && !stateError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${stateError ? "error" : ""}`} style={{ visibility: stateTouched ? "visible" : "hidden" }}>{stateError || "."}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button className="button button-dark" style={{ flex: 1 }} onClick={() => setStep(1)}>
                        ← Voltar
                      </button>
                      <button className="button button-primary button-large" style={{ flex: 2 }} onClick={() => { setStep(3); if (!streetTouched) setStreetTouched(true); if (!numberTouched) setNumberTouched(true); if (!neighborhoodTouched) setNeighborhoodTouched(true); if (!cityTouched) setCityTouched(true); if (!stateTouched) setStateTouched(true); }} disabled={!step2Valid}>
                        Ir para Pagamento <span style={{ marginLeft: 6 }}>→</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-card active">
              <div className="checkout-card-header">
                <h2><span className="step-number">3</span> Pagamento</h2>
              </div>
              <div className="step-content">
                {!transaction && !paid && (
                  <>
                    <div className="payment-tabs">
                      <button type="button" className={`payment-tab ${paymentMethod === "pix" ? "active" : ""}`} onClick={() => setPaymentMethod("pix")}>
                        <span style={{ fontSize: 18, marginRight: 5 }}>📱</span> PIX
                      </button>
                      <button type="button" className={`payment-tab ${paymentMethod === "card" ? "active" : ""}`} onClick={() => setPaymentMethod("card")}>
                        <span style={{ fontSize: 18, marginRight: 5 }}>💳</span> Cartão
                      </button>
                    </div>

                    {paymentMethod === "pix" && (
                      <div className="payment-panel" style={{ marginTop: 14 }}>
                        <h3>📱 Pagamento via PIX</h3>
                        <p>Aprovação instantânea. Escaneie o QR Code ou copie o código.</p>
                        <div style={{ marginTop: 14 }}>
                          <button className="button button-primary" style={{ width: "100%" }} onClick={handleFinish} disabled={loading}>
                            {loading ? "GERANDO PIX..." : "GERAR QR CODE PIX"}
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div style={{ marginTop: 14 }}>
                        <div className="card-grid four">
                          <div className="field" style={{ gridColumn: "1 / -1" }}>
                            <label htmlFor="card-number">Número do cartão</label>
                            <div style={{ position: "relative" }}>
                              <input id="card-number" type="text" value={cardNumber} onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardNumberTouched(true); }} placeholder="0000 0000 0000 0000" maxLength={19} className={cardNumberError ? "invalid" : ""} style={cardNumber && !cardNumberError ? { borderColor: "var(--success)" } : undefined} />
                              {flagIcon() && <img src={flagIcon()} alt={cardFlag} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 32, height: "auto" }} />}
                            </div>
                            <div className={`field-hint ${cardNumberError ? "error" : cardNumber && !cardNumberError ? "success" : ""}`} style={{ visibility: cardNumberTouched ? "visible" : "hidden" }}>
                              {cardNumberError || (cardNumber && !cardNumberError ? "✓ Número válido" : ".")}
                            </div>
                          </div>
                          <div className="field" style={{ gridColumn: "1 / -1" }}>
                            <label htmlFor="card-name">Nome do titular</label>
                            <input id="card-name" type="text" value={cardName} onChange={(e) => { setCardName(e.target.value); setCardNameTouched(true); }} placeholder="Nome impresso no cartão" className={cardNameError ? "invalid" : ""} style={cardName && !cardNameError ? { borderColor: "var(--success)" } : undefined} />
                            <div className={`field-hint ${cardNameError ? "error" : ""}`} style={{ visibility: cardNameTouched ? "visible" : "hidden" }}>{cardNameError || "."}</div>
                          </div>
                          <div className="field">
                            <label htmlFor="card-expiry">Validade</label>
                            <input id="card-expiry" type="text" value={cardExpiry} onChange={(e) => { setCardExpiry(formatCardExpiry(e.target.value)); setCardExpiryTouched(true); }} placeholder="MM/AA" maxLength={5} className={cardExpiryError ? "invalid" : ""} style={cardExpiry && !cardExpiryError ? { borderColor: "var(--success)" } : undefined} />
                            <div className={`field-hint ${cardExpiryError ? "error" : ""}`} style={{ visibility: cardExpiryTouched ? "visible" : "hidden" }}>{cardExpiryError || "."}</div>
                          </div>
                          <div className="field">
                            <label htmlFor="card-cvv">CVV</label>
                            <input id="card-cvv" type="text" value={cardCvv} onChange={(e) => { var d = e.target.value.replace(/\D/g, "").slice(0, 4); setCardCvv(d); setCardCvvTouched(true); }} placeholder={cardFlag === "amex" ? "0000" : "000"} maxLength={4} className={cardCvvError ? "invalid" : ""} style={cardCvv && !cardCvvError ? { borderColor: "var(--success)" } : undefined} />
                            <div className={`field-hint ${cardCvvError ? "error" : ""}`} style={{ visibility: cardCvvTouched ? "visible" : "hidden" }}>{cardCvvError || "."}</div>
                          </div>
                        </div>
                        <div className="card-note" style={{ marginTop: 10 }}>
                          🔒 Seus dados estão protegidos com criptografia. Nenhuma informação será compartilhada.
                        </div>
                        <button className="button button-primary button-large" style={{ width: "100%", marginTop: 14 }} disabled={loading || !!(cardNumberError || cardNameError || cardExpiryError || cardCvvError) || !cardNumber || !cardName || !cardExpiry || !cardCvv}>
                          {loading ? "PROCESSANDO..." : "FINALIZAR COMPRA"}
                        </button>
                      </div>
                    )}
                  </>
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
                      <a href="/" className="button button-primary" style={{ display: "inline-block", padding: "14px 32px" }}>
                        VOLTAR À LOJA
                      </a>
                    </div>
                  </div>
                )}

                {error && (
                  <p style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13, textAlign: "center", marginTop: 10 }}>{error}</p>
                )}

                {!transaction && !paid && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                    <button className="button button-dark" style={{ padding: "0 16px", minHeight: 40 }} onClick={() => setStep(2)}>
                      ← Voltar ao endereço
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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

          <div className="guarantee" style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <span>🔒 Compra 100% segura</span>
              <span>🛡️ Dados protegidos com criptografia SSL</span>
              <span>✅ Pagamento processado com segurança</span>
              <span>📞 Atendimento disponível pelo WhatsApp</span>
            </div>
          </div>

          <div className="guarantee" style={{ marginTop: 8, border: "1px solid #d4c5a0", background: "#fdf8ed", color: "#7d6320" }}>
            <strong>⭐ Satisfação Garantida</strong>
            <br />7 dias para trocas e devoluções. Seu dinheiro de volta se não ficar satisfeito.
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
            <strong>+15 mil</strong> clientes atendidos em todo o Brasil
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
