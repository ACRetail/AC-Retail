document.addEventListener("DOMContentLoaded", function () {

  const CART_KEY = "cart";

  const cartItemsBox = document.getElementById("cartItems");
  const cartTotalBox = document.getElementById("cartTotal");
  const itemCountBox = document.getElementById("itemCount");
  const summaryItemsBox = document.getElementById("summaryItems");

  const whatsappButton = document.getElementById("whatsappOrder");
  const clearButton = document.getElementById("clearCart");


  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
      return [];
    }
  }


  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }


  function formatPrice(price) {
    return "₹" + Number(price || 0).toLocaleString("en-IN");
  }


  function escapeHTML(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function getTotal(cart) {
    return cart.reduce(function (total, item) {
      return total + (Number(item.price) * Number(item.qty || 1));
    }, 0);
  }


  function getItemCount(cart) {
    return cart.reduce(function (total, item) {
      return total + Number(item.qty || 1);
    }, 0);
  }


  function renderCart() {

    const cart = getCart();

    const total = getTotal(cart);
    const itemCount = getItemCount(cart);


    itemCountBox.textContent =
      itemCount + (itemCount === 1 ? " item" : " items");

    summaryItemsBox.textContent = itemCount;

    cartTotalBox.textContent = formatPrice(total);


    if (cart.length === 0) {

      cartItemsBox.innerHTML = `
        <div class="empty-cart">

          <div class="empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>
            Add some grocery products to your cart and order on WhatsApp.
          </p>

          <a href="products.html" class="shop-btn">
            🛍️ Start Shopping
          </a>

        </div>
      `;

      whatsappButton.disabled = true;
      whatsappButton.style.opacity = "0.5";
      clearButton.disabled = true;
      clearButton.style.opacity = "0.5";

      return;
    }


    whatsappButton.disabled = false;
    whatsappButton.style.opacity = "1";

    clearButton.disabled = false;
    clearButton.style.opacity = "1";


    cartItemsBox.innerHTML = cart.map(function (item, index) {

      const qty = Number(item.qty || 1);
const price = Number(item.price || 0);
const mrp = Number(item.mrp || price);
const itemTotal = price * qty;
const itemSaving = Math.max(0, (mrp - price) * qty);

      let imageHTML = "";

      if (
        item.image &&
        !item.image.endsWith("default.png")
      ) {

        imageHTML = `
          <img
            src="${escapeHTML(item.image)}"
            class="product-image"
            alt="${escapeHTML(item.name)}"
            onerror="this.outerHTML='<div class=&quot;no-image&quot;>🖼️<br>No Image</div>'"
          >
        `;

      } else {

        imageHTML = `
          <div class="no-image">
            🖼️<br>
            No Image
          </div>
        `;

      }


      return `

        <div class="cart-item">

          ${imageHTML}

          <div>

            <div class="product-name">
              ${escapeHTML(item.name)}
            </div>

            <div class="cart-price-box">

  <div class="cart-mrp">
    MRP:
    <span>${formatPrice(mrp)}</span>
  </div>

  <div class="cart-online-price">
    Online Price:
    <strong>${formatPrice(price)}</strong>
  </div>

  ${
    itemSaving > 0
      ? `<div class="cart-saving">
          You Save ${formatPrice(itemSaving)}
        </div>`
      : ""
  }

</div>

            <div class="quantity-control">

              <button
                class="qty-minus"
                data-index="${index}">
                −
              </button>

              <span class="quantity">
                ${qty}
              </span>

              <button
                class="qty-plus"
                data-index="${index}">
                +
              </button>

            </div>

          </div>


          <div class="cart-item-right">

            <div class="item-total">
              ${formatPrice(itemTotal)}
            </div>

            <button
              class="remove-btn"
              data-index="${index}">
              🗑️ Remove
            </button>

          </div>

        </div>

      `;

    }).join("");

  }


  /* PLUS */
  cartItemsBox.addEventListener("click", function (event) {

    const plusButton = event.target.closest(".qty-plus");

    if (!plusButton) return;

    const index = Number(plusButton.dataset.index);

    const cart = getCart();

    if (cart[index]) {

      cart[index].qty =
        Number(cart[index].qty || 1) + 1;

      saveCart(cart);

      renderCart();
    }

  });


  /* MINUS */
  cartItemsBox.addEventListener("click", function (event) {

    const minusButton = event.target.closest(".qty-minus");

    if (!minusButton) return;

    const index = Number(minusButton.dataset.index);

    const cart = getCart();

    if (cart[index]) {

      cart[index].qty =
        Number(cart[index].qty || 1) - 1;


      if (cart[index].qty <= 0) {

        cart.splice(index, 1);

      }

      saveCart(cart);

      renderCart();
    }

  });


  /* REMOVE */
  cartItemsBox.addEventListener("click", function (event) {

    const removeButton =
      event.target.closest(".remove-btn");

    if (!removeButton) return;

    const index =
      Number(removeButton.dataset.index);

    const cart = getCart();

    if (cart[index]) {

      cart.splice(index, 1);

      saveCart(cart);

      renderCart();
    }

  });


  /* CLEAR CART */
  clearButton.addEventListener("click", function () {

    const cart = getCart();

    if (!cart.length) return;

    const confirmClear =
      confirm("Are you sure you want to clear your cart?");

    if (!confirmClear) return;

    localStorage.removeItem(CART_KEY);

    renderCart();

  });


/* CHECKOUT + WHATSAPP ORDER */

const checkoutForm = document.getElementById("checkoutForm");
const confirmWhatsApp = document.getElementById("confirmWhatsApp");

  


whatsappButton.addEventListener("click", function () {

  const cart = getCart();

  if (!cart.length) return;

  checkoutForm.style.display = "block";

  checkoutForm.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

});


confirmWhatsApp.addEventListener("click", function () {

  const cart = getCart();

  if (!cart.length) return;


  const name =
    document.getElementById("customerName").value.trim();

  const mobile =
    document.getElementById("customerMobile").value.trim();

  const address =
    document.getElementById("customerAddress").value.trim();

  const note =
    document.getElementById("customerNote").value.trim();


  if (!name) {
    alert("Please enter your name.");
    return;
  }


  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }


  if (!address) {
    alert("Please enter your delivery address.");
    return;
  }
const orderId =
  "AC-" +
  new Date().toISOString().slice(0, 10).replace(/-/g, "") +
  "-" +
  Math.floor(1000 + Math.random() * 9000);

  let message =
    `🛒 *AC Retail Order*\n\n` +
    `🆔 *Order ID:* ${orderId}\n\n`;

  message +=
    "👤 *Customer:* " +
    encodeURIComponent(name) +
    "%0A";


  message +=
    "📱 *Mobile:* " +
    encodeURIComponent(mobile) +
    "%0A";


  message +=
    "📍 *Address:* " +
    encodeURIComponent(address) +
    "%0A";


  if (note) {
    message +=
      "📝 *Note:* " +
      encodeURIComponent(note) +
      "%0A";
  }


  message += "%0A━━━━━━━━━━━━━━%0A";


  cart.forEach(function (item, index) {

    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);
    const total = price * qty;


    message +=
      `${index + 1}. ` +
      encodeURIComponent(item.name) +
      "%0A" +
      `   Qty: ${qty}%0A` +
      `   Price: ${formatPrice(price)}%0A` +
      `   Total: ${formatPrice(total)}%0A%0A`;

  });


  const grandTotal = getTotal(cart);


  message +=
    "━━━━━━━━━━━━━━%0A" +
    `💰 *Grand Total: ${formatPrice(grandTotal)}*%0A%0A` +
    "🏪 AC Retail%0A" +
    "Police Line, Phaltan";


  const whatsappNumber =
    "918830300826";


  const url =
    `https://wa.me/${whatsappNumber}?text=${message}`;

const orderData = {
  orderId: orderId,
  customerName: name,
  customerMobile: mobile,
  customerAddress: address,
  customerNote: note,
  status: "Order Placed",
  date: new Date().toLocaleString("en-IN"),
  items: cart,
  total: grandTotal
};

let savedOrders =
  JSON.parse(localStorage.getItem("acOrders")) || [];

savedOrders.push(orderData);

localStorage.setItem(
  "acOrders",
  JSON.stringify(savedOrders)
);
  window.open(url, "_blank");

});

  /* FIRST LOAD */
  renderCart();

});
