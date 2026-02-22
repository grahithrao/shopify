import { products } from "./products.js";

const productGrid = document.getElementById("productGrid");
const filtersContainer = document.getElementById("filters");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsList = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartShipping = document.getElementById("cartShipping");
const cartTotal = document.getElementById("cartTotal");
const checkoutSummary = document.getElementById("checkoutSummary");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryShipping = document.getElementById("summaryShipping");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutForm = document.getElementById("checkoutForm");
const formMessage = document.getElementById("formMessage");
const openCartButton = document.getElementById("openCartButton");
const closeCartButton = document.getElementById("closeCartButton");
const goCheckout = document.getElementById("goCheckout");

const cart = new Map();
const shippingFlatRate = 8;
const freeShippingThreshold = 150;

let activeCategory = "All";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function getProductById(id) {
  return products.find((product) => product.id === id);
}

function getCategories() {
  const categories = new Set(products.map((product) => product.category));
  return ["All", ...categories];
}

function renderFilters() {
  const categories = getCategories();

  filtersContainer.innerHTML = categories
    .map(
      (category) => `
        <button
          class="filter-pill ${category === activeCategory ? "active" : ""}"
          data-category="${category}"
          type="button"
        >
          ${category}
        </button>
      `
    )
    .join("");

  filtersContainer.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

  if (!filteredProducts.length) {
    productGrid.innerHTML = "<p>No products found in this category.</p>";
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card reveal" aria-label="${product.name}">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="product-content">
            <div class="product-meta">
              <h3>${product.name}</h3>
              <span>${formatCurrency(product.price)}</span>
            </div>
            <p>${product.description}</p>
            <div class="product-tags">
              <small>${product.category}</small>
              <button class="btn btn-secondary" type="button" data-add="${product.id}">Add to Cart</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.add);
    });
  });
}

function addToCart(productId) {
  const currentQty = cart.get(productId) || 0;
  cart.set(productId, currentQty + 1);
  renderCart();
}

function updateQuantity(productId, delta) {
  const nextQty = (cart.get(productId) || 0) + delta;

  if (nextQty <= 0) {
    cart.delete(productId);
  } else {
    cart.set(productId, nextQty);
  }

  renderCart();
}

function removeFromCart(productId) {
  cart.delete(productId);
  renderCart();
}

function computeTotals() {
  let subtotal = 0;

  cart.forEach((qty, productId) => {
    const product = getProductById(productId);
    if (product) {
      subtotal += product.price * qty;
    }
  });

  const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}

function renderCheckoutSummary() {
  if (cart.size === 0) {
    checkoutSummary.innerHTML = "<li>Your cart is empty.</li>";
    return;
  }

  checkoutSummary.innerHTML = [...cart.entries()]
    .map(([productId, qty]) => {
      const product = getProductById(productId);
      if (!product) {
        return "";
      }

      const lineTotal = product.price * qty;
      return `<li><span>${product.name} x${qty}</span> <span>${formatCurrency(lineTotal)}</span></li>`;
    })
    .join("");
}

function renderCart() {
  if (cart.size === 0) {
    cartItemsList.innerHTML = "<li class=\"cart-item\">Your cart is empty.</li>";
  } else {
    cartItemsList.innerHTML = [...cart.entries()]
      .map(([productId, qty]) => {
        const product = getProductById(productId);
        if (!product) {
          return "";
        }

        return `
          <li class="cart-item">
            <div class="cart-item-head">
              <h4>${product.name}</h4>
              <strong>${formatCurrency(product.price * qty)}</strong>
            </div>
            <div class="cart-item-controls">
              <div class="quantity">
                <button type="button" class="icon-btn" data-dec="${productId}">-</button>
                <span>${qty}</span>
                <button type="button" class="icon-btn" data-inc="${productId}">+</button>
              </div>
              <button type="button" class="text-btn" data-remove="${productId}">Remove</button>
            </div>
          </li>
        `;
      })
      .join("");
  }

  const { subtotal, shipping, total } = computeTotals();
  const itemCount = [...cart.values()].reduce((sum, qty) => sum + qty, 0);

  cartCount.textContent = String(itemCount);

  cartSubtotal.textContent = formatCurrency(subtotal);
  cartShipping.textContent = shipping === 0 ? "Free" : formatCurrency(shipping);
  cartTotal.textContent = formatCurrency(total);

  summarySubtotal.textContent = formatCurrency(subtotal);
  summaryShipping.textContent = shipping === 0 ? "Free" : formatCurrency(shipping);
  summaryTotal.textContent = formatCurrency(total);

  renderCheckoutSummary();

  cartItemsList.querySelectorAll("[data-inc]").forEach((button) => {
    button.addEventListener("click", () => updateQuantity(button.dataset.inc, 1));
  });

  cartItemsList.querySelectorAll("[data-dec]").forEach((button) => {
    button.addEventListener("click", () => updateQuantity(button.dataset.dec, -1));
  });

  cartItemsList.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(button.dataset.remove));
  });
}

openCartButton.addEventListener("click", () => {
  cartDrawer.classList.add("open");
});

closeCartButton.addEventListener("click", () => {
  cartDrawer.classList.remove("open");
});

goCheckout.addEventListener("click", () => {
  cartDrawer.classList.remove("open");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    formMessage.textContent = "Add at least one product before placing your order.";
    return;
  }

  const customerName = checkoutForm.elements.name.value.trim();
  formMessage.textContent = `Thank you, ${customerName}. Your order request has been received.`;

  cart.clear();
  renderCart();
  checkoutForm.reset();
});

renderFilters();
renderProducts();
renderCart();
