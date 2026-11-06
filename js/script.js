// Be Surprised: catálogo, filtros, carrito y encargos por WhatsApp.
// IMPORTANTE: reemplaza el número de ejemplo por el WhatsApp comercial real.
// Formato internacional, solo números. Colombia: 57 + número, sin + ni espacios.
const WHATSAPP_NUMBER = "57XXXXXXXXXX";

const products = {
  mini:    { name: "Mini Misterio", price: 500 },
  clasica: { name: "Bolsita Clásica", price: 1000 },
  retro:   { name: "Retro Mix", price: 2000 },
  tesoro:  { name: "Tesoro Especial", price: 3000 },
  premium: { name: "Misterio Premium", price: 5000 },
  gran:    { name: "Gran Sorpresa", price: 10000 }
};

const cart = {};
const money = value => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0
}).format(value);

const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

document.getElementById("year").textContent = new Date().getFullYear();

function addToCart(id) {
  if (!products[id]) return;
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  openCart();
}
function changeQuantity(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}
function removeFromCart(id) {
  delete cart[id];
  renderCart();
}
function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const total = entries.reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  cartCount.textContent = count;
  cartTotal.textContent = money(total);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío... ¡llénalo de misterio!</p>';
    return;
  }
  cartItems.innerHTML = entries.map(([id, qty]) => {
    const item = products[id];
    return `<article class="cart-line">
      <div>
        <h3>${item.name}</h3>
        <p>${money(item.price)} por unidad</p>
        <div class="quantity-controls">
          <button type="button" data-action="minus" data-id="${id}" aria-label="Restar una unidad">−</button>
          <strong>${qty}</strong>
          <button type="button" data-action="plus" data-id="${id}" aria-label="Agregar una unidad">+</button>
        </div>
        <button class="remove-item" type="button" data-action="remove" data-id="${id}">Quitar</button>
      </div>
      <strong>${money(item.price * qty)}</strong>
    </article>`;
  }).join("");
}
function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  cartBackdrop.hidden = false;
  document.body.classList.add("cart-open");
}
function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartBackdrop.hidden = true;
  document.body.classList.remove("cart-open");
}
function openWhatsApp(message) {
  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    alert("Antes de recibir pedidos, configura el número de WhatsApp en js/script.js (variable WHATSAPP_NUMBER).");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => addToCart(button.dataset.id));
});
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  if (action === "plus") changeQuantity(id, 1);
  if (action === "minus") changeQuantity(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  const entries = Object.entries(cart);
  if (!entries.length) {
    alert("Tu carrito está vacío. Agrega al menos una bolsita sorpresa.");
    return;
  }
  const lines = entries.map(([id, qty]) =>
    `• ${products[id].name} x${qty} — ${money(products[id].price * qty)}`
  );
  const total = entries.reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  const message = `¡Hola, Be Surprised! Quiero consultar disponibilidad para este pedido:\n\n${lines.join("\n")}\n\nTotal estimado: ${money(total)}\n\n¿Me confirman disponibilidad, costo de envío y medios de pago?`;
  openWhatsApp(message);
});

const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");
const searchInput = document.getElementById("productSearch");
let activeFilter = "all";

function filterProducts() {
  const term = searchInput.value.trim().toLocaleLowerCase("es");
  productCards.forEach(card => {
    const price = Number(card.dataset.price);
    const name = card.dataset.name.toLocaleLowerCase("es");
    const matchesSearch = !term || name.includes(term) || card.innerText.toLocaleLowerCase("es").includes(term);
    let matchesPrice = true;
    if (activeFilter === "500") matchesPrice = price <= 1000;
    if (activeFilter === "2000") matchesPrice = price > 1000 && price <= 3000;
    if (activeFilter === "4000") matchesPrice = price > 3000;
    card.hidden = !(matchesSearch && matchesPrice);
  });
}
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    filterProducts();
  });
});
searchInput.addEventListener("input", filterProducts);

document.getElementById("wholesaleForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  const type = form.get("type");
  const quantity = form.get("quantity");
  const budget = form.get("budget");
  const details = form.get("details").trim() || "Sin detalles adicionales por ahora.";
  const message = `¡Hola, Be Surprised! Quisiera cotizar un pedido al por mayor.\n\nNombre o negocio: ${name}\nTipo de pedido: ${type}\nCantidad aproximada: ${quantity} bolsitas\nPresupuesto por bolsita: ${budget}\nDetalles: ${details}\n\n¿Me pueden compartir precios, disponibilidad y opciones de entrega?`;
  openWhatsApp(message);
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  menuToggle.textContent = isOpen ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    menuToggle.textContent = "☰";
  });
});

renderCart();
