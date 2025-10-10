async function getCart() { const r = await fetch('/MacroMunch/backend/controllers/foodController.php?action=getCart'); return r.json(); }
async function getUserOrders() { const r = await fetch('/MacroMunch/backend/controllers/foodController.php?action=getUserOrders'); return r.json(); }
async function checkout() {
  const r = await fetch('/MacroMunch/backend/controllers/foodController.php?action=checkout', { method: 'POST' });
  return r.json();
}

function render(cart) {
  const items = document.getElementById('cartItems');
  const totals = document.getElementById('cartTotals');
  
  if (cart.items.length === 0) {
    items.innerHTML = '<p class="empty-state">Your cart is empty. <a href="/MacroMunch/frontend/food-list.html">Browse foods</a></p>';
    totals.textContent = '';
    document.getElementById('checkoutBtn').disabled = true;
    document.getElementById('checkoutBtn').style.opacity = '0.5';
    return;
  }
  
  items.innerHTML = '';
  let subtotal = 0;
  cart.items.forEach(row => {
    const div = document.createElement('div');
    div.className = 'cart-item card';
    subtotal += Number(row.price) * Number(row.quantity);
    div.innerHTML = `
      <div><strong>${row.name}</strong><div class="food-macros">$${Number(row.price).toFixed(2)} × ${row.quantity}</div></div>
      <div>$${(Number(row.price) * Number(row.quantity)).toFixed(2)}</div>
      <button class="btn btn-danger" data-id="${row.id}">Remove</button>
    `;
    div.querySelector('button').addEventListener('click', async () => {
      await fetch('/MacroMunch/backend/controllers/foodController.php?action=removeFromCart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ food_id: row.id }) });
      init();
      if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
    });
    items.append(div);
  });
  totals.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
  document.getElementById('checkoutBtn').disabled = false;
  document.getElementById('checkoutBtn').style.opacity = '1';
}

function renderOrderHistory(orders) {
  const container = document.getElementById('orderHistory');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders yet. Place your first order!</p>';
    return;
  }
  
  container.innerHTML = '';
  
  orders.forEach(order => {
    const div = document.createElement('div');
    div.className = 'order-item card';
    
    const statusBadge = getStatusBadge(order.status);
    const orderDate = new Date(order.timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    div.innerHTML = `
      ${order.image ? `<img src="${order.image}" alt="${order.name}" class="order-image" onerror="this.style.display='none'">` : ''}
      <div class="order-details">
        <div class="order-header">
          <strong>${order.name}</strong>
          ${statusBadge}
        </div>
        <div class="order-meta">
          <span class="food-macros">Qty: ${order.quantity} × $${Number(order.price).toFixed(2)}</span>
          <span class="order-date">📅 ${orderDate}</span>
        </div>
        <div class="order-nutrition">
          ${order.calories} kcal · P${order.protein}g C${order.carbs}g F${order.fats}g
        </div>
        <div class="order-total">Total: $${Number(order.total).toFixed(2)}</div>
      </div>
    `;
    
    container.append(div);
  });
}

function getStatusBadge(status) {
  const badges = {
    'pending': '<span class="status-badge status-pending">⏳ Pending</span>',
    'processing': '<span class="status-badge status-processing">🔄 Processing</span>',
    'delivered': '<span class="status-badge status-delivered">✅ Delivered</span>',
    'cancelled': '<span class="status-badge status-cancelled">❌ Cancelled</span>'
  };
  return badges[status] || `<span class="status-badge">${status}</span>`;
}

async function init() {
  const c = await getCart();
  render(c);
  
  const ordersData = await getUserOrders();
  renderOrderHistory(ordersData.orders);
}

async function checkLoginStatus() {
  try {
    const res = await fetch('/MacroMunch/backend/routes/routes.php?action=session');
    const data = await res.json();
    return data.loggedIn || false;
  } catch {
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  const btn = document.getElementById('checkoutBtn');
  btn.addEventListener('click', async () => {
    // Check if user is logged in
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
      const shouldLogin = confirm('You must be logged in to checkout. Would you like to login now?');
      if (shouldLogin) {
        window.location.href = '/MacroMunch/frontend/login.html?redirect=cart';
      }
      return;
    }
    
    // Proceed with checkout
    const res = await checkout();
    if (res.success) {
      alert('Order placed successfully!');
      init();
      if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
    } else alert(res.message || 'Checkout failed');
  });
});


