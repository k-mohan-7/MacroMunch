// Basic site-wide helpers
(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Update auth/cart links based on session
  const authLink = document.getElementById('authLink');
  const cartLink = document.getElementById('cartLink');

  fetch('/MacroMunch/backend/routes/routes.php?action=session').then(r => r.json()).then(s => {
    if (authLink) authLink.textContent = s?.user ? 'Account' : 'Login';
    if (authLink) authLink.href = s?.user ? '/MacroMunch/frontend/index.html' : '/MacroMunch/frontend/login.html';
    
    // Update cart with badge
    updateGlobalCartBadge();
    
    // Show admin link if user is admin
    if (s?.user && s.user.role === 'admin') {
      const nav = document.querySelector('.nav');
      if (nav && !document.getElementById('adminNavLink')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'adminNavLink';
        adminLink.href = '/MacroMunch/frontend/admin.html';
        adminLink.textContent = '⚙️ Admin';
        adminLink.style.color = 'var(--accent)';
        adminLink.style.fontWeight = '600';
        
        // Insert before cart link
        if (cartLink) {
          nav.insertBefore(adminLink, cartLink);
        } else {
          nav.appendChild(adminLink);
        }
      }
    }
  }).catch(() => {});
})();

// Global cart badge update function
async function updateGlobalCartBadge() {
  const cartLink = document.getElementById('cartLink');
  if (!cartLink) return;
  
  try {
    const response = await fetch('/MacroMunch/backend/controllers/foodController.php?action=getCart', {
      credentials: 'include'
    });
    const data = await response.json();
    
    let totalItems = 0;
    if (data.cart && data.cart.length > 0) {
      totalItems = data.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // Remove old badge if exists
    const oldBadge = cartLink.querySelector('.cart-badge');
    if (oldBadge) oldBadge.remove();
    
    // Add new badge
    if (totalItems > 0) {
      const badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.textContent = totalItems;
      cartLink.appendChild(badge);
      cartLink.style.position = 'relative';
    }
  } catch (error) {
    console.error('Error updating cart badge:', error);
  }
}

// Make it globally available
window.updateGlobalCartBadge = updateGlobalCartBadge;


