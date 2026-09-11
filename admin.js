```javascript
const form = document.getElementById("productForm");
const list = document.getElementById("adminProducts");
const ordersList = document.getElementById("adminOrders");


// =========================
// PRODUCTS
// =========================

let products =
JSON.parse(localStorage.getItem("products")) || [];


function showProducts() {

    list.innerHTML = "";

    products.forEach((p, index) => {

        list.innerHTML += `

        <div class="card">

            <h3>${p.name}</h3>

            <p>${p.category}</p>

            <p>
                <b>₹${p.price}</b>
            </p>

            <button
                onclick="deleteProduct(${index})"
                class="btn"
            >
                Delete
            </button>

        </div>

        `;

    });

}


form.addEventListener("submit", function(e) {

    e.preventDefault();

    products.push({

        name: document.getElementById("name").value,

        category: document.getElementById("category").value,

        price: document.getElementById("price").value

    });


    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


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


// =========================
// ORDERS
// =========================

function showOrders() {

    if (!ordersList) return;

    let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


    ordersList.innerHTML = "";


    if (orders.length === 0) {

        ordersList.innerHTML = `

        <div class="empty-orders">

            <h3>No Orders Yet</h3>

            <p>Customer orders will appear here.</p>

        </div>

        `;

        return;

    }


    orders.forEach((order, index) => {

        let itemsHTML = "";


        if (order.items && Array.isArray(order.items)) {

            order.items.forEach(item => {

                itemsHTML += `

                <li>
                    ${item.name}
                    × ${item.quantity || 1}
                </li>

                `;

            });

        }


        ordersList.innerHTML += `

        <div class="order-card">

            <h3>
                Order ID:
                ${order.orderId || "N/A"}
            </h3>


            <p>
                <b>Customer:</b>
                ${order.name || order.customerName || "N/A"}
            </p>


            <p>
                <b>Phone:</b>
                ${order.phone || "N/A"}
            </p>


            <p>
                <b>Address:</b>
                ${order.address || "N/A"}
            </p>


            <p>
                <b>Products:</b>
            </p>

            <ul>
                ${itemsHTML}
            </ul>


            <p>
                <b>Total:</b>
                ₹${order.total || 0}
            </p>


            <p class="order-status">

                Status:
                ${order.status || "Pending"}

            </p>


            <div class="order-buttons">

                <button
                    onclick="updateOrderStatus(${index}, 'Accepted')"
                >
                    Accept
                </button>


                <button
                    onclick="updateOrderStatus(${index}, 'Delivered')"
                >
                    Delivered
                </button>


                <button
                    onclick="updateOrderStatus(${index}, 'Cancelled')"
                >
                    Cancel
                </button>


                <button
                    onclick="deleteOrder(${index})"
                >
                    Delete
                </button>

            </div>

        </div>

        `;

    });

}


// =========================
// UPDATE ORDER STATUS
// =========================

function updateOrderStatus(index, status) {

    let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


    if (!orders[index]) return;


    orders[index].status = status;


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    showOrders();

}


// =========================
// DELETE ORDER
// =========================

function deleteOrder(index) {

    let orders =
    JSON.parse(localStorage.getItem("orders")) || [];


    orders.splice(index, 1);


    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );


    showOrders();

}


// =========================
// INITIAL LOAD
// =========================

showProducts();

showOrders();


// Refresh orders every 3 seconds
// so new orders appear automatically.

setInterval(showOrders, 3000);
```

