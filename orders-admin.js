const ORDERS_KEY = "acOrders";

const ordersContainer = document.getElementById("adminOrders");

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderOrders() {

  if (!ordersContainer) return;

  const orders = getOrders();

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div style="
        padding:25px;
        text-align:center;
        background:#f5faf6;
        border-radius:12px;
        border:1px solid #d8e8dc;
      ">
        <h3>📭 No Orders Yet</h3>
        <p>Customer orders will appear here.</p>
      </div>
    `;
    return;
  }

  ordersContainer.innerHTML = orders
    .slice()
    .reverse()
    .map((order, index) => {

      const realIndex = orders.length - 1 - index;

      const items = Array.isArray(order.items)
        ? order.items
        : [];

      const itemsHtml = items.map(item => `
        <div style="
          padding:8px 0;
          border-bottom:1px solid #eee;
        ">
          <strong>${escapeHtml(item.name)}</strong>
          <br>
          <span>
            Qty: ${Number(item.qty) || 1}
            × ₹${Number(item.price || 0).toFixed(2)}
          </span>
        </div>
      `).join("");

      return `
        <div class="admin-order-card" style="
          background:white;
          border:1px solid #dce8df;
          border-radius:14px;
          padding:18px;
          margin:15px 0;
          box-shadow:0 3px 12px rgba(0,0,0,.06);
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            gap:10px;
            flex-wrap:wrap;
          ">

            <div>
              <h3 style="margin:0;color:#08752d;">
                🆔 ${escapeHtml(order.orderId)}
              </h3>

              <small>
                ${escapeHtml(order.date)}
              </small>
            </div>

            <strong style="
              color:#08752d;
              font-size:18px;
            ">
              ₹${Number(order.total || 0).toFixed(2)}
            </strong>

          </div>

          <hr style="
            border:0;
            border-top:1px solid #eee;
            margin:15px 0;
          ">

          <p>
            <strong>👤 Customer:</strong>
            ${escapeHtml(order.customerName)}
          </p>

          <p>
            <strong>📱 Mobile:</strong>
            ${escapeHtml(order.customerMobile)}
          </p>

          <p>
            <strong>📍 Address:</strong>
            ${escapeHtml(order.customerAddress)}
          </p>

          ${
            order.customerNote
              ? `
                <p>
                  <strong>📝 Note:</strong>
                  ${escapeHtml(order.customerNote)}
                </p>
              `
              : ""
          }

          <div style="
            margin-top:15px;
            padding:12px;
            background:#f7faf8;
            border-radius:10px;
          ">

            <strong>🛒 Items</strong>

            <div style="margin-top:8px;">
              ${itemsHtml}
            </div>

          </div>

          <div style="margin-top:18px;">

            <label style="
              display:block;
              font-weight:bold;
              margin-bottom:7px;
            ">
              📦 Order Status
            </label>

            <select
              class="order-status"
              data-index="${realIndex}"
              style="
                width:100%;
                padding:11px;
                border:1px solid #cbdad0;
                border-radius:8px;
                font-size:15px;
                background:white;
              "
            >

              <option value="Order Placed"
                ${order.status === "Order Placed" ? "selected" : ""}>
                🟡 Order Placed
              </option>

              <option value="Order Confirmed"
                ${order.status === "Order Confirmed" ? "selected" : ""}>
                🔵 Order Confirmed
              </option>

              <option value="Preparing"
                ${order.status === "Preparing" ? "selected" : ""}>
                🟠 Preparing
              </option>

              <option value="Out for Delivery"
                ${order.status === "Out for Delivery" ? "selected" : ""}>
                🚚 Out for Delivery
              </option>

              <option value="Delivered"
                ${order.status === "Delivered" ? "selected" : ""}>
                🟢 Delivered
              </option>

              <option value="Cancelled"
                ${order.status === "Cancelled" ? "selected" : ""}>
                🔴 Cancelled
              </option>

            </select>

          </div>

          <button
            class="delete-order"
            data-index="${realIndex}"
            style="
              width:100%;
              margin-top:12px;
              padding:11px;
              border:0;
              border-radius:8px;
              background:#dc3545;
              color:white;
              font-weight:bold;
              cursor:pointer;
            "
          >
            🗑️ Delete Order
          </button>

        </div>
      `;

    })
    .join("");

  attachOrderEvents();
}


function attachOrderEvents() {

  document.querySelectorAll(".order-status").forEach(select => {

    select.addEventListener("change", function () {

      const index = Number(this.dataset.index);

      const orders = getOrders();

      if (!orders[index]) return;

      orders[index].status = this.value;

      saveOrders(orders);

      alert("✅ Order status updated!");

    });

  });


  document.querySelectorAll(".delete-order").forEach(button => {

    button.addEventListener("click", function () {

      const index = Number(this.dataset.index);

      const orders = getOrders();

      if (!orders[index]) return;

      const confirmDelete = confirm(
        "Are you sure you want to delete this order?"
      );

      if (!confirmDelete) return;

      orders.splice(index, 1);

      saveOrders(orders);

      renderOrders();

    });

  });

}


renderOrders();

window.addEventListener("storage", function () {
  renderOrders();
});
