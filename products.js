// =============================
// AC Retail - products.js
// =============================

let allProducts = [];

let selectedBrand = "";
let selectedCategory = "";

const productList = document.getElementById("productList");
const search = document.getElementById("search");

const brandButtons = document.querySelectorAll(".filter-btn");
const categoryButtons = document.querySelectorAll(".cat-btn");

// =============================
// Load Products
// =============================

fetch("products.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("products.json not found");
        }
        return response.json();
    })
    .then(data => {
        allProducts = data;
        displayProducts(allProducts);
    })
    .catch(error => {
        console.error(error);
        productList.innerHTML =
            "<h2 style='text-align:center;color:red;'>Products could not be loaded.</h2>";
    });

// =============================
// Display Products
// =============================

function displayProducts(products) {

    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML =
            "<h2 style='text-align:center;'>No products found</h2>";
        return;
    }

    products.forEach(product => {

        productList.innerHTML += `
        <div class="product-card">

            <img src="${product.image}" alt="${product.name}">

            <h3>${product.name}</h3>

            <p><strong>Brand:</strong> ${product.brand}</p>

            <p><strong>Category:</strong> ${product.category}</p>

            <p class="price">₹${product.price}</p>

            <button onclick="addToCart(${product.id})">
                🛒 Add to Cart
            </button>

            <button onclick="orderOnWhatsApp('${product.name}')">
                WhatsApp Order
            </button>

        </div>
        `;

    });

}

// =============================
// Search & Filter
// =============================

function filterProducts() {

    const keyword = search.value.toLowerCase();

    const filtered = allProducts.filter(product => {

        const searchMatch =
            product.name.toLowerCase().includes(keyword);

        const brandMatch =
            selectedBrand === "" ||
            product.brand === selectedBrand;

        const categoryMatch =
            selectedCategory === "" ||
            product.category === selectedCategory;

        return searchMatch && brandMatch && categoryMatch;

    });

    displayProducts(filtered);

}

if (search) {
    search.addEventListener("input", filterProducts);
}

brandButtons.forEach(button => {

    button.addEventListener("click", () => {

        brandButtons.forEach(btn =>
            btn.classList.remove("active"));

        button.classList.add("active");

        selectedBrand = button.dataset.brand;

        filterProducts();

    });

});

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        filterProducts();

    });

});

// =============================
// Cart
// =============================

function addToCart(id) {

    const product = allProducts.find(item => item.id === id);

    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === id);

    if (existing) {

        existing.qty++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(product.name + " added to cart!");

}

// =============================
// WhatsApp Order
// =============================

function orderOnWhatsApp(productName) {

    const phone = "918830300826";

    const message = `Hello AC Retail,

I want to order:

🛒 ${productName}

Please share payment details.

Thank you.`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );

}
