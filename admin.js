const ordersList = document.getElementById("ordersList");
const searchInput = document.getElementById("orderSearch");

const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const deliveredOrdersEl = document.getElementById("deliveredOrders");

let orders = JSON.parse(localStorage.getItem("acOrders")) || [];

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
