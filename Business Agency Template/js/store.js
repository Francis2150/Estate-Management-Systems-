let cart = [];

window.onload = () => {
  loadProducts();
  document.getElementById("orderBtn").onclick = () => {
    document.getElementById("order-form").style.display = "block";
  };
  document.getElementById("checkoutForm").onsubmit = sendOrder;
};

function loadProducts() {
  const container = document.getElementById("product-list");
  const products = getAllProducts();
  container.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>GHS ${product.price}</strong></p>
      <input type="number" id="qty-${product.id}" value="1" min="1" />
      <button onclick="addToCart(${product.id})" class="btn">Add to Cart</button>
    `;
    container.appendChild(div);
  });
}

function addToCart(productId) {
  const products = getAllProducts();
  const qty = parseInt(document.getElementById(`qty-${productId}`).value);
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  renderCart();
}

function renderCart() {
  const items = document.getElementById("cart-items");
  let total = 0;
  items.innerHTML = "";
  cart.forEach(item => {
    const sub = item.qty * item.price;
    total += sub;
    items.innerHTML += `<div>${item.name} (x${item.qty}) - GHS ${sub.toFixed(2)} <button onclick="removeFromCart(${item.id})">❌</button></div>`;
  });
  document.getElementById("cart-total").innerText = `Total: GHS ${total.toFixed(2)}`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function sendOrder(e) {
  e.preventDefault();
  const name = document.getElementById("customerName").value;
  const email = document.getElementById("customerEmail").value;
  const whatsapp = document.getElementById("customerWhatsApp").value;

  let msg = `Hi, I want to order:\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}\n\n`;
  let total = 0;

  cart.forEach(item => {
    msg += `${item.name} x${item.qty} = GHS ${item.qty * item.price}\n`;
    total += item.qty * item.price;
  });

  msg += `\nTotal: GHS ${total.toFixed(2)}`;
  window.open(`https://wa.me/233500000000?text=${encodeURIComponent(msg)}`, "_blank");
}
