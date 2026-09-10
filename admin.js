const form = document.getElementById("productForm");
const list = document.getElementById("adminProducts");

let products = JSON.parse(localStorage.getItem("products")) || [];

function showProducts(){

    list.innerHTML = "";

    products.forEach((p,index)=>{

        list.innerHTML += `
        <div class="card">

            <h3>${p.name}</h3>

            <p>${p.category}</p>

            <p><b>₹${p.price}</b></p>

            <button onclick="deleteProduct(${index})" class="btn">
            Delete
            </button>

        </div>
        `;

    });

}

form.addEventListener("submit",function(e){

    e.preventDefault();

    products.push({

        name:name.value,
        category:category.value,
        price:price.value

    });

    localStorage.setItem("products",JSON.stringify(products));

    form.reset();

    showProducts();

});

function deleteProduct(index){

    products.splice(index,1);

    localStorage.setItem("products",JSON.stringify(products));

    showProducts();

}

showProducts();