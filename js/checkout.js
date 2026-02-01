// Render cart from localStorage and handle Place Order

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  // update any visible cartCount if present
  const el = document.getElementById('cartCount');
  if (el) {
    el.innerText = cart.reduce((s,i) => s + i.qty, 0);
  }
}

function updateQty(name, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
  }
  saveCart(cart);
  renderCart();
}

function removeItem(name) {
  if (!confirm('Remove this item from your cart?')) return;
  const cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById('cartList');
  list.innerHTML = '';

  if (!cart.length) {
    list.innerHTML = '<div class="card p-4 text-center text-muted">Your cart is empty.</div>';
    document.getElementById('total').innerText = 'Total: $0';
    document.getElementById('placeOrder').disabled = true;
    return;
  }

  // create enhanced card container
  const card = document.createElement('div');
  card.className = 'checkout-card p-3';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center justify-content-between mb-3 item-row';

    const left = document.createElement('div');
    left.innerHTML = `<div class="d-flex align-items-center"><img src="${item.image || 'assets/images/2.png'}" class="checkout-thumb me-3" alt=""><div><div class="fw-semibold">${item.name}</div><div class="text-muted">$${item.price} each</div></div></div>`;

    const center = document.createElement('div');
    center.className = 'qty-controls d-flex align-items-center';
    const minus = document.createElement('button');
    minus.className = 'btn btn-sm btn-outline-light btn-qty';
    minus.innerText = '−';
    minus.title = 'Decrease';
    minus.onclick = () => updateQty(item.name, -1);

    const qty = document.createElement('div');
    qty.className = 'mx-2 text-white fw-bold';
    qty.style.minWidth = '28px';
    qty.style.textAlign = 'center';
    qty.innerText = item.qty;
    qty.classList.add('qty-animate');

    // remove animation class after it plays so subsequent changes re-trigger
    setTimeout(() => qty.classList.remove('qty-animate'), 400);

    const plus = document.createElement('button');
    plus.className = 'btn btn-sm btn-light btn-qty text-danger';
    plus.innerText = '+';
    plus.title = 'Increase';
    plus.onclick = () => updateQty(item.name, 1);

    center.appendChild(minus);
    center.appendChild(qty);
    center.appendChild(plus);

    const right = document.createElement('div');
    right.className = 'text-end';
    right.innerHTML = `<div class="fw-semibold">$${(item.price * item.qty).toFixed(2)}</div>`;
    const rm = document.createElement('button');
    rm.className = 'btn btn-sm btn-link text-white text-decoration-none';
    rm.innerText = 'Remove';
    rm.onclick = () => removeItem(item.name);
    right.appendChild(rm);

    row.appendChild(left);
    row.appendChild(center);
    row.appendChild(right);

    card.appendChild(row);
  });

  list.appendChild(card);

  const total = cart.reduce((s,i) => s + (i.price * i.qty), 0);
  document.getElementById('total').innerText = 'Total: $' + total.toFixed(2);
  document.getElementById('placeOrder').disabled = false;
}

function placeOrder() {
  const cart = getCart();
  if (!cart.length) return alert('Cart is empty');

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const newOrder = {
    id: Date.now(),
    items: cart,
    total: cart.reduce((s,i)=> s + (i.price * i.qty), 0),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  localStorage.removeItem('cart');
  alert('Order placed!');
  location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('placeOrder').addEventListener('click', placeOrder);
});
