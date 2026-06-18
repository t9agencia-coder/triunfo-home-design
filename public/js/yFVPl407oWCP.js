(function () {
  "use strict";

  var galleryImages = [
    { name: "Armários FlexHome grafite e branco", image: "/images/dYdvdqs6VrAy.png" },
    { name: "Armário FlexHome — foto 2", image: "/images/armario-2.png" },
    { name: "Armário FlexHome — foto 3", image: "/images/armario-3.png" },
    { name: "Armário FlexHome — foto 4", image: "/images/armario-4.png" },
    { name: "Armário FlexHome — foto 5", image: "/images/armario-5.png" },
    { name: "Armário FlexHome — foto 6", image: "/images/armario-6.png" }
  ];

  var selection = {
    color: { id: "grafite-branco", name: "Grafite e branco", image: galleryImages[0].image },
    size: "Padrão",
    units: 2,
    price: 109.90,
    compareAt: 219.80,
    variant: "2 Pretos",
    imageIndex: 0
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function forEach(arr, fn) {
    Array.prototype.forEach.call(arr, fn);
  }

  var mainImage = byId("main-product-image");
  var cartLayer = byId("cart-layer");
  var cartItems = byId("cart-items");
  var cartFooter = byId("cart-footer");
  var toast = byId("toast");

  function setImage(index) {
    selection.imageIndex = index;
    mainImage.src = galleryImages[index].image;
    mainImage.alt = galleryImages[index].name;
    forEach(document.querySelectorAll("[data-image-index]"), function (button) {
      if (button.classList) {
        button.classList.toggle("active", Number(button.getAttribute("data-image-index")) === index);
      } else {
        var c = String(button.className || "");
        var active = Number(button.getAttribute("data-image-index")) === index;
        button.className = active && c.indexOf("active") === -1 ? c + " active" : c.replace(" active", "");
      }
    });
  }

  function setupGallery() {
    /* handled by inline script in page.tsx */
  }

  function setupReviews() {
    var reviewsColumn = document.querySelector(".reviews-column");
    var pagination = byId("reviews-pagination");
    if (!reviewsColumn || !pagination) return;

    var reviews = qsa(".review-card", reviewsColumn);
    var perPage = 4;
    var total = Math.ceil(reviews.length / perPage);
    var current = 1;

    if (total <= 1) { pagination.hidden = true; return; }

    function arrow(d) {
      var p = d === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="' + p + '"></polyline></svg>';
    }

    function btn(label, page, opts) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reviews-page-button" + (opts.active ? " active" : "");
      b.innerHTML = opts.icon || label;
      b.disabled = opts.disabled;
      b.setAttribute("aria-label", opts.ariaLabel || "P\u00e1gina " + label);
      if (opts.active) b.setAttribute("aria-current", "page");
      b.addEventListener("click", function () { show(page, true); });
      return b;
    }

    function render() {
      pagination.innerHTML = "";
      pagination.appendChild(btn("Anterior", current - 1, { disabled: current === 1, icon: arrow("prev"), ariaLabel: "P\u00e1gina anterior" }));
      for (var p = 1; p <= total; p += 1) {
        pagination.appendChild(btn(String(p), p, { active: p === current, disabled: false }));
      }
      pagination.appendChild(btn("Pr\u00f3xima", current + 1, { disabled: current === total, icon: arrow("next"), ariaLabel: "Pr\u00f3xima p\u00e1gina" }));
    }

    function show(page, shouldScroll) {
      current = Math.max(1, Math.min(page, total));
      var start = (current - 1) * perPage;
      var end = start + perPage;
      forEach(reviews, function (r, i) { r.hidden = i < start || i >= end; });
      render();
      if (shouldScroll) {
        var t = byId("reviews-title");
        if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    show(1, false);
  }

  var variantUrls = {
    "2 Pretos":          "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326975727724&store=33269",
    "2 Brancos":         "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326971813372&store=33269",
    "1 Preto e 1 Branco":"https://seguro.triunfohomedesign.com/api/public/shopify?product=3326933997479&store=33269"
  };

  function currentItem() {
    return {
      id: "flexhome-pague-1-leve-2",
      color: selection.color.id,
      colorName: selection.color.name,
      size: selection.size,
      units: selection.units,
      price: selection.price,
      compareAt: selection.compareAt,
      variant: selection.variant,
      image: selection.color.image,
      title: "FlexHome - Arm\u00e1rio Multifuncional [PAGUE 1 LEVE 2]"
    };
  }

  function purchaseUrl(item) {
    var p = [];
    function add(k, v) { p.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v || ""))); }
    add("variant", item.variant);
    add("color", item.color);
    add("colorName", item.colorName);
    add("price", item.price);
    add("compareAt", item.compareAt);
    add("units", item.units);
    add("image", item.image);
    add("title", item.title);
    return "/checkout?" + p.join("&");
  }

  function goToPurchase() {
    window.location.href = purchaseUrl(currentItem());
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove("visible"); }, 2600);
  }

  function openCart() {
    renderCart();
    cartLayer.classList.add("open");
    cartLayer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeCart() {
    cartLayer.classList.remove("open");
    cartLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function renderCart() {
    var items = window.CoberdromStore.getCart();
    var total = items.reduce(function (s, i) { return s + Number(i.price); }, 0);

    var cc = byId("cart-count");
    var hc = byId("header-cart-count");
    var ct = byId("cart-total");

    if (cc) cc.textContent = "(" + items.length + ")";
    if (hc) hc.textContent = String(items.length);
    if (ct) ct.textContent = window.CoberdromStore.money(total);

    cartItems.innerHTML = "";
    cartFooter.hidden = items.length === 0;

    if (!items.length) {
      cartItems.innerHTML = '<div class="empty-cart"><strong>Seu carrinho est\u00e1 vazio.</strong><p>Escolha uma cor, um tamanho e adicione o produto.</p></div>';
      return;
    }

    forEach(items, function (item) {
      var a = document.createElement("article");
      a.className = "cart-item";
      a.innerHTML = '<img src="' + item.image + '" alt="' + item.title + '">' +
        '<div><strong>' + item.title + '</strong>' +
        '<span>Cor: ' + item.colorName + ' \u00b7 Tam: ' + item.size + '</span>' +
        '<span>Quantidade: ' + item.units + '</span>' +
        '<b>' + window.CoberdromStore.money(item.price) + '</b></div>' +
        '<button type="button" aria-label="Remover item" data-remove-id="' + item.id + '">\u00d7</button>';
      cartItems.appendChild(a);
    });
  }

  function init() {
    try { setupGallery(); } catch (e) {}
    try { setupReviews(); } catch (e) {}

    var fy = byId("footer-year");
    if (fy) fy.textContent = new Date().getFullYear();

    var colorSel = byId("offer-color-selector");
    if (colorSel) colorSel.hidden = false;

    var offerToggle = byId("special-offer-toggle");
    if (offerToggle) {
      offerToggle.classList.add("open");
      offerToggle.setAttribute("aria-expanded", "true");
      offerToggle.addEventListener("click", function () {
        var sel = byId("offer-color-selector");
        var willOpen = sel.hidden;
        sel.hidden = !willOpen;
        this.classList.toggle("open", willOpen);
        this.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    }

    var variantSel = byId("variant-select");
    if (variantSel) {
      variantSel.addEventListener("change", function () { selection.variant = this.value; });
    }

    var buyNow = byId("buy-now");
    if (buyNow) buyNow.addEventListener("click", goToPurchase);

    var stickyBuy = byId("sticky-buy");
    if (stickyBuy) stickyBuy.addEventListener("click", goToPurchase);

    /* shipping calc handled by inline script in page.tsx */

    byId("close-cart") && byId("close-cart").addEventListener("click", closeCart);
    byId("cart-backdrop") && byId("cart-backdrop").addEventListener("click", closeCart);
    byId("header-cart-button") && byId("header-cart-button").addEventListener("click", openCart);

    var cartCheckout = byId("cart-checkout");
    if (cartCheckout) {
      cartCheckout.addEventListener("click", function () {
        var items = window.CoberdromStore.getCart();
        if (items.length > 0) {
          var item = items[0];
          var params = purchaseUrl({
            variant: item.variant || selection.variant,
            color: item.color || selection.color.id,
            colorName: item.colorName || selection.color.name,
            price: String(item.price || selection.price),
            compareAt: String(item.compareAt || selection.compareAt),
            units: String(item.units || selection.units),
            image: item.image || selection.color.image,
            title: item.title || currentItem().title
          });
          window.location.href = params;
        } else {
          goToPurchase();
        }
      });
    }

    var menuBtn = byId("menu-button");
    if (menuBtn) {
      menuBtn.addEventListener("click", function () {
        var menu = byId("header-menu");
        var willOpen = menu.hidden;
        menu.hidden = !willOpen;
        this.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    }

    forEach(qsa("#header-menu a"), function (link) {
      link.addEventListener("click", function (e) {
        var target = document.querySelector(link.getAttribute("href"));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
        var menu = byId("header-menu");
        if (menu) menu.hidden = true;
        var mb = byId("menu-button");
        if (mb) mb.setAttribute("aria-expanded", "false");
      });
    });

    var search = byId("store-search");
    if (search) {
      search.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = byId("store-search-input").value.trim().toLowerCase();
        if (!q || "flexhome arm\u00e1rio armario multifuncional organiza\u00e7\u00e3o organizacao cozinha".indexOf(q) !== -1) {
          var p = byId("produto");
          if (p) p.scrollIntoView({ behavior: "smooth" });
          return;
        }
        showToast('Nenhum resultado para "' + q + '".');
      });
    }

    window.addEventListener("scroll", function () {
      var s = byId("sticky-purchase");
      if (!s) return;
      var v = window.scrollY > 700;
      s.classList.toggle("visible", v);
      s.setAttribute("aria-hidden", v ? "false" : "true");
    }, { passive: true });

    window.addEventListener("coberdrom:cart", renderCart);
    renderCart();

    try {
      var el = byId("cart-items");
      if (el) {
        el.addEventListener("click", function (e) {
          var b = e.target.closest ? e.target.closest("[data-remove-id]") : null;
          if (!b) return;
          window.CoberdromStore.removeItem(b.getAttribute("data-remove-id"));
          renderCart();
        });
      }
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
