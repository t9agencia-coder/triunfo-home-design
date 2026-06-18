(function () {
  "use strict";

  var galleryImages = [
    { name: "Armários FlexHome grafite e branco", image: "/images/dYdvdqs6VrAy.png" },
    { name: "Armário FlexHome grafite", image: "/images/product-2.png" },
    { name: "Prateleiras retráteis do armário FlexHome", image: "/images/product-4.png" },
    { name: "Pés ajustáveis do armário FlexHome", image: "/images/product-5.png" },
    { name: "Medidas do armário FlexHome", image: "/images/product-6.png" },
    { name: "Armários FlexHome em dois acabamentos", image: "/images/product-1.png" }
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

  var mainImage = document.getElementById("main-product-image");
  var thumbnails = document.getElementById("thumbnails");
  var currentPrice = document.getElementById("current-price");
  var cartLayer = document.getElementById("cart-layer");
  var cartItems = document.getElementById("cart-items");
  var cartFooter = document.getElementById("cart-footer");
  var toast = document.getElementById("toast");

  function setImage(index) {
    selection.imageIndex = index;
    mainImage.src = galleryImages[index].image;
    mainImage.alt = galleryImages[index].name;

    document.querySelectorAll("[data-image-index]").forEach(function (button) {
      button.classList.toggle("active", Number(button.dataset.imageIndex) === index);
    });
  }

  function buildGalleryControls() {
    galleryImages.forEach(function (image, index) {
      var thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "thumbnail" + (index === 0 ? " active" : "");
      thumb.dataset.imageIndex = String(index);
      thumb.setAttribute("aria-label", image.name);
      thumb.innerHTML = '<img src="' + image.image + '" alt="' + image.name + '">';
      thumb.addEventListener("click", function () { setImage(index); });
      thumbnails.appendChild(thumb);
    });
  }

  function buildReviewsPagination() {
    var reviewsColumn = document.querySelector(".reviews-column");
    var pagination = document.getElementById("reviews-pagination");
    if (!reviewsColumn || !pagination) return;

    var reviews = Array.prototype.slice.call(reviewsColumn.querySelectorAll(".review-card"));
    var reviewsPerPage = 4;
    var totalPages = Math.ceil(reviews.length / reviewsPerPage);
    var currentPage = 1;

    if (totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    function arrowIcon(direction) {
      var path = direction === "previous" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="' + path + '"></polyline></svg>';
    }

    function pageButton(label, page, options) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "reviews-page-button" + (options.active ? " active" : "");
      button.innerHTML = options.icon || label;
      button.disabled = options.disabled;
      button.setAttribute("aria-label", options.ariaLabel || "Página " + label);
      if (options.active) button.setAttribute("aria-current", "page");
      button.addEventListener("click", function () {
        showPage(page, true);
      });
      return button;
    }

    function renderPagination() {
      pagination.innerHTML = "";
      pagination.appendChild(pageButton("Anterior", currentPage - 1, {
        disabled: currentPage === 1,
        icon: arrowIcon("previous"),
        ariaLabel: "Página anterior"
      }));

      for (var page = 1; page <= totalPages; page += 1) {
        pagination.appendChild(pageButton(String(page), page, {
          active: page === currentPage,
          disabled: false
        }));
      }

      pagination.appendChild(pageButton("Próxima", currentPage + 1, {
        disabled: currentPage === totalPages,
        icon: arrowIcon("next"),
        ariaLabel: "Próxima página"
      }));
    }

    function showPage(page, shouldScroll) {
      currentPage = Math.max(1, Math.min(page, totalPages));
      var start = (currentPage - 1) * reviewsPerPage;
      var end = start + reviewsPerPage;

      reviews.forEach(function (review, index) {
        review.hidden = index < start || index >= end;
      });

      renderPagination();

      if (shouldScroll) {
        document.getElementById("reviews-title").scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }

    showPage(1, false);
  }

  function checkoutUrl(item) {
    return variantUrls[item.variant] || "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326933997479&store=33269";
  }

  var variantUrls = {
    "2 Pretos":          "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326975727724&store=33269",
    "2 Brancos":         "https://seguro.triunfohomedesign.com/api/public/shopify?product=3326971813372&store=33269",
    "1 Preto e 1 Branco":"https://seguro.triunfohomedesign.com/api/public/shopify?product=3326933997479&store=33269"
  };

  function purchaseUrl(item) {
    return variantUrls[item.variant] || variantUrls["2 Pretos"];
  }

  function goToPurchase() {
    window.location.href = purchaseUrl(currentItem());
  }

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
      title: "FlexHome - Armário Multifuncional [PAGUE 1 LEVE 2]"
    };
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove("visible");
    }, 2600);
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
    var total = items.reduce(function (sum, item) { return sum + Number(item.price); }, 0);

    document.getElementById("cart-count").textContent = "(" + items.length + ")";
    document.getElementById("header-cart-count").textContent = String(items.length);
    document.getElementById("cart-total").textContent = window.CoberdromStore.money(total);
    cartItems.innerHTML = "";
    cartFooter.hidden = items.length === 0;

    if (!items.length) {
      cartItems.innerHTML = '<div class="empty-cart"><strong>Seu carrinho está vazio.</strong><p>Escolha uma cor, um tamanho e adicione o produto.</p></div>';
      return;
    }

    items.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "cart-item";
      article.innerHTML =
        '<img src="' + item.image + '" alt="' + item.title + '">' +
        '<div><strong>' + item.title + '</strong>' +
        '<span>Cor: ' + item.colorName + ' · Tam: ' + item.size + '</span>' +
        '<span>Quantidade: ' + item.units + '</span>' +
        '<b>' + window.CoberdromStore.money(item.price) + '</b></div>' +
        '<button type="button" aria-label="Remover item" data-remove-id="' + item.id + '">×</button>';
      cartItems.appendChild(article);
    });
  }

  buildGalleryControls();
  buildReviewsPagination();
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  document.getElementById("offer-color-selector").hidden = false;
  document.getElementById("special-offer-toggle").classList.add("open");
  document.getElementById("special-offer-toggle").setAttribute("aria-expanded", "true");

  document.getElementById("gallery-prev").addEventListener("click", function () {
    setImage(selection.imageIndex === 0 ? galleryImages.length - 1 : selection.imageIndex - 1);
  });
  document.getElementById("gallery-next").addEventListener("click", function () {
    setImage((selection.imageIndex + 1) % galleryImages.length);
  });

  document.getElementById("special-offer-toggle").addEventListener("click", function () {
    var selector = document.getElementById("offer-color-selector");
    var willOpen = selector.hidden;
    selector.hidden = !willOpen;
    this.classList.toggle("open", willOpen);
    this.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  document.getElementById("variant-select").addEventListener("change", function () {
    selection.variant = this.value;
  });

  document.getElementById("buy-now").addEventListener("click", function () {
    goToPurchase();
  });

  (function setupShippingCalc() {
    var input = document.getElementById("cep-calc");
    var button = document.getElementById("cep-calc-btn");
    var result = document.getElementById("shipping-result");
    if (!input || !button || !result) return;

    function onlyDigits(value) {
      return String(value || "").replace(/\D/g, "");
    }

    function showResult(html, type) {
      result.innerHTML = html;
      result.classList.remove("is-success", "is-error");
      result.classList.add(type === "error" ? "is-error" : "is-success");
      result.hidden = false;
    }

    input.addEventListener("input", function () {
      var raw = onlyDigits(input.value).slice(0, 8);
      input.value = raw.replace(/^(\d{5})(\d)/, "$1-$2");
    });

    async function calculate() {
      var cep = onlyDigits(input.value);
      if (cep.length !== 8) {
        showResult("Digite um CEP válido com 8 dígitos.", "error");
        return;
      }

      button.disabled = true;
      button.textContent = "...";
      var local = "";
      try {
        var response = await fetch("https://viacep.com.br/ws/" + cep + "/json/");
        var data = await response.json();
        if (!data.erro && data.localidade) {
          local = data.localidade + (data.uf ? " - " + data.uf : "");
        }
      } catch (error) {
        local = "";
      } finally {
        button.disabled = false;
        button.textContent = "Calcular";
      }

      var destino = local ? "para <strong>" + local + "</strong>" : "para o seu endereço";
      showResult(
        '<span class="ship-free">✓ FRETE GRÁTIS</span> ' + destino + "<br>" +
          "Entrega estimada em <strong>3 a 10 dias úteis</strong> após a confirmação.",
        "success"
      );
    }

    button.addEventListener("click", calculate);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") calculate();
    });
  })();

  document.getElementById("cart-items").addEventListener("click", function (event) {
    var button = event.target.closest("[data-remove-id]");
    if (!button) return;
    window.CoberdromStore.removeItem(button.dataset.removeId);
    renderCart();
  });
  document.getElementById("close-cart").addEventListener("click", closeCart);
  document.getElementById("cart-backdrop").addEventListener("click", closeCart);
  document.getElementById("header-cart-button").addEventListener("click", openCart);
  document.getElementById("cart-checkout").addEventListener("click", function () {
    window.location.href = purchaseUrl(currentItem());
  });

  document.getElementById("sticky-buy").addEventListener("click", function () {
    goToPurchase();
  });

  document.getElementById("menu-button").addEventListener("click", function () {
    var menu = document.getElementById("header-menu");
    var willOpen = menu.hidden;
    menu.hidden = !willOpen;
    this.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  document.querySelectorAll("#header-menu a").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
      document.getElementById("header-menu").hidden = true;
      document.getElementById("menu-button").setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("store-search").addEventListener("submit", function (event) {
    event.preventDefault();
    var query = document.getElementById("store-search-input").value.trim().toLowerCase();
    if (!query || "flexhome armário armario multifuncional organização organizacao cozinha".includes(query)) {
      document.getElementById("produto").scrollIntoView({ behavior: "smooth" });
      return;
    }
    showToast('Nenhum resultado para "' + query + '".');
  });

  window.addEventListener("scroll", function () {
    var sticky = document.getElementById("sticky-purchase");
    var visible = window.scrollY > 700;
    sticky.classList.toggle("visible", visible);
    sticky.setAttribute("aria-hidden", visible ? "false" : "true");
  }, { passive: true });

  window.addEventListener("coberdrom:cart", renderCart);
  renderCart();
})();
