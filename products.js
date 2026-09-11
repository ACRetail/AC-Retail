// =============================
// AC Retail - products.js
// =============================

let allProducts = [];

let selectedBrand = "";
let selectedCategory = "";

const productList = document.getElementById("productList");
const search = document.getElementById("search");

const brandFilters = document.getElementById("brandFilters");
const categoryFilters = document.getElementById("categoryFilters");


// =============================
// LOAD PRODUCTS
// =============================

fetch("products.json?v=3")

    .then(response => {

        if (!response.ok) {
            throw new Error("products.json not found");
        }

        return response.json();

    })

    .then(data => {

        allProducts = data;

        createBrandButtons();
        createCategoryButtons();

        displayProducts(allProducts);

    })

    .catch(error => {

        console.error(error);

        productList.innerHTML =
            "<h2 style='text-align:center;color:red;'>Products could not be loaded.</h2>";

    });


// =============================
// CREATE BRAND BUTTONS
// =============================

function createBrandButtons() {

    brandFilters.innerHTML = "";

    const brands = [
        ...new Set(
            allProducts
                .map(product => product.brand)
                .filter(Boolean)
        )
    ].sort();

    // All Brands
    const allButton = document.createElement("button");

    allButton.className = "filter-btn active";
    allButton.textContent = "All Brands";

    allButton.onclick = () => {

        selectedBrand = "";

        document
            .querySelectorAll(".filter-btn")
            .forEach(btn => btn.classList.remove("active"));

        allButton.classList.add("active");

        filterProducts();

    };

    brandFilters.appendChild(allButton);


    // Other brands
    brands.forEach(brand => {

        const button = document.createElement("button");

        button.className = "filter-btn";
        button.textContent = brand;

        button.onclick = () => {

            document
                .querySelectorAll(".filter-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            selectedBrand = brand;

            filterProducts();

        };

        brandFilters.appendChild(button);

    });

}


// =============================
// CREATE CATEGORY BUTTONS
// =============================

function createCategoryButtons() {

    categoryFilters.innerHTML = "";

    const categories = [
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ].sort();


    // All Categories
    const allButton = document.createElement("button");

    allButton.className = "cat-btn active";
    allButton.textContent = "All Categories";

    allButton.onclick = () => {

        selectedCategory = "";

        document
            .querySelectorAll(".cat-btn")
            .forEach(btn => btn.classList.remove("active"));

        allButton.classList.add("active");

        filterProducts();

    };

    categoryFilters.appendChild(allButton);


    // New categories from JSON
    categories.forEach(category => {

        const button = document.createElement("button");

        button.className = "cat-btn";
        button.textContent = category;

        button.onclick = () => {

            document
                .querySelectorAll(".cat-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            selectedCategory = category;

            filterProducts();

        };

        categoryFilters.appendChild(button);

    });

}


// =============================
// DISPLAY PRODUCTS
// =============================

function displayProducts(products) {

    productList.innerHTML = "";

    if (products.length === 0) {

        productList.innerHTML =
            "<h2 style='text-align:center;'>No products found</h2>";

        return;
    }


    products.forEach(product => {

        const image = product.image || "";

        productList.innerHTML += `

        <div class="product-card">

            <div class="product-image">

                <img
                    src="${image}"
                    alt="${product.name}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="no-image"
                    style="display:${image ? "none" : "flex"};"
                >
                    🖼️
                    <br>
                    No Image
                </div>

            </div>


            <h3>${product.name}</h3>

            <p>
                <strong>Brand:</strong>
                ${product.brand || "General"}
            </p>

            <p>
                <strong>Category:</strong>
                ${product.category || "General Items"}
            </p>

            <p class="price">
                ₹${product.price}
            </p>


            <button onclick="addToCart(${product.id})">
                🛒 Add to Cart
            </button>


            <button
                onclick='orderOnWhatsApp(${JSON.stringify(product.name)})'
            >
                WhatsApp Order
            </button>

        </div>

        `;

    });

}


// =============================
// SEARCH + FILTER
// =============================

function filterProducts() {

    const keyword =
        search.value.toLowerCase().trim();


    const filtered = allProducts.filter(product => {

        const searchMatch =
            product.name
                .toLowerCase()
                .includes(keyword);


        const brandMatch =
            selectedBrand === "" ||
            product.brand === selectedBrand;


        const categoryMatch =
            selectedCategory === "" ||
            product.category === selectedCategory;


        return searchMatch &&
               brandMatch &&
               categoryMatch;

    });


    displayProducts(filtered);

}


if (search) {

    search.addEventListener(
        "input",
        filterProducts
    );

}


// =============================
// CART
// =============================

function addToCart(id) {

    const product =
        allProducts.find(item => item.id === id);

    if (!product) return;


    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];


    const existing =
        cart.find(item => item.id === id);


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


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert(
        product.name +
        " added to cart!"
    );

}


// =============================
// WHATSAPP ORDER
// =============================

function orderOnWhatsApp(productName) {

    const phone =
        "918830300826";


    const message =
`Hello AC Retail,

I want to order:

🛒 ${productName}

Please share payment details.

Thank you.`;


    window.open(

        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,

        "_blank"

    );

}
