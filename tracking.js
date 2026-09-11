document.addEventListener("DOMContentLoaded", () => {

  const orderInput = document.getElementById("orderId");
  const trackButton = document.getElementById("trackBtn");
  const resultBox = document.getElementById("trackingResult");

  function getOrders() {
    return JSON.parse(localStorage.getItem("acOrders")) || [];
  }

  function showMessage(message, type = "info") {
    resultBox.innerHTML = `
      <div class="tracking-message ${type}">
        ${message}
      </div>
    `;
  }

  function trackOrder() {
    const enteredId = orderInput.value.trim().toUpperCase();

    if (!enteredId) {
      showMessage("Please enter your Order ID.", "error");
      return;
    }

    const orders = getOrders();

    const order = orders.find(
      item => String(item.orderId).toUpperCase() === enteredId
    );

    if (!order) {
      showMessage(
        "❌ Order not found.<br>Please check your Order ID.",
        "error"
      );
      return;
    }

    const status = order.status || "Order Placed";

    const steps = [
      {
        name: "Order Placed",
        icon: "📝"
      },
      {
        name: "Order Confirmed",
        icon: "✅"
      },
      {
        name: "Preparing Order",
        icon: "📦"
      },
      {
        name: "Out for Delivery",
        icon: "🛵"
      },
      {
        name: "Delivered",
        icon: "🎉"
      }
    ];

    const currentIndex = steps.findIndex(
      step => step.name === status
    );

    const activeIndex = currentIndex >= 0 ? currentIndex : 0;

    let timelineHTML = "";

    steps.forEach((step, index) => {
      let className = "";

      if (index < activeIndex) {
        className = "completed";
      } else if (index === activeIndex) {
        className = "active";
      }

      timelineHTML += `
        <div class="timeline-step ${className}">
          <div class="timeline-icon">
            ${step.icon}
          </div>

          <div class="timeline-text">
            <strong>${step.name}</strong>
            ${
              index === activeIndex
                ? `<span>Current Status</span>`
                : ""
            }
          </div>
        </div>
      `;
    });

    const customerName = order.customerName || "Customer";
    const orderDate = order.date || "";
    const total = Number(order.total || 0);

    resultBox.innerHTML = `
      <div class="order-result">

        <div class="order-header">
          <div>
            <small>Order ID</small>
            <h2>${order.orderId}</h2>
          </div>

          <div class="order-status">
            ${status}
          </div>
        </div>

        <div class="customer-info">
          <p>
            <strong>Customer:</strong>
            ${customerName}
          </p>

          <p>
            <strong>Order Date:</strong>
            ${orderDate}
          </p>
        </div>

        <div class="timeline">
          ${timelineHTML}
        </div>

        <div class="order-items">
          <h3>🛒 Order Items</h3>

          ${
            order.items && order.items.length
              ? order.items.map(item => `
                <div class="tracking-item">
                  <span>
                    ${item.name}
                    × ${item.qty}
                  </span>

                  <strong>
                    ₹${(
                      Number(item.price || 0) *
                      Number(item.qty || 0)
                    ).toFixed(2)}
                  </strong>
                </div>
              `).join("")
              : "<p>No item information available.</p>"
          }

          <div class="tracking-total">
            <span>Total</span>
            <strong>₹${total.toFixed(2)}</strong>
          </div>
        </div>

      </div>
    `;
  }

  trackButton.addEventListener("click", trackOrder);

  orderInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      trackOrder();
    }
  });

});
