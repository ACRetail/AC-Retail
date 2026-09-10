let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {

    const cartDiv = document.getElementById("cartItems");

    cartDiv.innerHTML = "";

    let total = 0;

    if(cart.length===0){

        cartDiv.innerHTML="<p>Your cart is empty.</p>";

        document.getElementById("total").innerHTML="Total : ₹0";

        return;
    }

    cart.forEach((item,index)=>{

        total += item.price * item.qty;

        cartDiv.innerHTML += `
        <div class="cart-item">

            <h3>${item.name}</h3>

            <p>₹${item.price}</p>

            <button onclick="decreaseQty(${index})">-</button>

            ${item.qty}

            <button onclick="increaseQty(${index})">+</button>

            <button onclick="removeItem(${index})">
            Remove
            </button>

        </div>
        `;
    });

    document.getElementById("total").innerHTML="Total : ₹"+total;

    localStorage.setItem("cart",JSON.stringify(cart));
}

function increaseQty(index){

    cart[index].qty++;

    displayCart();
}

function decreaseQty(index){

    if(cart[index].qty>1){

        cart[index].qty--;

    }else{

        cart.splice(index,1);
    }

    displayCart();
}

function removeItem(index){

    cart.splice(index,1);

    displayCart();
}

function sendWhatsAppOrder(){

    if(cart.length===0){

        alert("Cart is empty");

        return;
    }

    let message="Hello AC Retail,%0A%0AI want to order:%0A%0A";

    cart.forEach(item=>{

        message += `${item.name} x ${item.qty} = ₹${item.price*item.qty}%0A`;

    });

    let total=cart.reduce((sum,item)=>sum+(item.price*item.qty),0);

    message += `%0ATotal : ₹${total}`;

    window.open(
    `https://wa.me/918830300826?text=${message}`,
    "_blank"
    );

}

displayCart();