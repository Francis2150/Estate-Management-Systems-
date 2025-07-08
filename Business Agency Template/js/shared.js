const demoProducts = [
  { id: 1, name: "Elegant Heels", price: 250, description: "Perfect for weddings.", image: "https://via.placeholder.com/200x150?text=Heels" },
  { id: 2, name: "Casual Flats", price: 120, description: "Comfortable for daily wear.", image: "https://via.placeholder.com/200x150?text=Flats" },
  { id: 3, name: "Sneakers", price: 180, description: "Sporty and comfy.", image: "https://via.placeholder.com/200x150?text=Sneakers" }
];

function getAllProducts() {
  const saved = JSON.parse(localStorage.getItem("products") || "[]");
  return saved.length ? saved : demoProducts;
}
