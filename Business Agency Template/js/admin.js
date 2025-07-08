function checkAdmin() {
  const input = document.getElementById("adminPass").value;
  if (input === "admin123") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-section").style.display = "block";
    loadAdminProducts();
  } else {
    document.getElementById("login-msg").innerText = "❌ Incorrect password";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("prodName").value;
      const image = document.getElementById("prodImage").value;
      const price = parseFloat(document.getElementById("prodPrice").value);
      const description = document.getElementById("prodDesc").value;
      const product = { id: Date.now(), name, image, price, description };

      const products = getAllProducts();
      products.push(product);
      localStorage.setItem("products", JSON.stringify(products));
      form.reset();
      loadAdminProducts();
    });
  }
});

function loadAdminProducts() {
  const container = document.getElementById("productTable");
  const products = getAllProducts();
  let html = `<table><tr><th>Name</th><th>Price</th><th>Image</th><th>Description</th><th>Action</th></tr>`;
  products.forEach(p => {
    html += `<tr>
      <td>${p.name}</td><td>GHS ${p.price}</td>
      <td><img src="${p.image}" width="50" /></td>
      <td>${p.description}</td>
      <td><button onclick="deleteProduct(${p.id})">🗑️</button></td>
    </tr>`;
  });
  html += "</table>";
  container.innerHTML = html;
}

function deleteProduct(id) {
  const products = getAllProducts().filter(p => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  loadAdminProducts();
}
