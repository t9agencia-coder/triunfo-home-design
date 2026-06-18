(function () {
  "use strict";

  var STORAGE_KEY = "@coberdrom/cart";

  function parseCart(value) {
    try {
      var parsed = JSON.parse(value || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function getCart() {
    return parseCart(localStorage.getItem(STORAGE_KEY));
  }

  function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("coberdrom:cart", { detail: items }));
  }

  function addItem(item) {
    var items = getCart();
    var existing = items.some(function (current) {
      return current.id === item.id;
    });
    if (!existing) {
      items.push(item);
      saveCart(items);
    }
    return items;
  }

  function removeItem(id) {
    var items = getCart().filter(function (item) {
      return item.id !== id;
    });
    saveCart(items);
    return items;
  }

  function clearCart() {
    saveCart([]);
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  window.CoberdromStore = {
    getCart: getCart,
    saveCart: saveCart,
    addItem: addItem,
    removeItem: removeItem,
    clearCart: clearCart,
    money: money
  };
})();
