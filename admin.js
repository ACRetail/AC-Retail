const form = document.getElementById("productForm");
const list = document.getElementById("adminProducts");
const ordersList = document.getElementById("adminOrders");

let products = JSON.parse(localStorage.getItem("products")) || [];

function showProducts() {
  list.innerHTML = "";

  products.forEach((p, index) => {
    list.innerHTML += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <p><b>₹${p.price}</b></p>

        <button onclick="deleteProduct(${index})" class="btn">
          Delete
        </button>
      </div>
    `;
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  products.push({
    name: name.value,
    category: category.value,
    price: price.value
  });

  localStorage.setItem("products", JSON.stringify(products));

  form.reset();
  showProducts();
});


function deleteProduct(index) {
  products.splice(index, 1);

  localStorage.setItem(
    "products",
    JSON.stringify(products)
  );

  showProducts();
}


/* =========================
   CUSTOMER ORDERS
========================= */

function showOrders() {

  if (!ordersList) return;

  let orders =
    JSON.parse(localStorage.getItem("acOrders")) || [];

  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-orders">
        <h3>📭 No Orders Yet</h3>
        <p>Customer orders will appear here.</p>
      </div>
    `;
    return;
  }

  orders.slice().reverse().forEach((order, index) => {

    let itemsHTML = "";

    (order.items || []).forEach(item => {

      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);

      itemsHTML += `
        <li>
          ${item.name}
          × ${qty}
          — ₹${price * qty}
        </li>
      `;
    });

    ordersList.innerHTML += `
      <div class="order-card">

        <h3>🛒 Order ${order.orderId}</h3>

        <p>
          <b>👤 Customer:</b>
          ${order.customerName || ""}
        </p>

        <p>
          <b>📱 Mobile:</b>
          ${order.customerMobile || ""}
        </p>

        <p>
          <b>📍 Address:</b>
          ${order.customerAddress || ""}
        </p>

        ${
          order.customerNote
            ? `<p><b>📝 Note:</b> ${order.customerNote}</p>`
            : ""
        }

        <p>
          <b>📅 Date:</b>
          ${order.date || ""}
        </p>

        <hr>

        <h4>🛍️ Items</h4>

        <ul>
          ${itemsHTML}
        </ul>

        <h3>
          💰 Total: ₹${order.total || 0}
        </h3>

        <p class="order-status">
          <b>Status:</b>
          ${order.status || "Order Placed"}
        </p>

        <div class="order-buttons">

          <button
            class="btn"
            onclick="updateOrderStatus('${order.orderId}', 'Confirmed')">
            ✅ Confirm
          </button>

          <button
            class="btn"
            onclick="updateOrderStatus('${order.orderId}', 'Delivered')">
            🚚 Delivered
          </button>

          <button
            class="btn"
            onclick="updateOrderStatus('${order.orderId}', 'Cancelled')">
            ❌ Cancel
          </button>

        </div>

      </div>
    `;
  });
}


/* =========================
   UPDATE ORDER STATUS
========================= */

function updateOrderStatus(orderId, newStatus) {

  let orders =
    JSON.parse(localStorage.getItem("acOrders")) || [];

  orders = orders.map(order => {

    if (order.orderId === orderId) {
      order.status = newStatus;
    }

    return order;
  });

  localStorage.setItem(
    "acOrders",
    JSON.stringify(orders)
  );

  showOrders();
}


/* FIRST LOAD */

showProducts();
showOrders();
