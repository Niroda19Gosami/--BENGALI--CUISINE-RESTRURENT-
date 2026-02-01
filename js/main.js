/* ROLE CHECK */
if (localStorage.getItem("role") !== "user") {
  location.href = "login.html";
}

/* STICKY NAV */
window.addEventListener("scroll", () => {
  const nav = document.getElementById("mainNavbar");
  window.scrollY > 50
    ? nav.classList.add("scrolled")
    : nav.classList.remove("scrolled");
});

/* CART */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, btn, image) {
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1, image: image || '' });
  }
  updateCart();

  const badge = document.createElement("span");
  badge.className = "added-badge";
  badge.innerText = "+1";
  btn.parentElement.appendChild(badge);
  setTimeout(() => badge.remove(), 600);
}

function updateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cartCount").innerText =
    cart.reduce((sum, i) => sum + i.qty, 0);
}

/* FILTER */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    document.querySelectorAll(".menu-item").forEach(item => {
      item.style.display =
        filter === "all" || item.classList.contains(filter)
          ? "block"
          : "none";
    });
  };
});

/* LOGOUT */
function logout() {
  localStorage.clear();
  location.href = "login.html";
}

updateCart();

/* CART BUTTON CLICK -> go to checkout page */
document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      location.href = 'checkout.html';
    });
  }
  
  // Smooth scroll for Order Now
  const orderBtn = document.querySelector('.btn-order');
  if (orderBtn) {
    orderBtn.addEventListener('click', (e) => {
      // allow anchor behavior but ensure smooth scrolling
      const target = document.querySelector(orderBtn.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Animated counters in hero: animate when visible
  const counters = document.querySelectorAll('.counter');
  if (counters && counters.length) {
    const animateCounter = (el, duration = 1400) => {
      const target = +el.dataset.target || 0;
      const start = 0;
      let startTime = null;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        el.innerText = Math.floor(progress * (target - start) + start);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.innerText = target; // ensure exact
        }
      };
      window.requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(c => animateCounter(c));
          observer.disconnect();
        }
      });
    }, { threshold: 0.25 });

    const row = document.querySelector('.counter-row');
    if (row) obs.observe(row);
    else counters.forEach(c => animateCounter(c));
  }
});
