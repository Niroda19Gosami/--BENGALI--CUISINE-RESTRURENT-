// Render cart from localStorage and handle Place Order

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function getItemName(item) {
  return String(item?.name || item?.title || item?.productName || '').trim();
}

function getItemPrice(item) {
  const value = Number(item?.price ?? item?.unitPrice ?? item?.amount ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getItemQty(item) {
  const value = Number(item?.qty ?? item?.quantity ?? 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function getItemImage(item) {
  return item?.image || item?.img || item?.thumbnail || 'assets/images/Prawn%20Curry.png';
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildItemHtml(item, wrapWithListItem, itemIndex) {
  const name = escapeHtml(item.name);
  const image = escapeHtml(item.image);
  const price = item.price.toFixed(2);
  const qty = String(item.qty);
  const subtotal = (item.price * item.qty).toFixed(2);
  const index = Number.isInteger(itemIndex) && itemIndex >= 0 ? itemIndex : 0;

  const openTag = wrapWithListItem ? '<li class="checkout-item">' : '<div class="checkout-item">';
  const closeTag = wrapWithListItem ? '</li>' : '</div>';

  return `${openTag}
    <article class="checkout-item-card" data-product-card>
      <div class="row g-2 g-sm-3 align-items-center">
        <div class="col-12 col-lg-5">
          <div class="checkout-item-identity d-flex align-items-center gap-2">
            <img src="${image}" class="checkout-thumb" alt="${name} image" data-product-image>
            <div class="checkout-item-text">
              <div class="fw-semibold checkout-item-name" data-product-name>${name}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-2 checkout-meta-col">
          <div class="checkout-detail-row" data-detail="price">
            <span class="checkout-detail-label">Price</span>
            <span class="checkout-detail-value" data-product-price>$${price} each</span>
          </div>
        </div>
        <div class="col-12 col-lg-3 checkout-qty-col">
          <div class="checkout-detail-row checkout-qty-row">
            <span class="checkout-detail-label">Quantity</span>
            <div class="qty-controls d-flex align-items-center">
              <button type="button" class="btn btn-sm btn-outline-light btn-qty" data-cart-action="decrease" data-product-name="${name}" data-cart-index="${index}" aria-label="Decrease quantity"><i class="bi bi-dash-lg" aria-hidden="true"></i></button>
              <div class="mx-2 text-white fw-bold qty-value" data-product-qty>${qty}</div>
              <button type="button" class="btn btn-sm btn-light btn-qty text-danger" data-cart-action="increase" data-product-name="${name}" data-cart-index="${index}" aria-label="Increase quantity"><i class="bi bi-plus-lg" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-2 checkout-summary-col">
          <div class="checkout-summary d-flex flex-column">
            <div class="checkout-detail-row" data-detail="subtotal">
              <span class="checkout-detail-label">Subtotal</span>
              <span class="checkout-detail-value fw-semibold" data-product-subtotal>$${subtotal}</span>
            </div>
            <button type="button" class="btn btn-sm btn-link text-white text-decoration-none" data-cart-action="remove" data-product-name="${name}" data-cart-index="${index}" aria-label="Remove item">Remove</button>
          </div>
        </div>
      </div>
    </article>
  ${closeTag}`;
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  const el = document.getElementById('cartCount');
  if (el) {
    el.innerText = cart.reduce((sum, item) => sum + getItemQty(item), 0);
  }
}

function updateQty(name, delta) {
  const cart = getCart();
  const idx = cart.findIndex(item => getItemName(item) === name);
  if (idx === -1) return;

  const nextQty = getItemQty(cart[idx]) + delta;
  if (nextQty <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].qty = nextQty;
  }

  saveCart(cart);
  renderCart();
}

function removeItem(name) {
  const targetName = String(name || '').trim();
  if (!targetName) return;

  const cart = getCart();
  const nextCart = [];
  let removed = false;

  cart.forEach(item => {
    if (!removed && getItemName(item) === targetName) {
      removed = true;
      return;
    }
    nextCart.push(item);
  });

  if (!removed) return;
  saveCart(nextCart);
  renderCart();
}

function removeItemByIndex(index) {
  const cart = getCart();
  if (!Number.isInteger(index) || index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function initCheckoutNavbar() {
  const nav = document.getElementById('mainNavbar');
  if (!nav) return;

  const syncNavbar = () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  };

  syncNavbar();
  window.addEventListener('scroll', syncNavbar, { passive: true });
}

function renderCart() {
  const cart = getCart();
  const cartList = document.getElementById('cartList');
  const emptyState = document.getElementById('cartEmptyState');
  const template = document.getElementById('checkoutItemTemplate');
  const canUseTemplate = !!(template && template.content);
  const wrapWithListItem = cartList.tagName.toLowerCase() === 'ol';

  cartList.innerHTML = '';

  if (!cart.length) {
    emptyState.classList.remove('d-none');
    cartList.classList.add('d-none');
    document.getElementById('total').innerText = 'Total: $0';
    document.getElementById('placeOrder').disabled = true;
    return;
  }

  emptyState.classList.add('d-none');
  cartList.classList.remove('d-none');

  const normalizedCart = [];
  const htmlParts = [];
  const fragment = canUseTemplate ? document.createDocumentFragment() : null;

  cart.forEach((item, itemIndex) => {
    const itemName = getItemName(item) || 'Item';
    const itemPrice = getItemPrice(item);
    const itemQty = getItemQty(item);
    const itemImage = getItemImage(item);
    const lineTotal = itemPrice * itemQty;
    normalizedCart.push({ name: itemName, price: itemPrice, qty: itemQty, image: itemImage });

    if (canUseTemplate) {
      const node = template.content.cloneNode(true);

      const img = node.querySelector('[data-product-image]');
      img.src = itemImage;
      img.alt = `${itemName} image`;

      const nameNode = node.querySelector('.checkout-item-name[data-product-name]');
      const priceNode = node.querySelector('[data-detail="price"] [data-product-price]');
      const qtyNode = node.querySelector('.qty-value[data-product-qty]');
      const subtotalNode = node.querySelector('[data-detail="subtotal"] [data-product-subtotal]');

      if (nameNode) nameNode.textContent = itemName;
      if (priceNode) priceNode.textContent = `$${itemPrice.toFixed(2)} each`;
      if (qtyNode) qtyNode.textContent = String(itemQty);
      if (subtotalNode) subtotalNode.textContent = `$${lineTotal.toFixed(2)}`;

      node.querySelectorAll('[data-cart-action]').forEach(btn => {
        btn.dataset.productName = itemName;
        btn.dataset.cartIndex = String(itemIndex);
      });

      fragment.appendChild(node);
    } else {
      htmlParts.push(buildItemHtml({ name: itemName, price: itemPrice, qty: itemQty, image: itemImage }, wrapWithListItem, itemIndex));
    }
  });

  if (canUseTemplate) {
    cartList.appendChild(fragment);
  } else {
    cartList.innerHTML = htmlParts.join('');
  }

  // final fail-safe in case template exists but nodes are malformed/stale in browser cache
  if (!cartList.querySelector('[data-product-name]') || !cartList.querySelector('[data-product-qty]')) {
    cartList.innerHTML = normalizedCart.map((item, itemIndex) => buildItemHtml(item, wrapWithListItem, itemIndex)).join('');
  }

  // keep stored cart shape stable so rendering/click handlers always map correctly
  saveCart(normalizedCart);

  const total = normalizedCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('total').innerText = 'Total: $' + total.toFixed(2);
  document.getElementById('placeOrder').disabled = false;
}

function placeOrder() {
  const rawCart = getCart();
  if (!rawCart.length) return alert('Cart is empty');

  const cart = rawCart.map(item => ({
    name: getItemName(item) || 'Item',
    price: getItemPrice(item),
    qty: getItemQty(item),
    image: getItemImage(item)
  }));

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const newOrder = {
    id: Date.now(),
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
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
  initCheckoutNavbar();

  const cartList = document.getElementById('cartList');
  const placeOrderBtn = document.getElementById('placeOrder');
  if (!cartList || !placeOrderBtn) return;

  cartList.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    if (!target) return;

    const actionBtn = target.closest('[data-cart-action]');
    if (!actionBtn) return;

    const action = actionBtn.dataset.cartAction;
    const index = Number(actionBtn.dataset.cartIndex);
    const hasValidIndex = Number.isInteger(index) && index >= 0;

    let name = String(actionBtn.dataset.productName || '').trim();
    if (!name) {
      const nameNode = actionBtn
        .closest('.checkout-item-card')
        ?.querySelector('.checkout-item-name[data-product-name]');
      name = nameNode?.textContent?.trim() || '';
    }

    if (action === 'remove') {
      if (hasValidIndex) {
        removeItemByIndex(index);
        return;
      }
      if (name) removeItem(name);
      return;
    }

    if (!name) return;
    if (action === 'decrease') updateQty(name, -1);
    if (action === 'increase') updateQty(name, 1);
  });

  renderCart();
  placeOrderBtn.addEventListener('click', placeOrder);
});
