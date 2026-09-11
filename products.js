// =============================
// AC Retail - FAST products.js
// =============================

let allProducts = [];
let filteredProducts = [];

let selectedBrand = "";
let selectedCategory = "";
let visibleCount = 40;

const PAGE_SIZE = 40;

const productList = document.getElementById("productList");
const search = document.getElementById("search");
const brandFilters = document.getElementById("brandFilters");
const categoryFilters = document.getElementById("categoryFilters");

// =============================
// Create Product Count
// =============================

const productCount = document.createElement("div");

productCount.style.cssText =
    "text-align:center;margin:15px 0;font-weight:600;color:#555;";

if (productList) {
    productList.parentNode.insertBefore(productCount, productList);
}

// =============================
// Create Load More Button
// =============================

const loadMoreWrap = document.createElement("div");

loadMoreWrap.style.cssText =
    "text-align:center;margin:25px 0;";

const loadMoreBtn = document.createElement("button");

loadMoreBtn.textContent = "Load More";

loadMoreBtn.style.cssText =
    "padding:12px 28px;border:0;border-radius:8px;background:#198754;color:white;font-size:16px;font-weight:600;cursor:pointer;";

loadMoreWrap.appendChild(loadMoreBtn);

if (productList) {
    productList.parentNode.insertBefore(
        loadMoreWrap,
        productList.nextSibling
    );
}

// =============================
// Load Products
// =============================

fetch("products.json?v=4", {
    cache: "force-cache"
})
.then(response => {

    if (!response.ok) {
        throw new Error("products.json not found");
    }

    return response.json();

})
.then(data => {

    allProducts = Array.isArray(data) ? data : [];

    createBrandFilters();
    createCategoryFilters();

    applyFilters();

})
.catch(error => {

    console.error(error);

    if (productList) {

        productList.innerHTML =
            "<h2 style='text-align:center;color:red;'>Products could not be loaded.</h2>";

    }

    productCount.textContent = "";

    loadMoreWrap.style.display = "none";

});

// =============================
// Brand Filters
// =============================

function createBrandFilters() {

    if (!brandFilters) return;

    const brands = [
        ...new Set(
            allProducts
                .map(product => product.brand)
                .filter(Boolean)
        )
    ].sort();

    brandFilters.innerHTML =
        `<button class="filter-btn active" data-brand="">
            All Brands
        </button>` +

        brands.map(brand => `
            <button
                class="filter-btn"
                data-brand="${escapeHtml(brand)}">
                ${escapeHtml(brand)}
            </button>
        `).join("");

    brandFilters
        .querySelectorAll(".filter-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                brandFilters
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                selectedBrand =
                    button.dataset.brand || "";

                applyFilters();

            });

        });

}

// =============================
// Category Filters
// =============================

function createCategoryFilters() {

    if (!categoryFilters) return;

    const preferredOrder = [

        "Fruits & Vegetables",
        "Atta & Flour",
        "Rice & Grains",
        "Pulses & Dals",
        "Masala & Spices",
        "Oil & Ghee",
        "Dairy & Chilled",
        "Biscuits & Bakery",
        "Snacks & Namkeen",
        "Tea & Coffee",
        "Sugar, Salt & Sweeteners",
        "Dry Fruits & Nuts",
        "Pickles, Sauces & Spreads",
        "Instant & Packaged Foods",
        "Chocolates & Confectionery",
        "Beverages",
        "Personal Care",
        "Home Care",
        "Puja & Household",
        "General Items"

    ];

    const existingCategories = [
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];

    const categories = [

        ...preferredOrder.filter(
            category =>
                existingCategories.includes(category)
        ),

        ...existingCategories.filter(
            category =>
                !preferredOrder.includes(category)
        ).sort()

    ];

    categoryFilters.innerHTML =
        `<button class="cat-btn active" data-category="">
            All Categories
        </button>` +

        categories.map(category => `
            <button
                class="cat-btn"
                data-category="${escapeHtml(category)}">
                ${escapeHtml(category)}
            </button>
        `).join("");

    categoryFilters
        .querySelectorAll(".cat-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                categoryFilters
                    .querySelectorAll(".cat-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                selectedCategory =
                    button.dataset.category || "";

                applyFilters();

            });

        });

}

// =============================
// Search + Filter
// =============================

function applyFilters() {

    const keyword = search
        ? search.value.trim().toLowerCase()
        : "";

    filteredProducts = allProducts.filter(product => {

        const searchText =

            `${product.name || ""} ` +
            `${product.brand || ""} ` +
            `${product.category || ""}`

            .toLowerCase();

        const searchMatch =
            !keyword ||
            searchText.includes(keyword);

        const brandMatch =
            !selectedBrand ||
            product.brand === selectedBrand;

        const categoryMatch =
            !selectedCategory ||
            product.category === selectedCategory;

        return (
            searchMatch &&
            brandMatch &&
            categoryMatch
        );

    });

    visibleCount = PAGE_SIZE;

    renderProducts();

}

// =============================
// Display Products
// =============================

function renderProducts() {

    if (!productList) return;

    if (filteredProducts.length === 0) {

        productList.innerHTML =
            `<h2 style="text-align:center;width:100%;">
                No products found
            </h2>`;

        productCount.textContent =
            "0 products";

        loadMoreWrap.style.display =
            "none";

        return;

    }

    const productsToShow =
        filteredProducts.slice(
            0,
            visibleCount
        );

    productList.innerHTML =
        productsToShow
            .map(productCard)
            .join("");

    const shown =
        productsToShow.length;

    const total =
        filteredProducts.length;

    productCount.textContent =
        `Showing ${shown} of ${total} products`;

    if (shown < total) {

        loadMoreWrap.style.display =
            "block";

        loadMoreBtn.textContent =
            `Load More (${Math.min(
                PAGE_SIZE,
                total - shown
            )})`;

    } else {

        loadMoreWrap.style.display =
            "none";

    }

}

// =============================
// Product Card
// =============================

function productCard(product) {

    /*
      default.png file abhi available nahi hai.
      Isliye uske liye broken image request nahi bhejenge.
      Direct "No Image" show hoga.
    */

    const hasRealImage =
        product.image &&
        !product.image
            .toLowerCase()
            .endsWith("default.png");

    const imageHtml = hasRealImage

        ? `
            <img
                class="product-image"
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.name)}"
                loading="lazy"
                decoding="async"

                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="no-image"
                style="display:none;">
                🖼️<br>
                No Image
            </div>
        `

        : `
            <div class="no-image">
                🖼️<br>
                No Image
            </div>
        `;

    return `

        <div class="product-card">

            <div class="product-image-wrap">

                ${imageHtml}

            </div>

            <h3>
                ${escapeHtml(product.name)}
            </h3>

            <p>
                <strong>Brand:</strong>
                ${escapeHtml(
                    product.brand || "General"
                )}
            </p>

            <p>
                <strong>Category:</strong>
                ${escapeHtml(
                    product.category ||
                    "General Items"
                )}
            </p>

            <p class="price">
                ₹${Number(
                    product.price || 0
                ).toFixed(2)}
            </p>

            <button
                class="add-cart-btn"
                data-id="${product.id}">
                🛒 Add to Cart
            </button>

            <button
                class="wa-btn"
                data-id="${product.id}">
                WhatsApp Order
            </button>

        </div>

    `;

}

// =============================
// Load More
// =============================

loadMoreBtn.addEventListener(
    "click",
    () => {

        visibleCount += PAGE_SIZE;

        renderProducts();

    }
);

// =============================
// Search
// =============================

if (search) {

    search.addEventListener(
        "input",
        applyFilters
    );

}

// =============================
// Product Button Events
// =============================

if (productList) {

    productList.addEventListener(
        "click",
        event => {

            // Add to Cart
            const addButton =
                event.target.closest(
                    ".add-cart-btn"
                );

            if (addButton) {

                addToCart(
                    Number(
                        addButton.dataset.id
                    )
                );

                return;

            }

            // WhatsApp
            const whatsappButton =
                event.target.closest(
                    ".wa-btn"
                );

            if (whatsappButton) {

                const product =
                    allProducts.find(
                        item =>
                            item.id ===
                            Number(
                                whatsappButton.dataset.id
                            )
                    );

                if (product) {

                    orderOnWhatsApp(
                        product.name
                    );

                }

            }

        }
    );

}

// =============================
// Cart
// =============================

function addToCart(id) {

    const product =
        allProducts.find(
            item => item.id === id
        );

    if (!product) return;

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    const existing =
        cart.find(
            item => item.id === id
        );

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
// WhatsApp Order
// =============================

function orderOnWhatsApp(
    productName
) {

    const phone =
        "918830300826";

    const message =
`Hello AC Retail,

I want to order:

🛒 ${productName}

Please share payment details.

Thank you.`;

    window.open(

        `https://wa.me/${phone}?text=${encodeURIComponent(
            message
        )}`,

        "_blank"

    );

}

// =============================
// HTML Escape
// =============================

function escapeHtml(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
