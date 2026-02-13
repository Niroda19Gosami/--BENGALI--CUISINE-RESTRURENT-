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

function initChefSlider() {
  const slider = document.querySelector('.chef-slider');
  if (!slider) return;

  const track = slider.querySelector('.image-scroll');
  const prevBtn = slider.querySelector('.chef-prev');
  const nextBtn = slider.querySelector('.chef-next');
  if (!track || !prevBtn || !nextBtn) return;

  const originals = Array.from(track.querySelectorAll('img'));
  if (originals.length < 2) return;

  if (!track.dataset.loopReady) {
    const prependFrag = document.createDocumentFragment();
    const appendFrag = document.createDocumentFragment();

    originals.forEach(img => {
      const preClone = img.cloneNode(true);
      preClone.dataset.clone = 'true';
      prependFrag.appendChild(preClone);

      const postClone = img.cloneNode(true);
      postClone.dataset.clone = 'true';
      appendFrag.appendChild(postClone);
    });

    track.prepend(prependFrag);
    track.append(appendFrag);
    track.dataset.loopReady = '1';
  }

  let step = 0;
  let loopWidth = 0;
  let autoTimer = null;
  let resizeTimer = null;

  const measure = () => {
    const firstItem = track.querySelector('img');
    if (!firstItem) return;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    step = firstItem.getBoundingClientRect().width + gap;
    loopWidth = step * originals.length;
  };

  const jumpToMiddle = () => {
    if (!loopWidth) return;
    track.scrollLeft = loopWidth;
  };

  const normalizeLoop = () => {
    if (!step || !loopWidth) return;
    if (track.scrollLeft <= step * 0.5) {
      track.scrollLeft += loopWidth;
    } else if (track.scrollLeft >= (loopWidth * 2) - (step * 0.5)) {
      track.scrollLeft -= loopWidth;
    }
  };

  const slideBy = direction => {
    if (!step) return;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
    window.setTimeout(normalizeLoop, 420);
  };

  const stopAuto = () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = window.setInterval(() => {
      slideBy(1);
    }, 2600);
  };

  prevBtn.addEventListener('click', () => {
    slideBy(-1);
    startAuto();
  });

  nextBtn.addEventListener('click', () => {
    slideBy(1);
    startAuto();
  });

  track.addEventListener('scroll', normalizeLoop, { passive: true });

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('focusin', stopAuto);
  slider.addEventListener('focusout', startAuto);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const previousStep = step;
      const previousScrollLeft = track.scrollLeft;
      measure();
      if (!previousStep || !step) return;
      track.scrollLeft = (previousScrollLeft / previousStep) * step;
      normalizeLoop();
    }, 150);
  }, { passive: true });

  measure();
  jumpToMiddle();
  startAuto();
}

updateCart();

/* CART BUTTON CLICK -> go to checkout page */
document.addEventListener('DOMContentLoaded', () => {
  initChefSlider();

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
