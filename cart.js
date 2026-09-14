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
    return "₹" + Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function escapeHTML(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getTotal(cart) {
    return cart.reduce(function (total, item) {
      return total +
        Number(item.price || 0) *
        Number(item.qty || 1);
    }, 0);
  }

  function getTotalSavings(cart) {
    return cart.reduce(function (saving, item) {

      const mrp =
        Number(item.mrp || item.price || 0);

      const price =
        Number(item.price || 0);

      const qty =
        Number(item.qty || 1);

      return saving +
        Math.max(0, (mrp - price) * qty);

    }, 0);
  }

  function getItemCount(cart) {
    return cart.reduce(function (total, item) {
      return total + Number(item.qty || 1);
    }, 0);
  }

  function updateSavingsDisplay(totalSavings) {

    let savingsBox =
      document.getElementById("cartSavings");

    if (!savingsBox) {

      const summaryTotal =
        document.querySelector(".summary-total");

      if (!summaryTotal) return;

      savingsBox =
        document.createElement("div");

      savingsBox.id = "cartSavings";

      savingsBox.style.marginBottom = "15px";
      savingsBox.style.padding = "10px";
      savingsBox.style.borderRadius = "8px";
      savingsBox.style.background = "#e8f7ed";
      savingsBox.style.color = "#08752d";
      savingsBox.style.fontWeight = "700";
      savingsBox.style.textAlign = "center";

      summaryTotal.parentNode.insertBefore(
        savingsBox,
        summaryTotal
      );
    }

    if (totalSavings > 0) {

      savingsBox.textContent =
        "🎉 You Save " +
        formatPrice(totalSavings);

      savingsBox.style.display = "block";

    } else {

      savingsBox.textContent = "";
      savingsBox.style.display = "none";
    }
  }

  function renderCart() {

    const cart = getCart();

    const total = getTotal(cart);

    const totalSavings =
      getTotalSavings(cart);

    const itemCount =
      getItemCount(cart);

    itemCountBox.textContent =
      itemCount +
      (itemCount === 1 ? " item" : " items");

    summaryItemsBox.textContent =
      itemCount;

    cartTotalBox.textContent =
      formatPrice(total);

    updateSavingsDisplay(totalSavings);

    if (cart.length === 0) {

      cartItemsBox.innerHTML = `

        <div class="empty-cart">

          <div class="empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p>
            Add some grocery products to your
            cart and order on WhatsApp.
          </p>

          <a
            href="products.html"
            class="shop-btn">
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

    cartItemsBox.innerHTML =
      cart.map(function (item, index) {

        const qty =
          Number(item.qty || 1);

        const price =
          Number(item.price || 0);

        const mrp =
          Number(item.mrp || price);

        const itemTotal =
          price * qty;

        const itemSaving =
          Math.max(
            0,
            (mrp - price) * qty
          );

        let imageHTML = "";

        if (
          item.image &&
          !String(item.image)
            .toLowerCase()
            .endsWith("default.png")
        ) {

          imageHTML = `

            <img
              src="${escapeHTML(item.image)}"
              class="product-image"
              alt="${escapeHTML(item.name)}"
              onerror="
                this.outerHTML=
                '<div class=&quot;no-image&quot;>
                🖼️<br>No Image</div>'
              "
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
                  <span>
                    ${formatPrice(mrp)}
                  </span>

                </div>

                <div class="cart-online-price">

                  Online Price:

                  <strong>
                    ${formatPrice(price)}
                  </strong>

                </div>

                ${
                  itemSaving > 0
                    ? `
                      <div class="cart-saving">
                        You Save
                        ${formatPrice(itemSaving)}
                      </div>
                    `
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

  cartItemsBox.addEventListener(
    "click",
    function (event) {

      const plusButton =
        event.target.closest(".qty-plus");

      if (!plusButton) return;

      const index =
        Number(plusButton.dataset.index);

      const cart = getCart();

      if (!cart[index]) return;

      cart[index].qty =
        Number(cart[index].qty || 1) + 1;

      saveCart(cart);

      renderCart();
    }
  );

  cartItemsBox.addEventListener(
    "click",
    function (event) {

      const minusButton =
        event.target.closest(".qty-minus");

      if (!minusButton) return;

      const index =
        Number(minusButton.dataset.index);

      const cart = getCart();

      if (!cart[index]) return;

      cart[index].qty =
        Number(cart[index].qty || 1) - 1;

      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }

      saveCart(cart);

      renderCart();
    }
  );

  cartItemsBox.addEventListener(
    "click",
    function (event) {

      const removeButton =
        event.target.closest(".remove-btn");

      if (!removeButton) return;

      const index =
        Number(removeButton.dataset.index);

      const cart = getCart();

      if (!cart[index]) return;

      cart.splice(index, 1);

      saveCart(cart);

      renderCart();
    }
  );

  clearButton.addEventListener(
    "click",
    function () {

      const cart = getCart();

      if (!cart.length) return;

      const ok =
        confirm(
          "Are you sure you want to clear your cart?"
        );

      if (!ok) return;

      localStorage.removeItem(CART_KEY);

      renderCart();
    }
  );
const checkoutForm =
document.getElementById("checkoutForm");

const paymentSection =
document.getElementById("paymentSection");

const paymentAmount =
document.getElementById("paymentAmount");

const payNowBtn =
document.getElementById("payNowBtn");

const paymentDoneBtn =
document.getElementById("paymentDoneBtn");


/* ================================
   OPEN CHECKOUT
================================ */

whatsappButton.addEventListener(
  "click",
  function () {

    const cart = getCart();

    if (!cart.length) return;

    checkoutForm.style.display = "block";

    if (paymentSection) {
      paymentSection.style.display = "block";
    }

    const total = getTotal(cart);

    if (paymentAmount) {
      paymentAmount.textContent = formatPrice(total);
    }

    checkoutForm.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }
);


/* ================================
   PAY VIA UPI
================================ */

if (payNowBtn) {

  payNowBtn.addEventListener(
    "click",
    function () {

      const cart = getCart();

      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }

      const total = getTotal(cart);

      if (total <= 0) {
        alert("Invalid order amount.");
        return;
      }

      const upiId =
        "8087069719@okbizaxis";

      const merchantName =
        "AC Retail";

      const transactionNote =
        "AC Retail Order";

      const upiUrl =
        "upi://pay" +
        "?pa=" + encodeURIComponent(upiId) +
        "&pn=" + encodeURIComponent(merchantName) +
        "&am=" + encodeURIComponent(total.toFixed(2)) +
        "&cu=INR" +
        "&tn=" + encodeURIComponent(transactionNote);

      window.location.href = upiUrl;

      setTimeout(function () {

        if (paymentDoneBtn) {
          paymentDoneBtn.style.display = "block";
        }

      }, 1000);

    }
  );

}


/* ================================
   PAYMENT COMPLETED
================================ */

if (paymentDoneBtn) {

  paymentDoneBtn.addEventListener(
    "click",
    function () {

      const cart = getCart();

      if (!cart.length) {
        alert("Your cart is empty.");
        return;
      }


      /* CUSTOMER DETAILS */

      const name =
        document
        .getElementById("customerName")
        .value
        .trim();

      const mobile =
        document
        .getElementById("customerMobile")
        .value
        .trim();

      const address =
        document
        .getElementById("customerAddress")
        .value
        .trim();

      const note =
        document
        .getElementById("customerNote")
        .value
        .trim();


      /* VALIDATION */

      if (!name) {

        alert("Please enter your name.");

        document
        .getElementById("customerName")
        .focus();

        return;
      }


      if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
          "Please enter a valid 10-digit mobile number."
        );

        document
        .getElementById("customerMobile")
        .focus();

        return;
      }


      if (!address) {

        alert(
          "Please enter your delivery address."
        );

        document
        .getElementById("customerAddress")
        .focus();

        return;
      }


      /* ORDER ID */

      const orderId =
        "AC-" +
        new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "") +
        "-" +
        Math.floor(
          1000 + Math.random() * 9000
        );


      /* TOTAL */

      const grandTotal =
        getTotal(cart);

      const totalSavings =
        getTotalSavings(cart);


      /* WHATSAPP MESSAGE */

      let message =
        "🛒 *AC Retail Order*%0A%0A";


      message +=
        "🆔 *Order ID:* " +
        encodeURIComponent(orderId) +
        "%0A";


      message +=
        "💳 *Payment:* UPI%0A";


      message +=
        "🟢 *Payment Status:* Customer Confirmed%0A%0A";


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


      message +=
        "%0A━━━━━━━━━━━━━━%0A";


      /* ITEMS */

      cart.forEach(
        function (item, index) {

          const qty =
            Number(item.qty || 1);

          const price =
            Number(item.price || 0);

          const mrp =
            Number(item.mrp || price);

          const itemTotal =
            price * qty;

          const itemSaving =
            Math.max(
              0,
              (mrp - price) * qty
            );


          message +=
            `${index + 1}. ` +
            encodeURIComponent(item.name) +
            "%0A";


          message +=
            " Qty: " +
            qty +
            "%0A";


          message +=
            " MRP: " +
            formatPrice(mrp) +
            "%0A";


          message +=
            " Online Price: " +
            formatPrice(price) +
            "%0A";


          if (itemSaving > 0) {

            message +=
              " You Save: " +
              formatPrice(itemSaving) +
              "%0A";

          }


          message +=
            " Total: " +
            formatPrice(itemTotal) +
            "%0A%0A";

        }
      );


      message +=
        "━━━━━━━━━━━━━━%0A";


      if (totalSavings > 0) {

        message +=
          "🏷️ *You Save: " +
          formatPrice(totalSavings) +
          "*%0A";

      }


      message +=
        "💰 *Grand Total: " +
        formatPrice(grandTotal) +
        "*%0A%0A";


      message +=
        "🏪 AC Retail%0A";


      message +=
        "Police Line, Phaltan";


      /* WHATSAPP NUMBER */

      const whatsappNumber =
        "918830300826";


      const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        message;


      /* ORDER DATA */

      const orderData = {

        orderId: orderId,

        customerName: name,

        customerMobile: mobile,

        customerAddress: address,

        customerNote: note,

        status: "Payment Confirmed - Order Placed",

        paymentMethod: "UPI",

        paymentStatus:
          "Customer Confirmed",

        date:
          new Date().toLocaleString("en-IN"),

        items: cart,

        total: grandTotal,

        totalSavings: totalSavings

      };


      /* LOCAL ORDER SAVE */

      let savedOrders =
        JSON.parse(
          localStorage.getItem("acOrders")
        ) || [];


      savedOrders.push(orderData);


      localStorage.setItem(
        "acOrders",
        JSON.stringify(savedOrders)
      );


      /* AWS ORDER SAVE */

      const AWS_ORDER_URL =
        "https://xv2pna2ymcg6n3mobbbk57gvey0zupbf.lambda-url.ap-south-1.on.aws/";


      fetch(AWS_ORDER_URL, {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body:
          JSON.stringify(orderData)

      })

      .then(function (response) {

        if (!response.ok) {

          throw new Error(
            "AWS order save failed"
          );

        }

        return response.json();

      })

      .then(function (result) {

        console.log(
          "AWS Order Saved:",
          result
        );

      })

      .catch(function (error) {

        console.error(
          "AWS Order Error:",
          error
        );

      });


      /* OPEN WHATSAPP */

      window.open(
        url,
        "_blank"
      );

    }
  );

}


renderCart();
  

  
          
      


});
