let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItems = document.getElementById("cartItems");
const totalPrice = document.getElementById("totalPrice");

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<h2>Your cart is empty.</h2>";
        totalPrice.innerHTML = "₹0";
        return;
    }

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.qty;

        cartItems.innerHTML += `
        <div class="cart-card">

            <h3>${item.name}</h3>

            <p>₹${item.price}</p>

            <div class="qty-box">

                <button onclick="decreaseQty(${item.id})">➖</button>

                <span>${item.qty}</span>

                <button onclick="increaseQty(${item.id})">➕</button>

            </div>

            <p><strong>Total:</strong> ₹${item.price * item.qty}</p>

            <button onclick="removeItem(${item.id})">
                🗑 Remove
            </button>

        </div>
        `;
    });

    totalPrice.innerHTML = "₹" + total;
}

function increaseQty(id){

    const item = cart.find(p => p.id === id);

    if(item){
        item.qty++;
        saveCart();
        renderCart();
    }

}

function decreaseQty(id){

    const item = cart.find(p => p.id === id);

    if(item && item.qty > 1){
        item.qty--;
        saveCart();
        renderCart();
    }

}

function removeItem(id){

    cart = cart.filter(item => item.id !== id);

    saveCart();

    renderCart();

}

renderCart();
