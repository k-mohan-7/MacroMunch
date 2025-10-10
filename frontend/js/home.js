/**
 * Homepage Script - Load and display featured products
 */

async function loadFeaturedFoods() {
  try {
    // Fetch all foods
    const response = await fetch('/MacroMunch/backend/controllers/foodController.php?action=listFoods');
    const foods = await response.json();
    
    // Get first 6 foods as featured (you can customize this logic)
    const featuredFoods = foods.slice(0, 6);
    
    const grid = document.getElementById('featuredGrid');
    grid.innerHTML = '';
    
    featuredFoods.forEach(food => {
      const card = createFeaturedCard(food);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading featured foods:', error);
  }
}

function createFeaturedCard(food) {
  const div = document.createElement('div');
  div.className = 'card food-card featured-card';
  
  div.innerHTML = `
    ${food.image ? `<img src="${food.image}" alt="${food.name}" class="food-image" onerror="this.style.display='none'">` : ''}
    <div class="food-content">
      <h3>${food.name}</h3>
      <div class="food-macros nutrition-hover">${food.calories} kcal · ${food.protein}g protein</div>
      <div class="food-price">$${Number(food.price).toFixed(2)}</div>
      <button class="btn btn-primary" data-id="${food.id}">Add to Cart</button>
    </div>
    <div class="nutrition-tooltip">
      <div class="tooltip-header">📊 Nutrition Facts</div>
      <div class="tooltip-row"><span>Calories</span><strong>${food.calories} kcal</strong></div>
      <div class="tooltip-row"><span>Protein</span><strong>${food.protein}g</strong></div>
      <div class="tooltip-row"><span>Carbs</span><strong>${food.carbs}g</strong></div>
      <div class="tooltip-row"><span>Fats</span><strong>${food.fats}g</strong></div>
    </div>
  `;
  
  // Add hover functionality for tooltip with dynamic positioning
  const macrosDiv = div.querySelector('.nutrition-hover');
  const tooltip = div.querySelector('.nutrition-tooltip');
  
  macrosDiv.addEventListener('mouseenter', () => {
    const rect = macrosDiv.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 220;
    const spacing = 15;
    
    // Calculate horizontal position (prefer right side)
    let leftPos = rect.right + spacing;
    
    // Check if tooltip would go off-screen on the right
    if (leftPos + tooltipWidth > window.innerWidth) {
      // Position on left side instead
      leftPos = rect.left - tooltipWidth - spacing;
      
      // If still off-screen on the left, align with left edge of viewport
      if (leftPos < 0) {
        leftPos = spacing;
      }
    }
    
    // Calculate vertical position (align with the top of the hovered element)
    let topPos = rect.top + window.scrollY;
    
    // Check if tooltip would go off-screen at the bottom
    if (topPos + tooltipHeight > window.innerHeight + window.scrollY) {
      topPos = window.innerHeight + window.scrollY - tooltipHeight - spacing;
    }
    
    // Ensure tooltip doesn't go above viewport
    if (topPos < window.scrollY) {
      topPos = window.scrollY + spacing;
    }
    
    tooltip.style.left = leftPos + 'px';
    tooltip.style.top = topPos + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
    tooltip.style.transform = 'scale(1) translateX(0)';
  });
  
  macrosDiv.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transform = 'scale(0.95) translateX(-10px)';
  });
  
  div.querySelector('button').addEventListener('click', async (e) => {
    const btn = e.target;
    const originalText = btn.textContent;
    
    try {
      const res = await fetch('/MacroMunch/backend/controllers/foodController.php?action=addToCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_id: food.id, quantity: 1 })
      }).then(r => r.json());
      
      if (res.success) {
        btn.textContent = '✓ Added!';
        btn.style.background = '#48bb78';
        updateCartCount();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 2000);
      } else {
        alert(res.message || 'Could not add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. Please try again.');
    }
  });
  
  return div;
}

async function updateCartCount() {
  try {
    const response = await fetch('/MacroMunch/backend/controllers/foodController.php?action=getCart', {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.cart && data.cart.length > 0) {
      const totalItems = data.cart.reduce((sum, item) => sum + item.quantity, 0);
      updateCartBadge(totalItems);
    }
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

function updateCartBadge(count) {
  const cartLink = document.getElementById('cartLink');
  if (!cartLink) return;
  
  let badge = cartLink.querySelector('.cart-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    cartLink.appendChild(badge);
  }
  
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// Load featured foods on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedFoods();
  updateCartCount();
});
