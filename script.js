
/* FOODIE HUB - Website Functionality */

// Food menu data
const foods = [
    {
        id: 1,
        name: "Margherita Pizza",
        category: "Italian Food",
        price: 299,
        rating: 4.8,
        description: "Cheesy pizza with fresh tomatoes and basil.",
        image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Classic Burger",
        category: "Fast Food",
        price: 199,
        rating: 4.7,
        description: "Juicy burger with lettuce, cheese and sauce.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Creamy Pasta",
        category: "Italian Food",
        price: 249,
        rating: 4.6,
        description: "Creamy pasta tossed with herbs and cheese.",
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Chicken Biryani",
        category: "Indian Food",
        price: 279,
        rating: 4.9,
        description: "Aromatic basmati rice with rich Indian spices.",
        image: "Chicken-Biryani.jpg"
    },
    {
        id: 5,
        name: "Club Sandwich",
        category: "Fast Food",
        price: 159,
        rating: 4.5,
        description: "Toasted bread with fresh and tasty fillings.",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 129,
        rating: 4.8,
        description: "Rich chocolate brownie for your sweet cravings.",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "Crispy French Fries",
        category: "Fast Food",
        price: 99,
        rating: 4.4,
        description: "Golden, crispy fries seasoned to perfection.",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Gulab Jamun",
        category: "Desserts",
        price: 89,
        rating: 4.7,
        description: "Soft Indian sweets soaked in sugar syrup.",
        image: "jamun.jpg"
    }
];

// Safely load the saved cart
function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("foodieHubCart") || "[]");

        if (!Array.isArray(saved)) return [];

        return saved.filter(item =>
            foods.some(food => food.id === item.id) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 99
        ).map(item => ({
            id: item.id,
            quantity: item.quantity
        }));
    } catch (error) {
        return [];
    }
}

let cart = loadCart();
let activeCategory = "All Items";

// Shortcuts for selecting page elements
const foodGrid = document.getElementById("foodGrid");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");

let toastTimer;

// Display a small notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Save cart to the browser
function saveCart() {
    try {
        localStorage.setItem("foodieHubCart", JSON.stringify(cart));
    } catch (error) {
        showToast("Cart could not be saved in this browser.");
    }
}

// Format prices in Indian Rupees
function formatPrice(price) {
    return "₹" + price.toLocaleString("en-IN");
}

// Handle images that fail to load
function handleImageError(image) {
    image.onerror = null;
    image.src =
        "https://placehold.co/600x400/302a25/ffffff?text=Foodie+Hub";
}

// Display menu items according to category and search
function displayFoods() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredFoods = foods.filter(food => {
        const matchesCategory =
            activeCategory === "All Items" ||
            food.category === activeCategory;

        const matchesSearch =
            food.name.toLowerCase().includes(searchTerm) ||
            food.description.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    foodGrid.innerHTML = filteredFoods.map(food => `
        <article class="food-card">
            <div class="food-image-wrap">
                <img
                    class="food-image"
                    src="${food.image}"
                    alt="${food.name}"
                    loading="lazy"
                    onerror="handleImageError(this)">
                <span class="food-category-label">${food.category}</span>
            </div>

            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <div class="rating">★ ${food.rating} / 5</div>

                <div class="food-bottom">
                    <span class="food-price">${formatPrice(food.price)}</span>
                    <button class="add-btn" data-add="${food.id}">
                        + Add to Cart
                    </button>
                </div>
            </div>
        </article>
    `).join("");

    noResults.hidden = filteredFoods.length !== 0;
}

// Category filter buttons
document.getElementById("categories").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".category").forEach(category => {
        category.classList.toggle("active", category === button);
    });

    displayFoods();
});

// Search input
searchInput.addEventListener("input", displayFoods);

// Add a food item to the cart
function addToCart(id, quantity = 1) {
    const food = foods.find(item => item.id === Number(id));
    if (!food) return;

    const existingItem = cart.find(item => item.id === food.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (currentQuantity + quantity > 99) {
        showToast("Maximum quantity is 99 per food item.");
        return;
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: food.id, quantity });
    }

    saveCart();
    renderCart();
    showToast(food.name + " added to your cart!");
}

// Menu Add to Cart buttons
foodGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
});

// Render cart items and calculate bill
function renderCart() {
    let itemCount = 0;
    let subtotal = 0;

    cart.forEach(item => {
        const food = foods.find(food => food.id === item.id);
        if (!food) return;

        itemCount += item.quantity;
        subtotal += food.price * item.quantity;
    });

    cartCount.textContent = itemCount;
    document.getElementById("summaryItems").textContent = itemCount;
    document.getElementById("subtotal").textContent = formatPrice(subtotal);

    // Demo delivery fee: free for orders of ₹500 or more
    const deliveryFee = itemCount === 0 || subtotal >= 500 ? 0 : 40;

    document.getElementById("delivery").textContent =
        deliveryFee === 0 && itemCount > 0
            ? "FREE"
            : formatPrice(deliveryFee);

    document.getElementById("total").textContent =
        formatPrice(subtotal + deliveryFee);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h3>Your cart is feeling hungry!</h3>
                <p>Add your favorite dishes to get started.</p>
                <a href="#menu" class="btn">Explore Menu</a>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const food = foods.find(food => food.id === item.id);
        if (!food) return "";

        return `
            <article class="cart-item">
                <img
                    src="${food.image}"
                    alt="${food.name}"
                    onerror="handleImageError(this)">

                <div class="cart-item-info">
                    <h3>${food.name}</h3>
                    <p>${formatPrice(food.price * item.quantity)}</p>

                    <div class="quantity-controls">
                        <button data-change="${food.id}" data-delta="-1"
                                aria-label="Decrease ${food.name} quantity">−</button>
                        <span>${item.quantity}</span>
                        <button data-change="${food.id}" data-delta="1"
                                aria-label="Increase ${food.name} quantity">+</button>
                    </div>

                    <button class="remove-btn" data-remove="${food.id}">
                        Remove item
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// Handle cart quantity and remove buttons
cartItems.addEventListener("click", event => {
    const changeButton = event.target.closest("[data-change]");
    const removeButton = event.target.closest("[data-remove]");

    if (changeButton) {
        const id = Number(changeButton.dataset.change);
        const delta = Number(changeButton.dataset.delta);
        const item = cart.find(item => item.id === id);

        if (!item) return;

        if (delta === 1 && item.quantity >= 99) {
            showToast("Maximum quantity is 99.");
            return;
        }

        item.quantity += delta;

        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }

        saveCart();
        renderCart();
    }

    if (removeButton) {
        const id = Number(removeButton.dataset.remove);
        cart = cart.filter(item => item.id !== id);

        saveCart();
        renderCart();
        showToast("Item removed from cart.");
    }
});

// Clear entire cart
document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Your cart is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        saveCart();
        renderCart();
        showToast("Your cart has been cleared.");
    }
});

// Special offer buttons
document.querySelectorAll("[data-offer]").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.offer === "pizza") {
            // Demonstration offer price
            addCustomOffer({
                id: 101,
                name: "Pizza Party Special",
                price: 249,
                image: foods[0].image
            });
        }

        if (button.dataset.offer === "combo") {
            // Add a burger and fries at their regular prices
            addToCart(2);
            addToCart(7);
            showToast("Burger combo added! Prices are demo prices.");
        }

        document.getElementById("cart").scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Store special offer items separately from regular menu items
// Their prices are used only for this browser session.
let customOffers = [];

function addCustomOffer(offer) {
    let existing = customOffers.find(item => item.id === offer.id);

    if (existing) {
        if (existing.quantity >= 99) {
            showToast("Maximum quantity is 99.");
            return;
        }
        existing.quantity++;
    } else {
        customOffers.push({ ...offer, quantity: 1 });
    }

    renderCart();
    showToast("Pizza Party Special added to your cart!");
}

// Checkout demo
const checkoutDialog = document.getElementById("checkoutDialog");

document.getElementById("checkoutBtn").addEventListener("click", () => {
    const lines = [];
    let subtotal = 0;
    let count = 0;

    cart.forEach(item => {
        const food = foods.find(food => food.id === item.id);
        if (!food) return;

        lines.push(
            `${food.name} × ${item.quantity} = ${formatPrice(food.price * item.quantity)}`
        );

        subtotal += food.price * item.quantity;
        count += item.quantity;
    });

    customOffers.forEach(item => {
        lines.push(
            `${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
        );

        subtotal += item.price * item.quantity;
        count += item.quantity;
    });

    if (count === 0) {
        showToast("Please add food before checkout.");
        return;
    }

    const deliveryFee = subtotal >= 500 ? 0 : 40;

    document.getElementById("orderDetails").textContent =
        lines.join("\n") +
        "\n\nSubtotal: " + formatPrice(subtotal) +
        "\nDelivery: " + (deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)) +
        "\nTotal: " + formatPrice(subtotal + deliveryFee);

    checkoutDialog.showModal();
});

// Close checkout dialog
document.getElementById("closeDialog").addEventListener("click", () => {
    checkoutDialog.close();
});

// Confirm demonstration order only
document.getElementById("confirmDemoBtn").addEventListener("click", () => {
    checkoutDialog.close();

    cart = [];
    customOffers = [];

    saveCart();
    renderCart();

    showToast("Demo order confirmed! No real order was placed.");
});

// Close dialog when clicking its backdrop
checkoutDialog.addEventListener("click", event => {
    if (event.target === checkoutDialog) {
        checkoutDialog.close();
    }
});

// Contact form validation and demo submission
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    formMessage.className = "";

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formMessage.textContent = "Please complete all fields correctly.";
        formMessage.classList.add("error");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name.length < 2 || message.length < 5) {
        formMessage.textContent =
            "Please enter a valid name and a longer message.";
        formMessage.classList.add("error");
        return;
    }

    formMessage.textContent =
        "Thank you, " + name + "! Your demo message was submitted successfully.";
    formMessage.classList.add("success");

    contactForm.reset();
});

// Responsive mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close mobile menu after selecting a section
navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Initial page rendering
displayFoods();
renderCart();
