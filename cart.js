import { db } from "./firebase.js";

import {
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
     SETTINGS
  ========================================================= */

  const CART_KEY = "cart";

  const CASHFREE_LAMBDA_URL =
    "https://stwcn5xmfcn5avdreicnjrpzuq0olglq.lambda-url.ap-south-1.on.aws/";

  const AWS_ORDER_URL =
    "https://xv2pna2ymcg6n3mobbbk57gvey0zupbf.lambda-url.ap-south-1.on.aws/";

  const WHATSAPP_NUMBER =
    "918830300826";

  const PENDING_PAYMENT_KEY =
    "acRetailPendingCashfreePayment";


  /* =========================================================
     ELEMENTS
  ========================================================= */

  const cartItemsBox =
    document.getElementById("cartItems");

  const cartTotalBox =
    document.getElementById("cartTotal");

  const itemCountBox =
    document.getElementById("itemCount");

  const summaryItemsBox =
    document.getElementById("summaryItems");

  const whatsappButton =
    document.getElementById("whatsappOrder");

  const clearButton =
    document.getElementById("clearCart");

  const checkoutForm =
    document.getElementById("checkoutForm");

  const paymentSection =
    document.getElementById("paymentSection");

  const paymentAmount =
    document.getElementById("paymentAmount");

  const payNowBtn =
    document.getElementById("payNowBtn");

  const paymentStatus =
    document.getElementById("paymentStatus");


  /* =========================================================
     CART
  ========================================================= */

  function getCart() {

    try {

      return (
        JSON.parse(
          localStorage.getItem(CART_KEY)
        ) || []
      );

    } catch (error) {

      console.error(
        "Cart read error:",
        error
      );

      return [];

    }

  }


  function saveCart(cart) {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

  }


  /* =========================================================
     PRICE
  ========================================================= */

  function formatPrice(price) {

    return (
      "₹" +
      Number(price || 0).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )
    );

  }


  function getTotal(cart) {

    return cart.reduce(
      function (total, item) {

        return (
          total +
          Number(item.price || 0) *
          Number(item.qty || 1)
        );

      },
      0
    );

  }


  function getTotalSavings(cart) {

    return cart.reduce(
      function (saving, item) {

        const mrp =
          Number(
            item.mrp ||
            item.price ||
            0
          );

        const price =
          Number(item.price || 0);

        const qty =
          Number(item.qty || 1);

        return (
          saving +
          Math.max(
            0,
            (mrp - price) * qty
          )
        );

      },
      0
    );

  }


  function getItemCount(cart) {

    return cart.reduce(
      function (total, item) {

        return (
          total +
          Number(item.qty || 1)
        );

      },
      0
    );

  }


  /* =========================================================
     HTML ESCAPE
  ========================================================= */

  function escapeHTML(text) {

    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =========================================================
     SAVINGS DISPLAY
  ========================================================= */

  function updateSavingsDisplay(
    totalSavings
  ) {

    let savingsBox =
      document.getElementById(
        "cartSavings"
      );

    if (!savingsBox) {

      const summaryTotal =
        document.querySelector(
          ".summary-total"
        );

      if (!summaryTotal) {
        return;
      }

      savingsBox =
        document.createElement(
          "div"
        );

      savingsBox.id =
        "cartSavings";

      savingsBox.style.marginBottom =
        "15px";

      savingsBox.style.padding =
        "10px";

      savingsBox.style.borderRadius =
        "8px";

      savingsBox.style.background =
        "#e8f7ed";

      savingsBox.style.color =
        "#08752d";

      savingsBox.style.fontWeight =
        "700";

      savingsBox.style.textAlign =
        "center";

      summaryTotal.parentNode.insertBefore(
        savingsBox,
        summaryTotal
      );

    }


    if (totalSavings > 0) {

      savingsBox.textContent =
        "🎉 You Save " +
        formatPrice(totalSavings);

      savingsBox.style.display =
        "block";

    } else {

      savingsBox.textContent = "";

      savingsBox.style.display =
        "none";

    }

  }


  /* =========================================================
     RENDER CART
  ========================================================= */

  function renderCart() {

    const cart =
      getCart();

    const total =
      getTotal(cart);

    const totalSavings =
      getTotalSavings(cart);

    const itemCount =
      getItemCount(cart);


    if (itemCountBox) {

      itemCountBox.textContent =
        itemCount +
        (
          itemCount === 1
            ? " item"
            : " items"
        );

    }


    if (summaryItemsBox) {

      summaryItemsBox.textContent =
        itemCount;

    }


    if (cartTotalBox) {

      cartTotalBox.textContent =
        formatPrice(total);

    }


    updateSavingsDisplay(
      totalSavings
    );


    /* EMPTY CART */

    if (cart.length === 0) {

      if (cartItemsBox) {

        cartItemsBox.innerHTML = `

          <div class="empty-cart">

            <div class="empty-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Add some grocery products to your
              cart and order on WhatsApp.
            </p>

            <a
              href="products.html"
              class="shop-btn"
            >
              🛍️ Start Shopping
            </a>

          </div>

        `;

      }


      if (whatsappButton) {

        whatsappButton.disabled =
          true;

        whatsappButton.style.opacity =
          "0.5";

      }


      if (clearButton) {

        clearButton.disabled =
          true;

        clearButton.style.opacity =
          "0.5";

      }


      return;

    }


    if (whatsappButton) {

      whatsappButton.disabled =
        false;

      whatsappButton.style.opacity =
        "1";

    }


    if (clearButton) {

      clearButton.disabled =
        false;

      clearButton.style.opacity =
        "1";

    }


    /* CART ITEMS */

    if (!cartItemsBox) {
      return;
    }


    cartItemsBox.innerHTML =
      cart.map(
        function (item, index) {

          const qty =
            Number(item.qty || 1);

          const price =
            Number(item.price || 0);

          const mrp =
            Number(
              item.mrp || price
            );

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
              .endsWith(
                "default.png"
              )
          ) {

            imageHTML = `

              <img
                src="${escapeHTML(
                  item.image
                )}"
                class="product-image"
                alt="${escapeHTML(
                  item.name
                )}"
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
                  ${escapeHTML(
                    item.name
                  )}
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
                          ${formatPrice(
                            itemSaving
                          )}

                        </div>

                      `
                      : ""
                  }

                </div>


                <div class="quantity-control">

                  <button
                    class="qty-minus"
                    data-index="${index}"
                    type="button"
                  >
                    −
                  </button>


                  <span class="quantity">
                    ${qty}
                  </span>


                  <button
                    class="qty-plus"
                    data-index="${index}"
                    type="button"
                  >
                    +
                  </button>

                </div>

              </div>


              <div class="cart-item-right">

                <div class="item-total">

                  ${formatPrice(
                    itemTotal
                  )}

                </div>


                <button
                  class="remove-btn"
                  data-index="${index}"
                  type="button"
                >
                  🗑️ Remove
                </button>

              </div>

            </div>

          `;

        }
      ).join("");

  }


  /* =========================================================
     PLUS / MINUS / REMOVE
  ========================================================= */

  if (cartItemsBox) {

    cartItemsBox.addEventListener(
      "click",
      function (event) {

        const plusButton =
          event.target.closest(
            ".qty-plus"
          );

        if (plusButton) {

          const index =
            Number(
              plusButton.dataset.index
            );

          const cart =
            getCart();

          if (!cart[index]) {
            return;
          }

          cart[index].qty =
            Number(
              cart[index].qty || 1
            ) + 1;

          saveCart(cart);

          renderCart();

          return;

        }


        const minusButton =
          event.target.closest(
            ".qty-minus"
          );

        if (minusButton) {

          const index =
            Number(
              minusButton.dataset.index
            );

          const cart =
            getCart();

          if (!cart[index]) {
            return;
          }

          cart[index].qty =
            Number(
              cart[index].qty || 1
            ) - 1;


          if (cart[index].qty <= 0) {

            cart.splice(
              index,
              1
            );

          }


          saveCart(cart);

          renderCart();

          return;

        }


        const removeButton =
          event.target.closest(
            ".remove-btn"
          );

        if (removeButton) {

          const index =
            Number(
              removeButton.dataset.index
            );

          const cart =
            getCart();

          if (!cart[index]) {
            return;
          }

          cart.splice(
            index,
            1
          );

          saveCart(cart);

          renderCart();

        }

      }
    );

  }


  /* =========================================================
     CLEAR CART
  ========================================================= */

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      function () {

        const cart =
          getCart();

        if (!cart.length) {
          return;
        }


        const ok =
          confirm(
            "Are you sure you want to clear your cart?"
          );

        if (!ok) {
          return;
        }


        localStorage.removeItem(
          CART_KEY
        );

        localStorage.removeItem(
          PENDING_PAYMENT_KEY
        );

        renderCart();

      }
    );

  }


  /* =========================================================
     OPEN CHECKOUT
  ========================================================= */

  if (whatsappButton) {

    whatsappButton.addEventListener(
      "click",
      function () {

        const cart =
          getCart();

        if (!cart.length) {
          return;
        }


        if (checkoutForm) {

          checkoutForm.style.display =
            "block";

        }


        if (paymentSection) {

          paymentSection.style.display =
            "block";

        }


        const total =
          getTotal(cart);


        if (paymentAmount) {

          paymentAmount.textContent =
            formatPrice(total);

        }


        if (checkoutForm) {

          checkoutForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }

      }
    );

  }


  /* =========================================================
     SAVE PENDING PAYMENT DATA
  ========================================================= */

  function savePendingPaymentData(
    orderId
  ) {

    const nameElement =
      document.getElementById(
        "customerName"
      );

    const mobileElement =
      document.getElementById(
        "customerMobile"
      );

    const addressElement =
      document.getElementById(
        "customerAddress"
      );

    const noteElement =
      document.getElementById(
        "customerNote"
      );


    const data = {

      cashfreeOrderId:
        orderId,

      customerName:
        nameElement
          ? nameElement.value.trim()
          : "",

      customerMobile:
        mobileElement
          ? mobileElement.value.trim()
          : "",

      customerAddress:
        addressElement
          ? addressElement.value.trim()
          : "",

      customerNote:
        noteElement
          ? noteElement.value.trim()
          : "",

      cart:
        getCart(),

      savedAt:
        Date.now()

    };


    localStorage.setItem(
      PENDING_PAYMENT_KEY,
      JSON.stringify(data)
    );

  }


  /* =========================================================
     GET PENDING PAYMENT DATA
  ========================================================= */

  function getPendingPaymentData() {

    try {

      return (
        JSON.parse(
          localStorage.getItem(
            PENDING_PAYMENT_KEY
          )
        ) || null
      );

    } catch (error) {

      console.error(
        "Pending payment data error:",
        error
      );

      return null;

    }

  }


  /* =========================================================
     CLEAR PENDING PAYMENT DATA
  ========================================================= */

  function clearPendingPaymentData() {

    localStorage.removeItem(
      PENDING_PAYMENT_KEY
    );

  }


  /* =========================================================
     CREATE CASHFREE ORDER
  ========================================================= */
async function createCashfreeOrder(amount, name, mobile) {
  try {
    const response = await fetch(CASHFREE_LAMBDA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "create",
        amount: Number(amount.toFixed(2)),
        customerName: name,
        customerPhone: mobile,
        customerEmail: "customer@acretail.in"
      })
    });

    console.log("Cashfree Lambda HTTP Status:", response.status);

    const rawText = await response.text();

    console.log("Cashfree Lambda Raw Response:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Cashfree Response JSON Error:", parseError);

      throw new Error("Invalid payment response from server");
    }

    // If Lambda response is wrapped inside a body string
    if (
      result &&
      typeof result.body === "string"
    ) {
      try {
        result = JSON.parse(result.body);
      } catch (e) {
        console.error(
          "Unable to parse Lambda body:",
          result.body
        );
      }
    }

    console.log(
      "Cashfree Final Result:",
      result
    );

    if (
      !response.ok ||
      !result ||
      result.success !== true
    ) {
      console.error(
        "Cashfree Create Error:",
        result
      );

      throw new Error(
        result?.message ||
        "Unable to create payment"
      );
    }

    if (!result.paymentSessionId) {
      console.error(
        "Payment session missing:",
        result
      );

      throw new Error(
        "Payment session was not received"
      );
    }

    return result;

  } catch (error) {
    console.error(
      "createCashfreeOrder ERROR:",
      error
    );

    throw error;
  }
}
  

  /* =========================================================
     VERIFY CASHFREE PAYMENT
  ========================================================= */

  async function verifyCashfreePayment(
    orderId
  ) {

    const response =
      await fetch(
        CASHFREE_LAMBDA_URL,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              action:
                "verify",

              orderId:
                orderId

            })

        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      console.error(
        "Cashfree Verify Error:",
        result
      );

      throw new Error(
        result.message ||
        "Payment verification failed"
      );

    }


    return result;

  }


  /* =========================================================
     PAY NOW
  ========================================================= */

  if (payNowBtn) {

    payNowBtn.addEventListener(
      "click",
      async function () {

        const cart =
          getCart();


        if (!cart.length) {

          alert(
            "Your cart is empty."
          );

          return;

        }


        /* CUSTOMER DETAILS */

        const nameElement =
          document.getElementById(
            "customerName"
          );

        const mobileElement =
          document.getElementById(
            "customerMobile"
          );

        const addressElement =
          document.getElementById(
            "customerAddress"
          );

        const noteElement =
          document.getElementById(
            "customerNote"
          );


        const name =
          nameElement
            ? nameElement.value.trim()
            : "";

        const mobile =
          mobileElement
            ? mobileElement.value.trim()
            : "";

        const address =
          addressElement
            ? addressElement.value.trim()
            : "";

        const note =
          noteElement
            ? noteElement.value.trim()
            : "";


        /* VALIDATION */

        if (!name) {

          alert(
            "Please enter your name."
          );

          if (nameElement) {
            nameElement.focus();
          }

          return;

        }


        if (
          !/^[0-9]{10}$/.test(
            mobile
          )
        ) {

          alert(
            "Please enter a valid 10-digit mobile number."
          );

          if (mobileElement) {
            mobileElement.focus();
          }

          return;

        }


        if (!address) {

          alert(
            "Please enter your delivery address."
          );

          if (addressElement) {
            addressElement.focus();
          }

          return;

        }


        const grandTotal =
          getTotal(cart);


        if (grandTotal <= 0) {

          alert(
            "Invalid order amount."
          );

          return;

        }


        const originalText =
          payNowBtn.textContent;


        payNowBtn.disabled =
          true;

        payNowBtn.textContent =
          "⏳ Preparing Payment...";


        try {

          /* CREATE CASHFREE ORDER */

          const payment =
            await createCashfreeOrder(
              grandTotal,
              name,
              mobile
            );


          if (
            !payment.paymentSessionId
          ) {

            throw new Error(
              "Payment session was not created."
            );

          }


          /* SAVE CUSTOMER + CART
             BEFORE REDIRECT */

          savePendingPaymentData(
            payment.orderId
          );


          /* CASHFREE SDK CHECK */

          if (
            typeof Cashfree !==
            "function"
          ) {

            throw new Error(
              "Cashfree SDK is not loaded."
            );

          }


          /* SANDBOX */

          const cashfree =
            Cashfree({
              mode: "sandbox"
            });


          payNowBtn.textContent =
            "💳 Opening Payment...";


          /* OPEN CASHFREE */

          await cashfree.checkout({

            paymentSessionId:
              payment.paymentSessionId,

            redirectTarget:
              "_self"

          });


        } catch (error) {

          console.error(
            "Cashfree Payment Error:",
            error
          );


          alert(
            error.message ||
            "Unable to start payment."
          );


          payNowBtn.disabled =
            false;


          payNowBtn.textContent =
            originalText;

        }

      }
    );

  }


  /* =========================================================
     GET RETURNED CASHFREE ORDER ID
  ========================================================= */

  function getReturnedCashfreeOrderId() {

    const params =
      new URLSearchParams(
        window.location.search
      );


    return (
      params.get(
        "cashfree_order_id"
      ) ||
      params.get(
        "order_id"
      )
    );

  }


  /* =========================================================
     PLACE VERIFIED ORDER
  ========================================================= */

  async function placeVerifiedOrder(
    paymentResult
  ) {

    const pending =
      getPendingPaymentData();


    if (!pending) {

      alert(
        "Payment was verified, but order details were not found. Please contact AC Retail."
      );

      return;

    }


    const cart =
      pending.cart ||
      getCart();


    if (!cart.length) {

      alert(
        "Your cart is empty."
      );

      return;

    }


    const name =
      pending.customerName ||
      "";

    const mobile =
      pending.customerMobile ||
      "";

    const address =
      pending.customerAddress ||
      "";

    const note =
      pending.customerNote ||
      "";


    if (
      !name ||
      !mobile ||
      !address
    ) {

      alert(
        "Customer details are missing. Please contact AC Retail."
      );

      return;

    }


    const grandTotal =
      getTotal(cart);

    const totalSavings =
      getTotalSavings(cart);


    /* =====================================================
       AC RETAIL ORDER ID
    ===================================================== */

    const orderId =
      "AC-" +
      new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "") +
      "-" +
      Math.floor(
        1000 +
        Math.random() * 9000
      );


    /* =====================================================
       WHATSAPP MESSAGE
    ===================================================== */

    let message =
      "🛒 *AC Retail Order*%0A%0A";


    message +=
      "🆔 *Order ID:* " +
      encodeURIComponent(
        orderId
      ) +
      "%0A";


    message +=
      "💳 *Payment:* Cashfree UPI%0A";


    message +=
      "🟢 *Payment Status:* Paid & Verified%0A%0A";


    message +=
      "👤 *Customer:* " +
      encodeURIComponent(
        name
      ) +
      "%0A";


    message +=
      "📱 *Mobile:* " +
      encodeURIComponent(
        mobile
      ) +
      "%0A";


    message +=
      "📍 *Address:* " +
      encodeURIComponent(
        address
      ) +
      "%0A";


    if (note) {

      message +=
        "📝 *Note:* " +
        encodeURIComponent(
          note
        ) +
        "%0A";

    }


    message +=
      "%0A━━━━━━━━━━━━━━%0A";


    /* ITEMS */

    cart.forEach(
      function (item, index) {

        const qty =
          Number(
            item.qty || 1
          );

        const price =
          Number(
            item.price || 0
          );

        const mrp =
          Number(
            item.mrp || price
          );

        const itemTotal =
          price * qty;

        const itemSaving =
          Math.max(
            0,
            (mrp - price) * qty
          );


        message +=
          `${index + 1}. ` +
          encodeURIComponent(
            item.name
          ) +
          "%0A";


        message +=
          " Qty: " +
          qty +
          "%0A";


        message +=
          " MRP: " +
          formatPrice(
            mrp
          ) +
          "%0A";


        message +=
          " Online Price: " +
          formatPrice(
            price
          ) +
          "%0A";


        if (itemSaving > 0) {

          message +=
            " You Save: " +
            formatPrice(
              itemSaving
            ) +
            "%0A";

        }


        message +=
          " Total: " +
          formatPrice(
            itemTotal
          ) +
          "%0A%0A";

      }
    );


    message +=
      "━━━━━━━━━━━━━━%0A";


    if (totalSavings > 0) {

      message +=
        "🏷️ *You Save: " +
        formatPrice(
          totalSavings
        ) +
        "*%0A";

    }


    message +=
      "💰 *Grand Total: " +
      formatPrice(
        grandTotal
      ) +
      "*%0A%0A";


    message +=
      "🏪 AC Retail%0A";

    message +=
      "Police Line, Phaltan";


    /* =====================================================
       WHATSAPP URL
    ===================================================== */

    const url =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      message;


    /* =====================================================
       ORDER DATA
    ===================================================== */

    const orderData = {

      orderId:
        orderId,

      cashfreeOrderId:
        paymentResult.orderId ||
        pending.cashfreeOrderId ||
        null,

      paymentId:
        paymentResult.paymentId ||
        null,

      customerName:
        name,

      customerMobile:
        mobile,

      customerAddress:
        address,

      customerNote:
        note,

      status:
        "Payment Confirmed - Order Placed",

      paymentMethod:
        "Cashfree UPI",

      paymentStatus:
        "Paid & Verified",

      date:
        new Date()
          .toLocaleString(
            "en-IN"
          ),

      items:
        cart,

      total:
        grandTotal,

      totalSavings:
        totalSavings

    };


    /* =====================================================
       PREVENT DUPLICATE ORDER
    ===================================================== */

    const processedKey =
      "acRetailProcessed_" +
      (
        paymentResult.orderId ||
        pending.cashfreeOrderId ||
        ""
      );


    if (
      localStorage.getItem(
        processedKey
      ) === "yes"
    ) {

      console.log(
        "Order already processed."
      );

      clearPendingPaymentData();

      return;

    }


    localStorage.setItem(
      processedKey,
      "yes"
    );


    /* =====================================================
       LOCAL STORAGE ORDER
    ===================================================== */

    try {

      let savedOrders =
        JSON.parse(
          localStorage.getItem(
            "acOrders"
          )
        ) || [];


      savedOrders.push(
        orderData
      );


      localStorage.setItem(
        "acOrders",
        JSON.stringify(
          savedOrders
        )
      );

    } catch (error) {

      console.error(
        "Local order save error:",
        error
      );

    }


    /* =====================================================
       FIREBASE ORDER SAVE
    ===================================================== */

    try {

      const ordersRef =
        ref(
          db,
          "orders"
        );


      const newOrderRef =
        push(
          ordersRef
        );


      await set(
        newOrderRef,
        orderData
      );


      console.log(
        "Firebase Order Saved:",
        newOrderRef.key
      );

    } catch (error) {

      console.error(
        "Firebase Order Error:",
        error
      );

    }


    /* =====================================================
       AWS ORDER SAVE
    ===================================================== */

    try {

      const response =
        await fetch(
          AWS_ORDER_URL,
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                orderData
              )

          }
        );


      if (!response.ok) {

        throw new Error(
          "AWS order save failed"
        );

      }


      const result =
        await response.json();


      console.log(
        "AWS Order Saved:",
        result
      );

    } catch (error) {

      console.error(
        "AWS Order Error:",
        error
      );

    }


    /* =====================================================
       CLEAR CART
    ===================================================== */

    localStorage.removeItem(
      CART_KEY
    );


    clearPendingPaymentData();


    renderCart();


    /* =====================================================
       REMOVE CASHFREE QUERY PARAMETER
    ===================================================== */

    try {

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

    } catch (error) {

      console.log(
        "URL cleanup skipped:",
        error
      );

    }


    /* =====================================================
       SUCCESS MESSAGE
    ===================================================== */

    alert(
      "✅ Payment successful!\n\n" +
      "Order ID: " +
      orderId +
      "\n\n" +
      "Your order has been placed successfully."
    );


    /* =====================================================
       OPEN WHATSAPP
    ===================================================== */

    window.open(
      url,
      "_blank"
    );

  }


  /* =========================================================
     CASHFREE RETURN / PAYMENT CHECK
  ========================================================= */

  async function checkCashfreeReturn() {

    const returnedOrderId =
      getReturnedCashfreeOrderId();


    if (!returnedOrderId) {

      return;

    }


    console.log(
      "Cashfree returned order:",
      returnedOrderId
    );


    /* SHOW PAYMENT SECTION */

    if (paymentSection) {

      paymentSection.style.display =
        "block";

    }


    if (paymentStatus) {

      paymentStatus.style.display =
        "block";

      paymentStatus.textContent =
        "⏳ Verifying payment...";

    }


    if (paymentAmount) {

      const pending =
        getPendingPaymentData();

      if (pending) {

        paymentAmount.textContent =
          formatPrice(
            getTotal(
              pending.cart || []
            )
          );

      }

    }


    try {

      const result =
        await verifyCashfreePayment(
          returnedOrderId
        );


      console.log(
        "Cashfree verification:",
        result
      );


      if (
        result.paid === true &&
        result.paymentStatus ===
          "SUCCESS"
      ) {

        if (paymentStatus) {

          paymentStatus.textContent =
            "✅ Payment successful. Placing your order...";

        }


        await placeVerifiedOrder(
          result
        );


      } else {

        if (paymentStatus) {

          paymentStatus.textContent =
            "❌ Payment was not successful yet.";

        }


        alert(
          "Payment is not confirmed yet. Please try again."
        );

      }


    } catch (error) {

      console.error(
        "Payment Verification Error:",
        error
      );


      if (paymentStatus) {

        paymentStatus.textContent =
          "⚠️ Payment verification failed.";

      }


      alert(
        "Payment verification failed. Please contact AC Retail."
      );

    }

  }


  /* =========================================================
     INITIAL RENDER
  ========================================================= */

  renderCart();


  /* =========================================================
     CHECK CASHFREE RETURN
  ========================================================= */

  checkCashfreeReturn();

});
