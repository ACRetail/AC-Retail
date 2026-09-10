// =========================
// AC Retail Products
// =========================

let allProducts = [];

let selectedBrand = "";
let selectedCategory = "";

const productList = document.getElementById("productList");
const search = document.getElementById("search");

const brandButtons = document.querySelectorAll(".filter-btn");
const categoryButtons = document.querySelectorAll(".cat-btn");

// Load Products
fetch("data/products.json")
  .then(response => response.json())
  .then(data => {
    allProducts = data;
    displayProducts(allProducts);
  })
  .catch(error => {
    console.error("Error loading products:", error);
  });

// =========================
// Display Products
// =========================

function displayProducts(products) {

    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<h3>No products found.</h3>";
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

            <button onclick="orderOnWhatsApp('${product.name}')">
                Order on WhatsApp
            </button>

        </div>
        `;

    });

}

// =========================
// Search + Filter
// =========================

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

// =========================
// WhatsApp Order
// =========================

function orderOnWhatsApp(productName) {

    const phone = "918830300826";

    const message =
`Hello AC Retail,

I want to order:

🛒 Product: ${productName}

Please share payment details.

Thank you.`;

    const url =
`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

}

// =========================
// Search Event
// =========================

search.addEventListener("input", filterProducts);

// =========================
// Brand Filter
// =========================

brandButtons.forEach(button => {

    button.addEventListener("click", () => {

        brandButtons.forEach(btn =>
            btn.classList.remove("active"));

        button.classList.add("active");

        selectedBrand = button.dataset.brand;

        filterProducts();

    });

});

// =========================
// Category Filter
// =========================

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active"));

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        filterProducts();

    });

});

function addToCart(product){

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);

    if(existing){

        existing.qty++;

    }else{

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1
        });

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(product.name + " added to cart");
}
