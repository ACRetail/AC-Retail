const trackBtn = document.getElementById("trackBtn");
const orderIdInput = document.getElementById("orderId");
const trackingResult = document.getElementById("trackingResult");

trackBtn.addEventListener("click", () => {

    const orderId = orderIdInput.value.trim();

    if (!orderId) {
        trackingResult.innerHTML = `
            <p style="color:red;margin-top:20px;">
                Please enter your Order ID.
            </p>
        `;
        return;
    }

    /*
      Temporary free/static tracking.
      Current status will show as Order Received.
      Live merchant status will be connected later.
    */

    trackingResult.innerHTML = `

        <div class="order-info">

            <strong>Order ID:</strong>
            ${escapeHtml(orderId)}

            <br><br>

            <strong>Current Status:</strong>
            Order Received

        </div>

        <div class="status-box">

            <div class="status-step active">
                <span class="status-icon">🛒</span>
                <span>Order Placed</span>
            </div>

            <div class="status-step">
                <span class="status-icon">✅</span>
                <span>Order Confirmed</span>
            </div>

            <div class="status-step">
                <span class="status-icon">📦</span>
                <span>Preparing</span>
            </div>

            <div class="status-step">
                <span class="status-icon">🚚</span>
                <span>Out for Delivery</span>
            </div>

            <div class="status-step">
                <span class="status-icon">🎉</span>
                <span>Delivered</span>
            </div>

        </div>
    `;
});


function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
