// AURÉLE — interactive storefront demo
"use strict";

const products = [...document.querySelectorAll(".product-card")];
const bag = [];
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function addToBag(product) {
  const existing = bag.find(item => item.name === product.name);
  if (existing) existing.quantity += 1;
  else bag.push({ ...product, quantity: 1 });
  renderBag();
  showToast(`${product.name} added to your bag ✦`);
}

function productFromCard(card) {
  return {
    name: card.dataset.name,
    price: Number(card.dataset.price),
    image: card.dataset.image
  };
}

function renderBag() {
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("bagCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  document.getElementById("cartSubtotal").textContent = formatPrice(bag.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const cartItems = document.getElementById("cartItems");
  if (!bag.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your bag is waiting for something lovely.</p>';
    return;
  }
  cartItems.innerHTML = bag.map((item, index) => `
    <article class="cart-item">
      <img src="${item.image}" alt="">
      <div><h3>${item.name}</h3><p>${formatPrice(item.price)} · Qty ${item.quantity}</p></div>
      <button class="remove-item" data-remove="${index}" aria-label="Remove ${item.name}">×</button>
    </article>`).join("");
}

products.forEach(card => {
  card.querySelector(".quick-add").addEventListener("click", () => addToBag(productFromCard(card)));
  card.querySelector(".quick-view").addEventListener("click", () => openProductModal(productFromCard(card)));
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    products.forEach(card => card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter));
  });
});

const modal = document.getElementById("productModal");
let modalProduct = null;
function openProductModal(product) {
  modalProduct = product;
  document.getElementById("modalImage").src = product.image;
  document.getElementById("modalImage").alt = product.name;
  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalPrice").textContent = formatPrice(product.price);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("modalClose").focus();
}
function closeProductModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
document.getElementById("modalClose").addEventListener("click", closeProductModal);
modal.addEventListener("click", event => { if (event.target === modal) closeProductModal(); });
document.getElementById("modalAdd").addEventListener("click", () => {
  if (modalProduct) addToBag(modalProduct);
  closeProductModal();
});

const drawer = document.getElementById("cartDrawer");
const scrim = document.getElementById("drawerScrim");
function openCart() { drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
function closeCart() { drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
document.getElementById("bagButton").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);
document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  bag.splice(Number(button.dataset.remove), 1);
  renderBag();
});
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!bag.length) showToast("Your bag is empty — find your forever piece first.");
  else showToast("Demo checkout: connect a payment provider to go live.");
});

document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("emailInput");
  if (!input.checkValidity()) { input.reportValidity(); return; }
  document.getElementById("newsletterMessage").textContent = "You're on the list ✦ Thanks for being here.";
  input.value = "";
  showToast("Thanks for joining the Auréle circle ✦");
});

document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.getElementById("nav");
  const isOpen = nav.classList.toggle("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => {
  document.getElementById("nav").classList.remove("open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}));
document.querySelector(".search-open").addEventListener("click", () => {
  const query = prompt("What are you looking for? (Try: ring, necklace, earrings)");
  if (!query) return;
  const q = query.toLowerCase();
  let found = 0;
  products.forEach(card => {
    const matches = card.dataset.name.toLowerCase().includes(q) || card.dataset.category.includes(q);
    card.classList.toggle("hidden", !matches);
    if (matches) found++;
  });
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  document.querySelector('[data-filter="all"]').classList.add("active");
  document.getElementById("collections").scrollIntoView({ behavior: "smooth" });
  showToast(found ? `${found} piece${found > 1 ? "s" : ""} found ✦` : "No matching pieces. Try another search.");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeProductModal(); closeCart(); }
});
document.getElementById("viewAll").addEventListener("click", event => {
  event.preventDefault();
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  document.querySelector('[data-filter="all"]').classList.add("active');
  products.forEach(card => card.classList.remove("hidden"));
  showToast("You're viewing the full collection ✦");
});

renderBag();
