// =============================
// AC Retail - SMART products.js
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
// URL Category
// =============================

const urlParams = new URLSearchParams(window.location.search);
const urlCategory = urlParams.get("category");

if (urlCategory) {
    selectedCategory = urlCategory.trim();
}

// =============================
// Product Count
// =============================

const productCount = document.createElement("div");

productCount.style.cssText =
    "text-align:center;margin:15px 0;font-weight:600;color:#555;";

if (productList) {
    productList.parentNode.insertBefore(
        productCount,
        productList
    );
}

// =============================
// Load More Button
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

fetch("products.json?v=6", {
    cache: "no-store"
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

    // Categories directly from products.json
    const existingCategories = [
        ...new Set(
            allProducts
                .map(product =>
                    String(product.category || "").trim()
                )
                .filter(Boolean)
        )
    ];

    // Sort categories alphabetically
    const categories = existingCategories.sort(
        (a, b) => a.localeCompare(b)
    );

    categoryFilters.innerHTML =
        `<button
            class="cat-btn ${!selectedCategory ? "active" : ""}"
            data-category="">
            All Categories
        </button>` +

        categories.map(category => `
            <button
                class="cat-btn ${
                    normalizeCategory(category) ===
                    normalizeCategory(selectedCategory)
                        ? "active"
                        : ""
                }"
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


    // If no category selected, activate All Categories
    if (!selectedCategory) {

        const allButton =
            categoryFilters.querySelector(
                '[data-category=""]'
            );

        if (allButton) {
            allButton.classList.add("active");
        }

    }

}

// =============================
// SMART SEARCH
// =============================

// Convert text into clean searchable words
function normalizeText(value) {

    return String(value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

}

// =============================
// Levenshtein Distance
// =============================

function levenshtein(a, b) {

    if (a === b) return 0;

    if (!a.length) return b.length;
    if (!b.length) return a.length;

    let previous = [];

    for (let j = 0; j <= b.length; j++) {
        previous[j] = j;
    }

    for (let i = 1; i <= a.length; i++) {

        let current = [i];

        for (let j = 1; j <= b.length; j++) {

            const insertCost =
                current[j - 1] + 1;

            const deleteCost =
                previous[j] + 1;

            const replaceCost =
                previous[j - 1] +
                (a[i - 1] === b[j - 1] ? 0 : 1);

            current[j] =
                Math.min(
                    insertCost,
                    deleteCost,
                    replaceCost
                );

        }

        previous = current;
    }

    return previous[b.length];

}

// =============================
// Fuzzy Word Match
// =============================

function fuzzyWordMatch(queryWord, productWords) {

    // Exact / partial match first
    if (
        productWords.some(word =>
            word.includes(queryWord) ||
            queryWord.includes(word)
        )
    ) {
        return true;
    }

    // Very short words should not become too fuzzy
    if (queryWord.length < 4) {
        return false;
    }

    // Allow small spelling mistakes
    const maxDistance =
        queryWord.length <= 5 ? 2 : 2;

    return productWords.some(word => {

        if (
            Math.abs(word.length - queryWord.length) >
            maxDistance
        ) {
            return false;
        }

        return (
            levenshtein(queryWord, word) <=
            maxDistance
        );

    });

}

// =============================
// Smart Search Match
// =============================

function smartSearchMatch(keyword, product) {

    const query =
        normalizeText(keyword);

    if (!query) {
        return true;
    }
// =============================
// Category Normalizer
// =============================

function normalizeCategory(value) {

    return String(value ?? "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, " ")
        .trim();

}
    const productText =
        normalizeText(
            `${product.name || ""} ` +
            `${product.brand || ""} ` +
            `${product.category || ""}`
        );

    // Full phrase exact match
    if (productText.includes(query)) {
        return true;
    }

    const queryWords =
        query.split(/\s+/).filter(Boolean);

    const productWords =
        productText.split(/\s+/).filter(Boolean);

    // Every search word must match something
    return queryWords.every(queryWord =>
        fuzzyWordMatch(
            queryWord,
            productWords
        )
    );

}

// =============================
// Search + Filters
// =============================

function applyFilters() {

    const keyword =
        search
            ? search.value.trim()
            : "";

    filteredProducts =
        allProducts.filter(product => {

            const searchMatch =
                smartSearchMatch(
                    keyword,
                    product
                );

            const brandMatch =
                !selectedBrand ||
                product.brand === selectedBrand;

            const categoryMatch =
    !selectedCategory ||
    normalizeCategory(product.category) ===
    normalizeCategory(selectedCategory);

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

    const hasRealImage =
        product.image &&
        !String(product.image)
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

            <div class="price-box">

    <div class="mrp">
        MRP:
        <span>₹${Number(
            product.mrp || product.price || 0
        ).toFixed(2)}</span>
    </div>

    <div class="online-price">
        Online Price:
        <strong>₹${Number(
            product.price || 0
        ).toFixed(2)}</strong>
    </div>

    ${
        Number(product.mrp || 0) > Number(product.price || 0)
            ? `<div class="saving">
                You Save ₹${(
                    Number(product.mrp) -
                    Number(product.price)
                ).toFixed(2)}
              </div>`
            : ""
    }

</div>

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
    addButton.dataset.id
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
            whatsappButton.dataset.id
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
  mrp: product.mrp,
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
