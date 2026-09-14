import { db } from "./firebase.js";
import {
  ref,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const ordersList = document.getElementById("ordersList");
const searchInput = document.getElementById("orderSearch");

const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const deliveredOrdersEl = document.getElementById("deliveredOrders");

let orders = [];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function saveOrders() {
  localStorage.setItem("acOrders", JSON.stringify(orders));
}
/* FIREBASE LIVE ORDERS */

const firebaseOrdersRef = ref(db, "orders");

onValue(firebaseOrdersRef, (snapshot) => {
  const data = snapshot.val() || {};

  orders = Object.entries(data).map(([firebaseKey, order]) => ({
    ...order,
    firebaseKey
  }));

  renderOrders();
});

function updateStats() {
  totalOrdersEl.textContent = orders.length;

  pendingOrdersEl.textContent = orders.filter(order =>
    order.status !== "Delivered" &&
    order.status !== "Cancelled"
  ).length;

  deliveredOrdersEl.textContent = orders.filter(order =>
    order.status === "Delivered"
  ).length;
}

function renderOrders() {
  const search = searchInput.value.toLowerCase().trim();

  const filteredOrders = orders
    .map((order, index) => ({ order, index }))
    .filter(({ order }) => {
      return (
        String(order.orderId || "").toLowerCase().includes(search) ||
        String(order.customerName || "").toLowerCase().includes(search) ||
        String(order.customerMobile || "").toLowerCase().includes(search)
      );
    })
    .sort((a, b) => b.index - a.index);

  ordersList.innerHTML = "";

  if (filteredOrders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-orders">
        <h3>📦 No Orders Found</h3>
        <p>Customer orders will appear here.</p>
      </div>
    `;

    updateStats();
    return;
  }

  filteredOrders.forEach(({ order, index }) => {
    const items = Array.isArray(order.items) ? order.items : [];

    const itemsHtml = items.map(item => {
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      const itemTotal = qty * price;

      return `
        <div class="order-item">
          <span>
            ${escapeHtml(item.name || "Product")}
            × ${qty}
          </span>

          <strong>₹${itemTotal.toFixed(2)}</strong>
        </div>
      `;
    }).join("");

    const status = order.status || "Order Placed";

    ordersList.innerHTML += `
      <div class="order-card">

        <div class="order-top">
          <div class="order-id">
            ${escapeHtml(order.orderId || "No Order ID")}
          </div>

          <div class="status">
            ${escapeHtml(status)}
          </div>
        </div>

        <div class="customer-info">
          <strong>Customer:</strong>
          ${escapeHtml(order.customerName || "-")}
          <br>

          <strong>Mobile:</strong>
          ${escapeHtml(order.customerMobile || "-")}
          <br>

          <strong>Address:</strong>
          ${escapeHtml(order.customerAddress || "-")}
          <br>

          <strong>Date:</strong>
          ${escapeHtml(order.date || "-")}

          ${
            order.customerNote
              ? `<br><strong>Note:</strong> ${escapeHtml(order.customerNote)}`
              : ""
          }
        </div>

        <div class="order-items">
          ${itemsHtml || "<p>No items found.</p>"}
        </div>

        <div class="order-total">
          Total: ₹${Number(order.total || 0).toFixed(2)}
        </div>

        <div class="order-actions">

          <button
            class="confirm-btn"
            data-action="confirm"
            data-index="${index}">
            Confirm
          </button>

          <button
            class="delivered-btn"
            data-action="delivered"
            data-index="${index}">
            Delivered
          </button>

          <button
            class="cancel-btn"
            data-action="cancel"
            data-index="${index}">
            Cancel
          </button>

          <button
            class="delete-btn"
            data-action="delete"
            data-index="${index}">
            Delete
          </button>

        </div>

      </div>
    `;
  });

  updateStats();
}

ordersList.addEventListener("click", function(e) {

  const button = e.target.closest("button");

  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (!orders[index]) return;

  if (action === "confirm") {
    orders[index].status = "Confirmed";
    saveOrders();
    renderOrders();
  }

  if (action === "delivered") {
    orders[index].status = "Delivered";
    saveOrders();
    renderOrders();
  }

  if (action === "cancel") {
    orders[index].status = "Cancelled";
    saveOrders();
    renderOrders();
  }

  if (action === "delete") {

    const ok = confirm(
      `Delete order ${orders[index].orderId || ""}?`
    );

    if (!ok) return;

    orders.splice(index, 1);

    saveOrders();
    renderOrders();
  }

});

searchInput.addEventListener("input", renderOrders);

renderOrders();
/* =========================================================
   WEEKLY PRICE MANAGER
   ========================================================= */

let priceProducts = [];

const priceSearch = document.getElementById("priceSearch");
const priceProductsEl = document.getElementById("priceProducts");
const exportPricesBtn = document.getElementById("exportPrices");

async function loadPriceProducts() {
  try {
    const response = await fetch("products.json?v=" + Date.now(), {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("products.json could not be loaded");
    }

    priceProducts = await response.json();
    renderPriceProducts();

  } catch (error) {
    console.error(error);

    if (priceProductsEl) {
      priceProductsEl.innerHTML = `
        <div style="padding:20px;color:#c00;">
          ❌ Products load nahi ho rahe.
        </div>
      `;
    }
  }
}

function renderPriceProducts() {
  if (!priceProductsEl) return;

  const search = String(priceSearch?.value || "")
    .toLowerCase()
    .trim();

  const filtered = priceProducts.filter(product =>
    String(product.name || "")
      .toLowerCase()
      .includes(search)
  );

  if (filtered.length === 0) {
    priceProductsEl.innerHTML = `
      <div style="padding:20px;text-align:center;color:#777;">
        No products found.
      </div>
    `;
    return;
  }

  priceProductsEl.innerHTML = filtered.map(product => {

    const mrp = Number(product.mrp || product.price || 0);
    const price = Number(product.price || 0);

    return `
      <div
        class="price-manager-card"
        style="
          margin:12px 0;
          padding:15px;
          border:1px solid #ddd;
          border-radius:14px;
          background:#fff;
          box-shadow:0 3px 12px rgba(0,0,0,.06);
        "
      >

        <div style="font-weight:800;font-size:16px;margin-bottom:10px;">
          ${escapeHtml(product.name || "Product")}
        </div>

        <div style="font-size:12px;color:#777;margin-bottom:10px;">
          ID: ${escapeHtml(product.id || "-")}
        </div>

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
          "
        >

          <label>
            <span style="font-size:12px;color:#666;">
              MRP
            </span>

            <input
              type="number"
              step="0.01"
              min="0"
              value="${mrp}"
              data-price-field="mrp"
              data-id="${escapeHtml(product.id)}"
              style="
                width:100%;
                box-sizing:border-box;
                margin-top:4px;
                padding:10px;
                border:1px solid #ccc;
                border-radius:9px;
              "
            >
          </label>

          <label>
            <span style="font-size:12px;color:#666;">
              Online Price
            </span>

            <input
              type="number"
              step="0.01"
              min="0"
              value="${price}"
              data-price-field="price"
              data-id="${escapeHtml(product.id)}"
              style="
                width:100%;
                box-sizing:border-box;
                margin-top:4px;
                padding:10px;
                border:1px solid #ccc;
                border-radius:9px;
              "
            >
          </label>

        </div>

        <div
          style="
            margin-top:10px;
            font-size:13px;
            font-weight:700;
            color:#08752d;
          "
        >
          Saving:
          ₹${Math.max(0, mrp - price).toFixed(2)}
        </div>

      </div>
    `;

  }).join("");
}

function updatePriceValue(id, field, value) {
  const product = priceProducts.find(
    item => String(item.id) === String(id)
  );

  if (!product) return;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return;
  }

  product[field] = numberValue;

  renderPriceProducts();
}

if (priceProductsEl) {
  priceProductsEl.addEventListener("change", function (event) {

    const input = event.target.closest("[data-price-field]");

    if (!input) return;

    updatePriceValue(
      input.dataset.id,
      input.dataset.priceField,
      input.value
    );

  });
}

if (priceSearch) {
  priceSearch.addEventListener("input", renderPriceProducts);
}

if (exportPricesBtn) {
  exportPricesBtn.addEventListener("click", function () {

    const json = JSON.stringify(priceProducts, null, 2);

    const blob = new Blob(
      [json],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "products.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    alert(
      "✅ Updated products.json download ho gaya.\n\n" +
      "Ab is file ko GitHub ke products.json se replace karein."
    );

  });
}

loadPriceProducts();
