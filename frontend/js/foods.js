async function fetchJSON(url) { const r = await fetch(url); return r.json(); }
function createOption(value, text) { const o = document.createElement('option'); o.value = value; o.textContent = text; return o; }

function foodCard(food) {
  const div = document.createElement('div');
  div.className = 'card food-card';
  const microsDisplay = food.micros && food.micros.trim() ? `<div class="food-micros">${food.micros}</div>` : '';
  
  // Create detailed nutrition tooltip
  const tooltipContent = `
    <div class="nutrition-tooltip">
      <h4>Nutritional Information</h4>
      <div class="calories-highlight">${food.calories} Calories</div>
      <div class="nutrition-section">
        <div class="nutrition-label">Macronutrients</div>
        <div class="nutrition-value">
          • Protein: ${food.protein}g<br>
          • Carbohydrates: ${food.carbs}g<br>
          • Fats: ${food.fats}g
        </div>
      </div>
      ${food.micros && food.micros.trim() ? `
      <div class="nutrition-section">
        <div class="nutrition-label">Micronutrients</div>
        <div class="nutrition-value">${food.micros}</div>
      </div>` : ''}
      <div class="nutrition-section">
        <div class="nutrition-label">Price</div>
        <div class="nutrition-value">$${Number(food.price).toFixed(2)}</div>
      </div>
    </div>
  `;
  
  div.innerHTML = `
    ${food.image ? `<img src="${food.image}" alt="${food.name}" class="food-image" onerror="this.style.display='none'">` : ''}
    <div class="food-content">
      <h3>${food.name}</h3>
      <div class="food-macros">${food.calories} kcal · P${food.protein}g C${food.carbs}g F${food.fats}g</div>
      ${microsDisplay}
      <div class="food-price">$${Number(food.price).toFixed(2)}</div>
      <button class="btn" data-id="${food.id}">Add to Cart</button>
    </div>
    ${tooltipContent}
  `;
  // Position tooltip dynamically on hover
  div.addEventListener('mouseenter', (e) => {
    const tooltip = div.querySelector('.nutrition-tooltip');
    if (!tooltip) return;
    const rect = div.getBoundingClientRect();
    const tooltipWidth = 300;
    const spacing = 15;
    
    // Position to the right of the card
    let leftPos = rect.right + spacing;
    
    // If tooltip would go off screen right side, position to the left
    if (leftPos + tooltipWidth > window.innerWidth) {
      leftPos = rect.left - tooltipWidth - spacing;
    }
    
    // Keep tooltip within viewport vertically
    let topPos = rect.top + window.scrollY;
    const tooltipHeight = 400; // estimated height
    if (topPos + tooltipHeight > window.innerHeight + window.scrollY) {
      topPos = window.innerHeight + window.scrollY - tooltipHeight - 20;
    }
    
    tooltip.style.left = `${leftPos}px`;
    tooltip.style.top = `${topPos}px`;
  });
  
  div.querySelector('button').addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent tooltip interaction
    const btn = e.target;
    const originalText = btn.textContent;
    const res = await fetch('/MacroMunch/backend/controllers/foodController.php?action=addToCart', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ food_id: food.id, quantity: 1 })
    }).then(r => r.json());
    if (res.success) {
      btn.textContent = '✓ Added!';
      btn.style.background = '#48bb78';
      if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    } else {
      alert(res.message || 'Could not add to cart');
    }
  });
  return div;
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get('category');

  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  const grid = document.getElementById('foodGrid');

  const cats = await fetchJSON('/MacroMunch/backend/controllers/foodController.php?action=listCategories');
  categoryFilter.append(createOption('', 'All'));
  cats.forEach(c => categoryFilter.append(createOption(c.id, c.name)));
  if (categoryQuery) {
    const pre = cats.find(c => c.name.toLowerCase() === categoryQuery);
    if (pre) categoryFilter.value = String(pre.id);
  }

  async function loadFoods() {
    const q = searchInput.value.trim();
    const c = categoryFilter.value;
    const url = `/MacroMunch/backend/controllers/foodController.php?action=listFoods&category_id=${encodeURIComponent(c)}&q=${encodeURIComponent(q)}`;
    const foods = await fetchJSON(url);
    grid.innerHTML = '';
    foods.forEach(f => grid.append(foodCard(f)));
  }

  categoryFilter.addEventListener('change', loadFoods);
  searchInput.addEventListener('input', () => { clearTimeout(window.__t); window.__t = setTimeout(loadFoods, 250); });
  loadFoods();
});


