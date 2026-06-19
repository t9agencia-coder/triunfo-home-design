(function () {
  "use strict";

  /* ── Helpers de cookie ─────────────────────────────────────── */
  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value, days) {
    var exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) +
      "; expires=" + exp + "; path=/; SameSite=Lax";
  }

  /* ── Session ID (1ª parte, 7 dias) ────────────────────────── */
  var sid = getCookie("_thd_sid");
  if (!sid) {
    sid = "sid_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
    setCookie("_thd_sid", sid, 7);
  }

  /* ── Captura de UTMs e fbclid ─────────────────────────────── */
  var params = {};
  try { params = Object.fromEntries(new URLSearchParams(window.location.search)); } catch (e) {}

  var utms = {
    fbclid:       params.fbclid       || null,
    utm_source:   params.utm_source   || null,
    utm_medium:   params.utm_medium   || null,
    utm_campaign: params.utm_campaign || null,
    utm_content:  params.utm_content  || null,
    utm_term:     params.utm_term     || null,
  };

  /* Persiste UTMs no sessionStorage para valer em todo o funil */
  try {
    var stored = JSON.parse(sessionStorage.getItem("_thd_utms") || "{}");
    Object.keys(utms).forEach(function (k) {
      if (!utms[k] && stored[k]) utms[k] = stored[k];
    });
    if (Object.values(utms).some(Boolean)) {
      sessionStorage.setItem("_thd_utms", JSON.stringify(utms));
    }
  } catch (e) {}

  /* ── Geração de eventId único ─────────────────────────────── */
  function genEventId(name) {
    return name + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  /* ── Leitura de fbp e fbc (após pixel carregar) ───────────── */
  function readMetaCookies() {
    return {
      fbp: getCookie("_fbp") || null,
      fbc: getCookie("_fbc") || null,
    };
  }

  /* ── Disparo de evento (Pixel + CAPI) ────────────────────── */
  function fireEvent(eventName, data, options) {
    data    = data    || {};
    options = options || {};

    var eventId = options.eventId || genEventId(eventName);
    var meta    = readMetaCookies();

    /* 1. Meta Pixel (client-side) */
    if (typeof window.fbq === "function") {
      var pixelData = {};
      if (data.value)       pixelData.value       = data.value;
      if (data.currency)    pixelData.currency    = data.currency || "BRL";
      if (data.content_ids) pixelData.content_ids = data.content_ids;
      if (data.content_type) pixelData.content_type = data.content_type;
      if (data.num_items)   pixelData.num_items   = data.num_items;
      window.fbq("track", eventName, pixelData, { eventID: eventId });
    }

    /* 2. CAPI via /api/track (server-side) */
    try {
      fetch("/api/track", {
        method:    "POST",
        headers:   { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          eventName:    eventName,
          eventId:      eventId,
          sessionId:    sid,
          fbp:          meta.fbp,
          fbc:          meta.fbc,
          url:          window.location.href,
          referer:      document.referrer || null,
          utms:         utms,
          data:         data,
        }),
      }).catch(function () {});
    } catch (e) {}

    return eventId;
  }

  /* ── API pública ─────────────────────────────────────────── */
  var queue = [];
  window.THD = {
    sessionId:  sid,
    utms:       utms,
    fireEvent:  fireEvent,
    /* Permite código na página chamar THD.ready(fn) antes do script carregar */
    ready: function (fn) { fn(); },
  };

  /* Executa itens enfileirados antes deste script carregar */
  (window._THD_Q || []).forEach(function (item) {
    try { fireEvent(item[0], item[1], item[2]); } catch (e) {}
  });
  window._THD_Q = queue; // não enfileira mais; executa direto via fireEvent

  /* ── PageView automático ─────────────────────────────────── */
  function firePageView() {
    fireEvent("PageView", {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(firePageView, 150);
    });
  } else {
    setTimeout(firePageView, 150);
  }

})();
