"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";

const VARIANT_META: Record<string, { label: string; swatches: string[] }> = {
  "2 Pretos":           { label: "2 Pretos",           swatches: ["#2e2e2e", "#2e2e2e"] },
  "2 Brancos":          { label: "2 Brancos",          swatches: ["#e0e0e0", "#e0e0e0"] },
  "1 Preto e 1 Branco": { label: "1 Preto e 1 Branco", swatches: ["#2e2e2e", "#e0e0e0"] },
};

function getVariantDisplay(variant: string, colorName: string) {
  const vk = variant.trim();
  const ck = colorName.trim();
  return VARIANT_META[vk] ?? VARIANT_META[ck] ?? { label: colorName || variant, swatches: [] };
}

const ESTADOS = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" }, { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" }, { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" }, { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" }, { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" }, { uf: "PB", nome: "Paraíba" }, { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" }, { uf: "TO", nome: "Tocantins" },
];

function CheckoutContent() {
  const searchParams = useSearchParams();

  let _ssVariant = "";
  try { _ssVariant = sessionStorage.getItem("thd_variant") || ""; } catch (_) {}
  const variant = (_ssVariant || searchParams.get("variant") || "2 Pretos").trim();
  const colorName = (searchParams.get("colorName") || variant).trim();
  const price = Number(searchParams.get("price")) || 109.9;
  const compareAt = Number(searchParams.get("compareAt")) || 219.8;
  const kitPrice = price;
  const kitCompare = compareAt;
  const image = searchParams.get("image") || "/images/dYdvdqs6VrAy.png";
  const title = searchParams.get("title") || "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]";

  const [step, setStep] = useState(1);
  const [selectedQty, setSelectedQty] = useState(1);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

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
  const [noNumber, setNoNumber] = useState(false);
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
  const stepsTopRef = useRef<HTMLDivElement>(null);

  /* ── Rastreamento Meta ──────────────────────────────────────── */
  const sessionIdRef = useRef<string>("");

  function getSessionId(): string {
    if (sessionIdRef.current) return sessionIdRef.current;
    if (typeof window !== "undefined" && (window as any).THD?.sessionId) {
      sessionIdRef.current = (window as any).THD.sessionId;
    }
    return sessionIdRef.current;
  }

  function getPixDiscount() {
    try {
      const stored = sessionStorage.getItem("thd_pix_discount");
      if (stored) return parseFloat(stored);
    } catch {}
    const min = 500;
    const max = 1000;
    const bp = Math.floor(Math.random() * (max - min + 1)) + min;
    const percent = bp / 100;
    try { sessionStorage.setItem("thd_pix_discount", String(percent)); } catch {}
    console.log(`[desconto] gerado: ${percent.toFixed(2)}% para o checkout`);
    return percent;
  }

  function sendTrackEvent(eventName: string, extraData?: Record<string, unknown>, pii?: Record<string, string>) {
    const sid = getSessionId();
    const eventId = eventName + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);

    /* Pixel client-side */
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("track", eventName, { value: totalAmount, currency: "BRL" }, { eventID: eventId });
    }

    /* CAPI via /api/track */
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId,
        sessionId: sid,
        url: typeof window !== "undefined" ? window.location.href : "",
        data: { value: totalAmount, currency: "BRL", ...extraData },
        pii,
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 950) {
      setSummaryOpen(true);
    }
  }, []);

  /* InitiateCheckout — dispara uma única vez ao montar o checkout */
  useEffect(() => {
    const timer = setTimeout(() => {
      sendTrackEvent("InitiateCheckout", {
        content_ids:  ["flexhome-armario-multifuncional"],
        content_type: "product",
        num_items:    selectedQty,
      });
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

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
    if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
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

  var nameError = nameTouched && name.trim().split(" ").filter(Boolean).length < 2 ? "Informe nome e sobrenome" : "";
  var emailError = emailTouched && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "E-mail inválido" : "";
  var phoneError = phoneTouched && phone.replace(/\D/g, "").length < 10 ? "Telefone inválido" : "";
  var cpfError = cpfTouched && !isValidCpf(cpf) ? "CPF inválido" : "";
  var cepError = cepTouched && cep.replace(/\D/g, "").length !== 8 ? "CEP inválido" : "";
  var streetError = streetTouched && !street.trim() ? "Informe o logradouro" : "";
  var numberError = !noNumber && numberTouched && !number.trim() ? "Informe o número" : "";
  var neighborhoodError = neighborhoodTouched && !neighborhood.trim() ? "Informe o bairro" : "";
  var cityError = cityTouched && !city.trim() ? "Informe a cidade" : "";
  var stateError = stateTouched && !state.trim() ? "Informe o estado" : "";
  var cardNumberError = cardNumberTouched && (!isValidLuhn(cardNumber) || cardNumber.replace(/\s/g, "").length < 15) ? "Número inválido" : "";
  var cardNameError = cardNameTouched && cardName.trim().split(" ").filter(Boolean).length < 2 ? "Nome inválido" : "";
  var cardExpiryError = cardExpiryTouched ? (function () { var m = parseInt(cardExpiry.split("/")[0]); var y = parseInt("20" + cardExpiry.split("/")[1]); var now = new Date(); return (!m || !y || m < 1 || m > 12 || y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1)) ? "Data inválida" : ""; })() : "";
  var cardCvvError = cardCvvTouched ? (function () { var len = cardCvv.length; var expected = cardFlag === "amex" ? 4 : 3; return len !== expected ? "CVV inválido" : ""; })() : "";

  var step1Valid = !nameError && !emailError && !phoneError && !cpfError && name.trim() && email.trim() && phone.replace(/\D/g, "").length >= 10 && isValidCpf(cpf);
  var step2Valid = !cepError && !streetError && !numberError && !neighborhoodError && !cityError && !stateError && cep.replace(/\D/g, "").length === 8 && street.trim() && (noNumber || number.trim()) && neighborhood.trim() && city.trim() && state.trim();

  function scrollToStepsTop() {
    if (stepsTopRef.current) {
      stepsTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function goStep(n: number) {
    if (n < step && transaction) return;
    setStep(n);
    setTimeout(scrollToStepsTop, 50);
  }

  function focusFirstInvalidStep1() {
    const ids = ["name", "email", "phone", "cpf"];
    const errors = [nameError || !name.trim(), emailError || !email.trim(), phoneError || phone.replace(/\D/g, "").length < 10, cpfError || !isValidCpf(cpf)];
    for (let i = 0; i < ids.length; i++) {
      if (errors[i]) {
        (document.getElementById(ids[i]) as HTMLInputElement)?.focus();
        return;
      }
    }
  }

  function focusFirstInvalidStep2() {
    const ids = ["cep", "street", "number", "neighborhood", "city", "state"];
    const vals = [cep.replace(/\D/g, "").length !== 8, !street.trim(), !number.trim(), !neighborhood.trim(), !city.trim(), !state.trim()];
    for (let i = 0; i < ids.length; i++) {
      if (vals[i]) {
        (document.getElementById(ids[i]) as HTMLInputElement)?.focus();
        return;
      }
    }
  }

  function handleStep1Continue() {
    setNameTouched(true); setEmailTouched(true); setPhoneTouched(true); setCpfTouched(true);
    if (!step1Valid) { focusFirstInvalidStep1(); return; }
    goStep(2);
  }

  function handleStep2Continue() {
    setStreetTouched(true); setNumberTouched(true); setNeighborhoodTouched(true); setCityTouched(true); setStateTouched(true);
    if (!step2Valid) { focusFirstInvalidStep2(); return; }
    goStep(3);
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

    /* AddToCart — PII em claro, hash acontece no servidor */
    sendTrackEvent(
      "AddToCart",
      { content_ids: ["flexhome-armario-multifuncional"], content_type: "product", num_items: selectedQty },
      { email: email.trim(), phone: phone.replace(/\D/g, ""), name: name.trim(), city: city.trim(), state: state.trim(), zip: cep.replace(/\D/g, "") }
    );

    try {
      const clientUtms = (typeof window !== "undefined" && (window as any).THD?.utms) || {};
      var response = await fetch("/api/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          amount: totalAmount,
          title: title,
          quantity: selectedQty,
          sessionId: getSessionId(),
          utms: clientUtms,
          discountPercent: pixDiscountPercent,
          originalTotalCents: totalOrigCents,
          discountValueCents: discountCents,
          finalTotalCents: totalAmountCents,
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

  /* Redireciona para upsell1 quando pagamento confirmado */
  useEffect(() => {
    if (transaction?.status !== "paid") return;
    try {
      localStorage.setItem("_thd_customer", JSON.stringify({
        name, email, phone, cpf,
        address: { zip: cep, street, number, complement, neighborhood, city, state },
      }));
      sessionStorage.setItem("orderData", JSON.stringify({ nome: name, email, cpf, phone }));
    } catch (_) {}
    const t = setTimeout(() => { window.location.href = "/importacao"; }, 2500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.status]);

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

  var pixDiscountDecimal = paymentMethod === "pix" ? getPixDiscount() : 0;
  var pixDiscountPercent = pixDiscountDecimal * 100;
  var totalOrigCents = Math.round(kitPrice * selectedQty * 100);
  var discountCents = Math.round(totalOrigCents * pixDiscountDecimal);
  var totalAmountCents = totalOrigCents - discountCents;
  var totalAmount = totalAmountCents / 100;
  var discountAmount = discountCents / 100;

  var steps = [
    { n: 1, label: "Cliente" },
    { n: 2, label: "Endereço" },
    { n: 3, label: "Pagamento" },
  ];

  return (
    <div className="checkout-body">
      <header className="checkout-header">
        <a href="/">
          <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" />
        </a>
        <span className="checkout-security">🔒 Compra Segura</span>
      </header>

      <div className="timer-bar" style={{ textAlign: "center", padding: "10px 16px", lineHeight: 1.5 }}>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.01em" }}>
          🎉 Sua compra ficou ainda melhor: Você ganhou <span style={{ background: "rgba(255,255,255,0.2)", padding: "1px 8px", borderRadius: 5 }}>{pixDiscountPercent.toFixed(2).replace(".", ",")}% de Desconto!</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 400, marginTop: 3, opacity: 0.9 }}>
          Escolha o Pix como forma de pagamento hoje e o desconto será aplicado automaticamente.
        </div>
      </div>

      <div className="checkout-layout container" style={{ alignItems: "start" }} ref={stepsTopRef}>
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

          {/* Resumo passo 1 */}
          {step > 1 && !transaction && (
            <button type="button" onClick={() => goStep(1)} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", border: "1px solid var(--line)",
              borderRadius: 10, padding: "10px 14px", cursor: "pointer",
              textAlign: "left", width: "100%",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email} · {phone}</div>
              </div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, flexShrink: 0, textDecoration: "underline" }}>Editar</span>
            </button>
          )}

          {/* Resumo passo 2 */}
          {step > 2 && !transaction && (
            <button type="button" onClick={() => goStep(2)} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", border: "1px solid var(--line)",
              borderRadius: 10, padding: "10px 14px", cursor: "pointer",
              textAlign: "left", width: "100%",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{street}, {number}{complement ? `, ${complement}` : ""}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{neighborhood} — {city}/{state} · CEP {cep}</div>
              </div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, flexShrink: 0, textDecoration: "underline" }}>Editar</span>
            </button>
          )}

          {step === 1 && !transaction && (
            <div className="checkout-card active">
              <div className="checkout-card-header">
                <h2><span className="step-number">1</span> Informações do Cliente</h2>
              </div>
              <div className="step-content">
                <div className="form-grid">
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="name">Nome completo</label>
                    <input id="name" type="text" value={name} onChange={(e) => { setName(e.target.value); setNameTouched(true); }} onBlur={() => setNameTouched(true)} placeholder="Seu nome completo" className={nameError ? "invalid" : ""} style={nameTouched && name && !nameError ? { borderColor: "var(--success)" } : undefined} autoComplete="name" />
                    <div className={`field-hint ${nameError ? "error" : nameTouched && name && !nameError ? "success" : ""}`} style={{ visibility: nameTouched ? "visible" : "hidden" }}>
                      {nameError || (nameTouched && name && !nameError ? "✓ Nome válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }} onBlur={() => setEmailTouched(true)} placeholder="seu@email.com" className={emailError ? "invalid" : ""} style={emailTouched && email && !emailError ? { borderColor: "var(--success)" } : undefined} autoComplete="email" />
                    <div className={`field-hint ${emailError ? "error" : emailTouched && email && !emailError ? "success" : ""}`} style={{ visibility: emailTouched ? "visible" : "hidden" }}>
                      {emailError || (emailTouched && email && !emailError ? "✓ E-mail válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Telefone / WhatsApp</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setPhoneTouched(true); }} onBlur={() => setPhoneTouched(true)} placeholder="(11) 99999-9999" maxLength={15} className={phoneError ? "invalid" : ""} style={phoneTouched && phone && !phoneError ? { borderColor: "var(--success)" } : undefined} autoComplete="tel" />
                    <div className={`field-hint ${phoneError ? "error" : phoneTouched && phone && !phoneError ? "success" : ""}`} style={{ visibility: phoneTouched ? "visible" : "hidden" }}>
                      {phoneError || (phoneTouched && phone && !phoneError ? "✓ Telefone válido" : ".")}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" value={cpf} onChange={(e) => { setCpf(formatCpf(e.target.value)); setCpfTouched(true); }} onBlur={() => setCpfTouched(true)} placeholder="000.000.000-00" maxLength={14} className={cpfError ? "invalid" : ""} style={cpfTouched && cpf && !cpfError ? { borderColor: "var(--success)" } : undefined} autoComplete="off" inputMode="numeric" />
                    <div className={`field-hint ${cpfError ? "error" : cpfTouched && cpf && !cpfError ? "success" : ""}`} style={{ visibility: cpfTouched ? "visible" : "hidden" }}>
                      {cpfError || (cpfTouched && cpf && !cpfError ? "✓ CPF válido" : ".")}
                    </div>
                  </div>
                </div>

                <button className="button button-primary button-large" style={{ width: "100%", marginTop: 18 }} onClick={handleStep1Continue}>
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
                      <input id="cep" type="text" value={cep} onChange={(e) => { var v = formatCep(e.target.value); setCep(v); setCepTouched(true); if (v.replace(/\D/g, "").length === 8) fetchAddress(v); }} onBlur={() => setCepTouched(true)} placeholder="00000-000" maxLength={9} className={cepError ? "invalid" : ""} style={cep && !cepError ? { borderColor: "var(--success)" } : undefined} inputMode="numeric" autoComplete="postal-code" />
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
                        <label htmlFor="street">Rua / Avenida</label>
                        <input id="street" type="text" value={street} onChange={(e) => { setStreet(e.target.value); setStreetTouched(true); }} onBlur={() => setStreetTouched(true)} placeholder="Rua, Avenida..." className={streetError ? "invalid" : ""} style={street && !streetError ? { borderColor: "var(--success)" } : undefined} autoComplete="street-address" />
                        <div className={`field-hint ${streetError ? "error" : ""}`} style={{ visibility: streetTouched ? "visible" : "hidden" }}>{streetError || "."}</div>
                      </div>
                      <div className="field" style={{ maxWidth: 110 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                          <label htmlFor="number" style={{ margin: 0 }}>Número</label>
                          <button type="button" onClick={() => { setNoNumber(!noNumber); setNumber(!noNumber ? "S/N" : ""); setNumberTouched(true); }} style={{ fontSize: 10, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", fontWeight: 400, lineHeight: 1 }}>
                            {noNumber ? "inserir nº" : "sem nº"}
                          </button>
                        </div>
                        <input
                          id="number"
                          type="text"
                          value={noNumber ? "S/N" : number}
                          onChange={(e) => { if (!noNumber) { setNumber(e.target.value); setNumberTouched(true); } }}
                          onBlur={() => setNumberTouched(true)}
                          placeholder="Nº"
                          readOnly={noNumber}
                          className={numberError ? "invalid" : ""}
                          style={{
                            ...(noNumber ? { background: "#f8f8f8", color: "var(--muted)", fontStyle: "italic" } : {}),
                            ...(!noNumber && number && !numberError ? { borderColor: "var(--success)" } : {}),
                          }}
                          inputMode="numeric"
                        />
                        <div className={`field-hint ${numberError ? "error" : !noNumber && number && !numberError ? "success" : ""}`} style={{ visibility: numberTouched ? "visible" : "hidden" }}>
                          {numberError || (!noNumber && number && !numberError ? "✓ Ok" : ".")}
                        </div>
                      </div>
                    </div>

                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="complement">Complemento <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: 11 }}>(opcional)</span></label>
                        <input id="complement" type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." autoComplete="address-line2" />
                      </div>
                      <div className="field">
                        <label htmlFor="neighborhood">Bairro</label>
                        <input id="neighborhood" type="text" value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setNeighborhoodTouched(true); }} onBlur={() => setNeighborhoodTouched(true)} placeholder="Bairro" className={neighborhoodError ? "invalid" : ""} style={neighborhood && !neighborhoodError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${neighborhoodError ? "error" : ""}`} style={{ visibility: neighborhoodTouched ? "visible" : "hidden" }}>{neighborhoodError || "."}</div>
                      </div>
                    </div>

                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <input id="city" type="text" value={city} onChange={(e) => { setCity(e.target.value); setCityTouched(true); }} onBlur={() => setCityTouched(true)} placeholder="Cidade" className={cityError ? "invalid" : ""} style={city && !cityError ? { borderColor: "var(--success)" } : undefined} />
                        <div className={`field-hint ${cityError ? "error" : ""}`} style={{ visibility: cityTouched ? "visible" : "hidden" }}>{cityError || "."}</div>
                      </div>
                      <div className="field" style={{ maxWidth: 180 }}>
                        <label htmlFor="state">Estado</label>
                        <select
                          id="state"
                          value={state}
                          onChange={(e) => { setState(e.target.value); setStateTouched(true); }}
                          onBlur={() => setStateTouched(true)}
                          className={stateError ? "invalid" : ""}
                          style={{
                            width: "100%", padding: "10px 12px", border: "1.5px solid",
                            borderColor: stateError ? "var(--danger)" : state && !stateError ? "var(--success)" : "var(--line)",
                            borderRadius: 10, background: "#fff", cursor: "pointer",
                            appearance: "auto",
                          }}
                        >
                          <option value="">Selecione</option>
                          {ESTADOS.map(e => (
                            <option key={e.uf} value={e.uf}>{e.uf} — {e.nome}</option>
                          ))}
                        </select>
                        <div className={`field-hint ${stateError ? "error" : ""}`} style={{ visibility: stateTouched ? "visible" : "hidden" }}>{stateError || "."}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button className="button button-dark" style={{ flex: 1 }} onClick={() => goStep(1)}>
                        ← Voltar
                      </button>
                      <button className="button button-primary button-large" style={{ flex: 2 }} onClick={handleStep2Continue}>
                        Ir para Pagamento <span style={{ marginLeft: 6 }}>→</span>
                      </button>
                    </div>
                  </>
                )}

                {!cepFetched && cepTouched && cep.replace(/\D/g, "").length === 8 && !fetchingCep && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>CEP não encontrado. Preencha o endereço manualmente:</p>
                    <div className="form-grid address-line">
                      <div className="field">
                        <label htmlFor="street">Rua / Avenida</label>
                        <input id="street" type="text" value={street} onChange={(e) => { setStreet(e.target.value); setStreetTouched(true); }} placeholder="Rua, Avenida..." />
                      </div>
                      <div className="field" style={{ maxWidth: 110 }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                          <label htmlFor="number" style={{ margin: 0 }}>Número</label>
                          <button type="button" onClick={() => { setNoNumber(!noNumber); setNumber(!noNumber ? "S/N" : ""); setNumberTouched(true); }} style={{ fontSize: 10, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", fontWeight: 400, lineHeight: 1 }}>
                            {noNumber ? "inserir nº" : "sem nº"}
                          </button>
                        </div>
                        <input id="number" type="text" value={noNumber ? "S/N" : number} onChange={(e) => { if (!noNumber) { setNumber(e.target.value); setNumberTouched(true); } }} placeholder="Nº" readOnly={noNumber} style={noNumber ? { background: "#f8f8f8", color: "var(--muted)", fontStyle: "italic" } : undefined} inputMode="numeric" />
                      </div>
                    </div>
                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="complement" style={{ opacity: 0.7 }}>Complemento (opcional)</label>
                        <input id="complement" type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, Bloco..." />
                      </div>
                      <div className="field">
                        <label htmlFor="neighborhood">Bairro</label>
                        <input id="neighborhood" type="text" value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setNeighborhoodTouched(true); }} placeholder="Bairro" />
                      </div>
                    </div>
                    <div className="form-grid address-line" style={{ marginTop: 14 }}>
                      <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <input id="city" type="text" value={city} onChange={(e) => { setCity(e.target.value); setCityTouched(true); }} placeholder="Cidade" />
                      </div>
                      <div className="field" style={{ maxWidth: 180 }}>
                        <label htmlFor="state">Estado</label>
                        <select id="state" value={state} onChange={(e) => { setState(e.target.value); setStateTouched(true); }} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 10, background: "#fff" }}>
                          <option value="">Selecione</option>
                          {ESTADOS.map(e => (
                            <option key={e.uf} value={e.uf}>{e.uf} — {e.nome}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button className="button button-dark" style={{ flex: 1 }} onClick={() => goStep(1)}>← Voltar</button>
                      <button className="button button-primary button-large" style={{ flex: 2 }} onClick={handleStep2Continue}>Ir para Pagamento →</button>
                    </div>
                  </div>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        PIX <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.8, fontWeight: 400 }}>—{pixDiscountPercent.toFixed(2).replace(".", ",")}% off</span>
                      </button>
                      <button type="button" className={`payment-tab ${paymentMethod === "card" ? "active" : ""}`} onClick={() => setPaymentMethod("card")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        Cartão
                      </button>
                    </div>

                    {paymentMethod === "pix" && (
                      <div className="payment-panel" style={{ marginTop: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f0faf5", border: "1px solid #c3e6d4", borderRadius: 10, marginBottom: 16 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                          <div>
                            <strong style={{ fontSize: 13, display: "block", color: "var(--ink)" }}>Aprovação instantânea com PIX</strong>
                            <span style={{ fontSize: 12, color: "var(--muted)" }}>Confirmado em segundos · sem taxas adicionais</span>
                          </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <button className="button button-primary" style={{ width: "100%", fontSize: 15, fontWeight: 800, letterSpacing: "0.02em" }} onClick={handleFinish} disabled={loading}>
                            {loading ? (
                              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                <span style={{ display: "inline-block", width: 17, height: 17, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                Gerando código PIX...
                              </span>
                            ) : "Gerar QR Code PIX"}
                          </button>
                        </div>
                        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          Pagamento protegido por criptografia SSL
                        </p>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div className="payment-panel" style={{ marginTop: 14, textAlign: "center", padding: "32px 16px" }}>
                        <span style={{ fontSize: 40 }}>💳</span>
                        <h3 style={{ margin: "12px 0 6px" }}>Cartão de crédito indisponível</h3>
                        <p style={{ color: "var(--muted)", fontSize: 14 }}>No momento o pagamento por cartão de crédito está fora do ar. Selecione a opção <strong>PIX</strong> para finalizar sua compra.</p>
                      </div>
                    )}
                  </>
                )}

                {transaction && !paid && (
                  <div className="payment-panel">
                    <div style={{ textAlign: "center", marginBottom: 14 }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>Escaneie o QR Code</h3>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
                        Total a pagar: <strong style={{ color: "var(--ink)", fontSize: 15 }}>R$ {totalAmount.toFixed(2).replace(".", ",")}</strong>
                      </p>
                    </div>
                    <div className="qr-result" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {transaction.pixQrCodeImage && (
                        <img src={transaction.pixQrCodeImage} alt="QR Code PIX" style={{ display: "block", margin: "0 auto", borderRadius: 12, border: "4px solid var(--line)" }} />
                      )}
                    </div>

                    {/* Copia e cola PIX */}
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, textAlign: "center" }}>
                        Ou copie o código PIX
                      </p>
                      <div style={{
                        border: "1.5px solid var(--line)", borderRadius: 12,
                        overflow: "hidden", background: "#fafafa",
                      }}>
                        <div style={{
                          padding: "12px 14px",
                          fontFamily: "monospace", fontSize: 12,
                          color: "var(--ink)", lineHeight: 1.6,
                          wordBreak: "break-all",
                          maxHeight: 80, overflowY: "auto",
                          userSelect: "all", cursor: "text",
                        }}
                          onClick={(e) => {
                            const sel = window.getSelection();
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            sel?.removeAllRanges();
                            sel?.addRange(range);
                          }}
                        >
                          {transaction.pixQrCode}
                        </div>
                        <button
                          type="button"
                          onClick={copyPixCode}
                          style={{
                            width: "100%", padding: "13px 16px",
                            background: copied ? "var(--success)" : "var(--accent)",
                            color: "#fff", border: 0, cursor: "pointer",
                            fontWeight: 900, fontSize: 14, letterSpacing: "0.04em",
                            transition: "background 0.2s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          }}
                        >
                          {copied ? (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              Código copiado!
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                              Copiar código PIX
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Instruções de pagamento PIX */}
                    <div style={{ marginTop: 18, padding: "14px 16px", background: "#f8f9ff", border: "1px solid #e0e4f0", borderRadius: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--ink)" }}>Como pagar com PIX:</p>
                      <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 7 }}>
                        {[
                          "Abra o app do seu banco ou carteira digital",
                          "Toque em \"Pagar\" e escolha \"PIX\"",
                          "Escaneie o QR Code ou cole o código copiado",
                          "Confirme o valor e finalize o pagamento",
                        ].map((s, i) => (
                          <li key={i} style={{ fontSize: 13, color: "var(--muted)" }}>
                            <strong style={{ color: "var(--ink)" }}>{s.split(" ")[0]} </strong>
                            {s.split(" ").slice(1).join(" ")}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="payment-hints" style={{ marginTop: 14 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 1.5s ease-in-out infinite" }} />
                        Aguardando pagamento...
                      </span>
                      <span>Confirmação automática em segundos</span>
                    </div>
                  </div>
                )}

                {paid && (
                  <div className="payment-panel" style={{ border: "2px solid var(--success)" }}>
                    <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                      <div style={{ fontSize: 56 }}>✅</div>
                      <h3 style={{ color: "var(--success)", margin: "8px 0 6px" }}>Pagamento Confirmado!</h3>
                      <p style={{ color: "var(--muted)", fontSize: 14 }}>Seu pedido foi processado com sucesso.</p>
                      <p style={{ color: "var(--muted)", fontSize: 13 }}>Redirecionando para uma oferta especial...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <p style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13, textAlign: "center", marginTop: 10, padding: "10px 14px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fdd" }}>{error}</p>
                )}

                {!transaction && !paid && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                    <button className="button button-dark" style={{ padding: "0 20px", minHeight: 40, fontSize: 13 }} onClick={() => goStep(2)}>
                      ← Voltar ao endereço
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="order-summary">
          {/* Cabeçalho com toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>Resumo do pedido</h2>
            <button
              type="button"
              onClick={() => setSummaryOpen(!summaryOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                border: "1px solid var(--line)", borderRadius: 20,
                background: "#faf8f7", padding: "4px 12px",
                fontSize: 12, color: "var(--muted)", cursor: "pointer", fontWeight: 700,
              }}
            >
              {summaryOpen ? "Ocultar" : "Ver detalhes"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: summaryOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Prévia sempre visível: foto + info + total */}
          <div style={{
            display: "flex", gap: 12, alignItems: "center",
            padding: 14, borderRadius: 14,
            border: "1px solid var(--line)", background: "#faf8f7",
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={image}
                alt={title}
                style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)", background: "#fff" }}
              />
              <span style={{
                position: "absolute", top: -6, right: -6,
                background: "var(--accent)", color: "#fff",
                fontSize: 11, fontWeight: 900, lineHeight: 1,
                padding: "3px 6px", borderRadius: 20, minWidth: 20, textAlign: "center",
              }}>
                {selectedQty}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {title}
              </div>
              {(() => {
                const { label, swatches } = getVariantDisplay(variant, colorName);
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {swatches.map((c, i) => (
                        <span key={i} title={label} style={{
                          display: "inline-block", width: 18, height: 18, borderRadius: "50%",
                          background: c,
                          border: c === "#e0e0e0" ? "1.5px solid #bbb" : "1.5px solid rgba(0,0,0,0.3)",
                          flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 700 }}>
                      Cor: {label}
                    </span>
                  </div>
                );
              })()}
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 16, color: "var(--ink)" }}>
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </strong>
                {pixDiscountDecimal > 0 && (
                  <s style={{ fontSize: 12, color: "var(--muted)" }}>
                    R$ {(kitPrice * selectedQty).toFixed(2).replace(".", ",")}
                  </s>
                )}
                {pixDiscountDecimal === 0 && (
                  <s style={{ fontSize: 12, color: "var(--muted)" }}>
                    R$ {(kitCompare * selectedQty).toFixed(2).replace(".", ",")}
                  </s>
                )}
                {pixDiscountDecimal > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 900, background: "#22c55e", color: "#fff", borderRadius: 4, padding: "1px 5px" }}>
                    PIX −{pixDiscountPercent.toFixed(2).replace(".", ",")}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detalhe expandido */}
          {summaryOpen && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Seletor de quantidade */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "11px 11px 0 0", background: "#fff", borderBottom: "none" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Quantidade de kits</span>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button type="button" onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} disabled={selectedQty <= 1} style={{ width: 32, height: 32, border: "1px solid var(--line)", borderRadius: "8px 0 0 8px", background: "#faf8f7", fontWeight: 900, cursor: "pointer", fontSize: 15, opacity: selectedQty <= 1 ? 0.4 : 1, lineHeight: 1 }}>−</button>
                  <span style={{ width: 36, textAlign: "center", fontWeight: 900, fontSize: 14, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", lineHeight: "32px" }}>{selectedQty}</span>
                  <button type="button" onClick={() => setSelectedQty(Math.min(5, selectedQty + 1))} disabled={selectedQty >= 5} style={{ width: 32, height: 32, border: "1px solid var(--line)", borderRadius: "0 8px 8px 0", background: "#faf8f7", fontWeight: 900, cursor: "pointer", fontSize: 15, opacity: selectedQty >= 5 ? 0.4 : 1, lineHeight: 1 }}>+</button>
                </div>
              </div>

              {/* Totais */}
              <div style={{ border: "1px solid var(--line)", borderRadius: "0 0 11px 11px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal ({selectedQty} kit{selectedQty > 1 ? "s" : ""})</span>
                  <strong>R$ {(kitPrice * selectedQty).toFixed(2).replace(".", ",")}</strong>
                </div>
                {pixDiscountDecimal > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>Desconto PIX ({pixDiscountPercent.toFixed(2).replace(".", ",")}%)</span>
                    <strong style={{ color: "#22c55e" }}>− R$ {discountAmount.toFixed(2).replace(".", ",")}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid var(--line)", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>Frete</span>
                  <strong style={{ color: "var(--success)" }}>Grátis</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#faf8f7" }}>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>Total</span>
                  <strong style={{ fontSize: 18 }}>R$ {totalAmount.toFixed(2).replace(".", ",")}</strong>
                </div>
              </div>

              {/* Economia */}
              <div style={{ marginTop: 10, padding: "8px 14px", background: "#f0faf5", border: "1px solid #c3e6d4", borderRadius: 10, fontSize: 12, color: "var(--success)", fontWeight: 700, textAlign: "center" }}>
                💰 Você economiza R$ {(kitCompare * selectedQty - totalAmount).toFixed(2).replace(".", ",")} nesta oferta
                {pixDiscountDecimal > 0 && <span style={{ fontWeight: 400 }}> (inclui {pixDiscountPercent.toFixed(2).replace(".", ",")}% PIX)</span>}
              </div>

              {/* Selos de confiança */}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { icon: "🔒", text: "Compra 100% segura e criptografada" },
                  { icon: "🚚", text: "Frete grátis · Entrega em 3–8 dias úteis" },
                  { icon: "🔄", text: "7 dias para troca ou devolução gratuita" },
                  { icon: "⭐", text: "+15 mil clientes atendidos em todo o Brasil" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{ background: "#011843", color: "rgba(255,255,255,0.82)", padding: "48px 0 48px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 24px" }}>
          <img src="/images/ZevbLkVeF2gs.svg" alt="Amex"        width="46" height="30" />
          <img src="/images/ArGWVJHpgYvU.svg" alt="Visa"        width="46" height="30" />
          <img src="/images/0ovYmYCaKmvG.svg" alt="Diners Club" width="46" height="30" />
          <img src="/images/q0kdVVG0rtRH.svg" alt="Mastercard"  width="46" height="30" />
          <img src="/images/pYoM0lYcIBRp.svg" alt="Discover"   width="46" height="30" />
          <img src="/images/R8kYc3JGxQCa.svg" alt="Aura"       width="46" height="30" />
          <img src="/images/PSdsna7V1PGI.svg" alt="Elo"         width="46" height="30" />
          <img src="/images/fGHGNLPt08me.svg" alt="Hiper"       width="46" height="30" />
          <img src="/images/9zS7PqYNCPfs.svg" alt="Pix"         width="46" height="30" />
        </div>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
          gap: "8px 32px", marginTop: 36, padding: "24px 24px 0",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          fontSize: 11, textAlign: "center",
        }}>
          <span>Compra protegida por criptografia SSL.</span>
          <small>© {new Date().getFullYear()} Triunfo Home Design. Todos os direitos reservados.</small>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
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
