const basketItemsContainer = document.querySelector(".basket-items");
const totalPriceElement = document.getElementById("total-price");
const deliveryPriceElement = document.getElementById("delivery-price");
const finalPriceElement = document.getElementById("final-price");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const cartModal = document.getElementById("cart-modal");
const clearCartBtn = document.getElementById("clear-cart");
const placeOrderBtn = document.getElementById("place-order");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");

let cart = JSON.parse(localStorage.getItem("cart")) || {};

openCartBtn.addEventListener("click", () => {
  cartModal.classList.add("open");
});

closeCartBtn.addEventListener("click", () => {
  cartModal.classList.remove("open");
});

clearCartBtn.addEventListener("click", () => {
  cart = {};
  saveCart();
  updateCartUI();
});

placeOrderBtn.addEventListener("click", () => {
  const deliveryOption = document.querySelector(
    'input[name="delivery-option"]:checked'
  ).value;
  const phone = phoneInput.value.trim();
  if (!/^\+380\d{9}$/.test(phone)) {
    phoneError.style.display = "inline";
    return;
  } else {
    phoneError.style.display = "none";
  }

  alert(
    `Замовлення оформлено!\nТип: ${
      deliveryOption === "pickup" ? "Самовивіз" : "Доставка"
    }`
  );
  cart = {};
  saveCart();
  updateCartUI();
  cartModal.classList.remove("open");
});

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  basketItemsContainer.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach((item) => {
    if (!item.name || !item.price || !item.quantity) return;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("basket-item");
    itemDiv.innerHTML = `
                        <span>${item.name}</span>
                        <span>${item.price} грн</span>
                        <button data-id="${item.id}" class="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button data-id="${item.id}" class="increase">+</button>
                        <button data-id="${item.id}" class="remove">x</button>
                    `;
    basketItemsContainer.appendChild(itemDiv);
    total += item.price * item.quantity;
  });

  totalPriceElement.textContent = total;

  const deliveryOption = document.querySelector(
    'input[name="delivery-option"]:checked'
  ).value;
  const deliveryCost = deliveryOption === "delivery" && total < 1000 ? 100 : 0;
  deliveryPriceElement.textContent = deliveryCost;
  finalPriceElement.textContent = total + deliveryCost;
}

basketItemsContainer.addEventListener("click", function (e) {
  const id = e.target.dataset.id;
  if (!id || !cart[id]) return;

  if (e.target.classList.contains("increase")) {
    cart[id].quantity++;
  } else if (e.target.classList.contains("decrease")) {
    cart[id].quantity--;
    if (cart[id].quantity <= 0) delete cart[id];
  } else if (e.target.classList.contains("remove")) {
    delete cart[id];
  }

  saveCart();
  updateCartUI();
});

function addToCart(product) {
  if (!product.id || !product.name || !product.price) return;

  if (!cart[product.id]) {
    cart[product.id] = { ...product, quantity: 1 };
  } else {
    cart[product.id].quantity++;
  }
  saveCart();
  updateCartUI();
}

function renderProducts(products, container) {
  container.innerHTML = "";
  products.forEach((p) => {
    container.innerHTML += `
                        <div class="product-card">
                            <img src="./src/img/${p.urlImg}" alt="${p.name}">
                            <h3>${p.name}</h3>
                            <p>${p.about}</p>
                            <p>${p.price} грн</p>
                            <button 
                                data-id="${p.id}" 
                                data-name="${p.name || ""}" 
                                data-price="${p.price || 0}" 
                                data-urlimg="${p.urlImg || ""}"
                            >Купити</button>
                        </div>
                    `;
  });
}

document.body.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON" && e.target.textContent === "Купити") {
    const button = e.target;
    const product = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      urlImg: button.dataset.urlimg,
    };
    addToCart(product);
  }
});

document.querySelectorAll(".products-container").forEach((container) => {
  const category = container.dataset.category;
  fetch(`./data/db-${category}.json`)
    .then((res) => res.json())
    .then((data) => renderProducts(data, container));
});

document.querySelectorAll('input[name="delivery-option"]').forEach((radio) => {
  radio.addEventListener("change", updateCartUI);
});

updateCartUI();
