const WHATSAPP_NUMBER = "918830300826";

let allOffers = [];
let visibleCount = 24;
const PAGE_SIZE = 24;

const offersList = document.getElementById("offersList");
const offerCount = document.getElementById("offerCount");
const loadMoreButton = document.getElementById("loadMoreOffers");
const emptyOffers = document.getElementById("emptyOffers");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return "₹" + number.toFixed(2).replace(/\.00$/, "");
}

function getDiscount(mrp, price) {
  if (!mrp || !price || mrp <= price) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

function addToCart(product) {

  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch (error) {
    cart = [];
  }

  const existing = cart.find(
    item => String(item.id) === String(product.id)
  );

  if (existing) {
    existing.qty = Number(existing.qty || 0) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("✅ " + product.name + " cart mein add ho gaya!");
}

function orderOnWhatsApp(product) {

  const message =
`🛒 *AC Retail - Product Order*

Product: ${product.name}
Price: ${formatPrice(product.price)}
MRP: ${formatPrice(product.mrp)}

Please confirm availability and order.`;

  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

function getImageHtml(product) {

  const image = product.image || "";

  if (
    !image ||
    image.endsWith("default.png") ||
    image === "default.png"
  ) {
    return `<div class="no-image">🖼️ No Image</div>`;
  }

  return `
    <img
      src="${escapeHtml(image)}"
      alt="${escapeHtml(product.name)}"
      loading="lazy"
      onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;no-image&quot;>🖼️ No Image</div>';"
    >
  `;
}

function renderOffers() {

  if (!offersList) return;

  const visibleProducts = allOffers.slice(0, visibleCount);

  offersList.innerHTML = visibleProducts.map(product => {

    const mrp = Number(product.mrp);
    const price = Number(product.price);

    const discount = getDiscount(mrp, price);
    const saving = mrp - price;

    return `
      <div class="offer-card">

        <div class="discount-badge">
          ${discount}% OFF
        </div>

        <div class="product-image">
          ${getImageHtml(product)}
        </div>

        <div class="product-info">

          <div class="product-name">
            ${escapeHtml(product.name)}
          </div>

          <div class="category">
            ${escapeHtml(product.category || "General Items")}
          </div>

          <div class="price-row">
            <span class="sale-price">
              ${formatPrice(price)}
            </span>

            <span class="mrp">
              ${formatPrice(mrp)}
            </span>
          </div>

          <div class="saving">
            You Save ${formatPrice(saving)}
          </div>

          <div class="card-buttons">

            <button
              class="cart-btn"
              data-action="cart"
              data-id="${escapeHtml(product.id)}">
              🛒 Add
            </button>

            <button
              class="wa-btn"
              data-action="whatsapp"
              data-id="${escapeHtml(product.id)}">
              📱 WhatsApp
            </button>

          </div>

        </div>

      </div>
    `;

  }).join("");

  offerCount.textContent =
    `${allOffers.length} special offer${allOffers.length === 1 ? "" : "s"} available`;

  if (visibleCount < allOffers.length) {
    loadMoreButton.style.display = "inline-block";
  } else {
    loadMoreButton.style.display = "none";
  }
}

async function loadOffers() {

  try {

    const response = await fetch(
      "products.json?v=5",
      {
        cache: "no-cache"
      }
    );

    if (!response.ok) {
      throw new Error("Products data load failed");
    }

    const products = await response.json();

    allOffers = products
      .filter(product => {

        const mrp = Number(product.mrp);
        const price = Number(product.price);

        // Only valid discounted products
        return (
          Number.isFinite(mrp) &&
          Number.isFinite(price) &&
          mrp > 0 &&
          price > 0 &&
          mrp > price
        );

      })
      .map(product => {

        const mrp = Number(product.mrp);
        const price = Number(product.price);

        return {
          ...product,
          mrp,
          price,
          discount: getDiscount(mrp, price)
        };

      })
      .sort((a, b) => {

        // Highest discount first
        return b.discount - a.discount;

      });

    if (allOffers.length === 0) {

      offerCount.textContent = "0 offers available";

      offersList.innerHTML = "";

      emptyOffers.style.display = "block";

      loadMoreButton.style.display = "none";

      return;
    }

    emptyOffers.style.display = "none";

    renderOffers();

  } catch (error) {

    console.error("Offers Error:", error);

    offerCount.textContent = "Offers load nahi ho paaye.";

    offersList.innerHTML = `
      <div class="empty" style="grid-column:1/-1;">
        <h2>⚠️ Something went wrong</h2>
        <p>Products data load nahi ho raha.</p>
        <p>Thodi der baad page refresh karein.</p>
      </div>
    `;

  }
}

offersList.addEventListener("click", function(event) {

  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const productId = button.dataset.id;

  const product = allOffers.find(
    item => String(item.id) === String(productId)
  );

  if (!product) return;

  if (button.dataset.action === "cart") {
    addToCart(product);
  }

  if (button.dataset.action === "whatsapp") {
    orderOnWhatsApp(product);
  }

});

loadMoreButton.addEventListener("click", function() {

  visibleCount += PAGE_SIZE;

  renderOffers();

});

loadOffers();
