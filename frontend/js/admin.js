/**
 * MacroMunch Admin Portal
 * Comprehensive admin dashboard with security and UX best practices
 */

// ============ API Helper Functions ============
const API_BASE = '/MacroMunch/backend/controllers';

async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function confirmAction(message) {
  return confirm(message);
}

// ============ Navigation ============
function initNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const sections = document.querySelectorAll('.admin-section');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const sectionId = item.dataset.section;
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update active section
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(`${sectionId}-section`).classList.add('active');
      
      // Load section data
      loadSectionData(sectionId);
    });
  });
}

async function loadSectionData(section) {
  switch(section) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'foods':
      await loadFoods();
      break;
    case 'categories':
      await loadCategories();
      break;
    case 'users':
      await loadUsers();
      break;
    case 'orders':
      await loadOrders();
      break;
  }
}

// ============ Dashboard ============
async function loadDashboard() {
  try {
    const response = await apiCall(`${API_BASE}/adminController.php?action=getStats`);
    const stats = response.data;
    
    // Update stat cards
    document.getElementById('statUsers').textContent = stats.totalUsers;
    document.getElementById('statFoods').textContent = stats.totalFoods;
    document.getElementById('statOrders').textContent = stats.totalOrders;
    document.getElementById('statCategories').textContent = stats.totalCategories;
    
    // Render recent orders
    renderRecentOrders(stats.recentOrders);
  } catch (error) {
    showNotification('Failed to load dashboard: ' + error.message, 'error');
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrdersContainer');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No recent orders</p>';
    return;
  }
  
  const table = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Food Item</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>#${order.id}</td>
            <td>${order.user_name}<br><small>${order.email}</small></td>
            <td>${order.food_name}</td>
            <td>${order.quantity}</td>
            <td>$${(order.quantity * order.price).toFixed(2)}</td>
            <td>${new Date(order.timestamp).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
}

// ============ Foods Management ============
let allCategories = [];

async function loadFoods() {
  try {
    const [foodsRes, catsRes] = await Promise.all([
      apiCall(`${API_BASE}/adminController.php?action=getAllFoods`),
      apiCall(`${API_BASE}/adminController.php?action=getAllCategories`)
    ]);
    
    allCategories = catsRes.data;
    renderFoodsTable(foodsRes.data);
  } catch (error) {
    showNotification('Failed to load foods: ' + error.message, 'error');
  }
}

function renderFoodsTable(foods) {
  const container = document.getElementById('foodsTableContainer');
  
  if (!foods || foods.length === 0) {
    container.innerHTML = '<p class="empty-state">No food items found. Click "Add New Food" to get started.</p>';
    return;
  }
  
  const table = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Calories</th>
          <th>Macros (P/C/F)</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${foods.map(food => `
          <tr>
            <td>${food.id}</td>
            <td><strong>${food.name}</strong></td>
            <td><span class="badge">${food.category_name || 'N/A'}</span></td>
            <td>${food.calories} kcal</td>
            <td>${food.protein}g / ${food.carbs}g / ${food.fats}g</td>
            <td>$${Number(food.price).toFixed(2)}</td>
            <td>
              <button class="btn-icon" onclick="editFood(${food.id})" title="Edit">✏️</button>
              <button class="btn-icon" onclick="deleteFood(${food.id}, '${food.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
}

function openFoodModal(food = null) {
  const modal = document.getElementById('foodModal');
  const title = document.getElementById('foodModalTitle');
  const form = document.getElementById('foodForm');
  
  // Reset form
  form.reset();
  document.getElementById('foodId').value = '';
  
  // Populate category dropdown
  const categorySelect = document.getElementById('foodCategory');
  categorySelect.innerHTML = allCategories.map(cat => 
    `<option value="${cat.id}">${cat.name}</option>`
  ).join('');
  
  if (food) {
    // Edit mode
    title.textContent = 'Edit Food Item';
    document.getElementById('foodId').value = food.id;
    document.getElementById('foodName').value = food.name;
    document.getElementById('foodCategory').value = food.category_id;
    document.getElementById('foodCalories').value = food.calories;
    document.getElementById('foodPrice').value = food.price;
    document.getElementById('foodProtein').value = food.protein;
    document.getElementById('foodCarbs').value = food.carbs;
    document.getElementById('foodFats').value = food.fats;
    document.getElementById('foodMicros').value = food.micros || '';
    document.getElementById('foodImage').value = food.image || '';
  } else {
    // Add mode
    title.textContent = 'Add New Food';
  }
  
  modal.classList.add('show');
}

function closeFoodModal() {
  document.getElementById('foodModal').classList.remove('show');
}

async function saveFoodForm(e) {
  e.preventDefault();
  
  const foodId = document.getElementById('foodId').value;
  const foodData = {
    name: document.getElementById('foodName').value,
    category_id: document.getElementById('foodCategory').value,
    calories: document.getElementById('foodCalories').value,
    price: document.getElementById('foodPrice').value,
    protein: document.getElementById('foodProtein').value,
    carbs: document.getElementById('foodCarbs').value,
    fats: document.getElementById('foodFats').value,
    micros: document.getElementById('foodMicros').value,
    image: document.getElementById('foodImage').value
  };
  
  try {
    if (foodId) {
      // Update
      foodData.id = foodId;
      await apiCall(`${API_BASE}/adminController.php?action=updateFood`, {
        method: 'POST',
        body: JSON.stringify(foodData)
      });
      showNotification('Food item updated successfully');
    } else {
      // Create
      await apiCall(`${API_BASE}/adminController.php?action=addFood`, {
        method: 'POST',
        body: JSON.stringify(foodData)
      });
      showNotification('Food item added successfully');
    }
    
    closeFoodModal();
    await loadFoods();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function editFood(id) {
  try {
    const response = await apiCall(`${API_BASE}/adminController.php?action=getAllFoods`);
    const food = response.data.find(f => f.id == id);
    if (food) {
      openFoodModal(food);
    }
  } catch (error) {
    showNotification('Error loading food: ' + error.message, 'error');
  }
}

async function deleteFood(id, name) {
  if (!confirmAction(`Are you sure you want to delete "${name}"?`)) {
    return;
  }
  
  try {
    await apiCall(`${API_BASE}/adminController.php?action=deleteFood`, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    showNotification('Food item deleted successfully');
    await loadFoods();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ============ Categories Management ============
async function loadCategories() {
  try {
    const response = await apiCall(`${API_BASE}/adminController.php?action=getAllCategories`);
    renderCategoriesTable(response.data);
  } catch (error) {
    showNotification('Failed to load categories: ' + error.message, 'error');
  }
}

function renderCategoriesTable(categories) {
  const container = document.getElementById('categoriesTableContainer');
  
  if (!categories || categories.length === 0) {
    container.innerHTML = '<p class="empty-state">No categories found.</p>';
    return;
  }
  
  const table = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${categories.map(cat => `
          <tr>
            <td>${cat.id}</td>
            <td><strong>${cat.name}</strong></td>
            <td>
              <button class="btn-icon" onclick="deleteCategory(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
}

function openCategoryModal() {
  document.getElementById('categoryModal').classList.add('show');
  document.getElementById('categoryForm').reset();
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('show');
}

async function saveCategoryForm(e) {
  e.preventDefault();
  
  const name = document.getElementById('categoryName').value;
  
  try {
    await apiCall(`${API_BASE}/adminController.php?action=addCategory`, {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    showNotification('Category added successfully');
    closeCategoryModal();
    await loadCategories();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function deleteCategory(id, name) {
  if (!confirmAction(`Are you sure you want to delete "${name}" category?`)) {
    return;
  }
  
  try {
    await apiCall(`${API_BASE}/adminController.php?action=deleteCategory`, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    showNotification('Category deleted successfully');
    await loadCategories();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ============ Users Management ============
async function loadUsers() {
  try {
    const response = await apiCall(`${API_BASE}/adminController.php?action=getAllUsers`);
    renderUsersTable(response.data);
  } catch (error) {
    showNotification('Failed to load users: ' + error.message, 'error');
  }
}

function renderUsersTable(users) {
  const container = document.getElementById('usersTableContainer');
  
  if (!users || users.length === 0) {
    container.innerHTML = '<p class="empty-state">No users found.</p>';
    return;
  }
  
  const table = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Orders</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>
              <select onchange="updateUserRole(${user.id}, this.value)" class="role-select">
                <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              </select>
            </td>
            <td>${user.order_count || 0}</td>
            <td>
              <button class="btn-icon" onclick="deleteUser(${user.id}, '${user.name.replace(/'/g, "\\'")}')" title="Delete">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
}

async function updateUserRole(userId, role) {
  try {
    await apiCall(`${API_BASE}/adminController.php?action=updateUserRole`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role })
    });
    showNotification('User role updated successfully');
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
    await loadUsers(); // Reload to reset the dropdown
  }
}

async function deleteUser(id, name) {
  if (!confirmAction(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    await apiCall(`${API_BASE}/adminController.php?action=deleteUser`, {
      method: 'POST',
      body: JSON.stringify({ user_id: id })
    });
    showNotification('User deleted successfully');
    await loadUsers();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// ============ Orders Management ============
async function loadOrders() {
  try {
    const response = await apiCall(`${API_BASE}/adminController.php?action=getAllOrders`);
    renderOrdersTable(response.data);
  } catch (error) {
    showNotification('Failed to load orders: ' + error.message, 'error');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiCall(`${API_BASE}/adminController.php?action=updateOrderStatus`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, status })
    });
    showNotification(`Order #${orderId} status updated to ${status}`);
    await loadOrders(); // Reload to update dashboard stats
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
    await loadOrders(); // Reload to reset the dropdown
  }
}

function renderOrdersTable(orders) {
  const container = document.getElementById('ordersTableContainer');
  
  if (!orders || orders.length === 0) {
    container.innerHTML = '<p class="empty-state">No orders found.</p>';
    return;
  }
  
  const getStatusBadge = (status) => {
    const badges = {
      'pending': '<span class="badge badge-warning">Pending</span>',
      'processing': '<span class="badge badge-info">Processing</span>',
      'delivered': '<span class="badge badge-success">Delivered</span>',
      'cancelled': '<span class="badge badge-danger">Cancelled</span>'
    };
    return badges[status] || status;
  };
  
  const table = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Food Item</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>#${order.id}</td>
            <td>
              <strong>${order.user_name}</strong><br>
              <small>${order.email}</small>
            </td>
            <td>${order.food_name}</td>
            <td>${order.quantity}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
              <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>${new Date(order.timestamp).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = table;
}

// ============ Authentication ============
async function checkAuth() {
  try {
    const response = await apiCall('/MacroMunch/backend/routes/routes.php?action=session');
    
    if (!response.user || response.user.role !== 'admin') {
      window.location.href = '/MacroMunch/frontend/login.html';
      return false;
    }
    
    // Display user name
    const userName = document.getElementById('adminUserName');
    if (userName) {
      userName.textContent = `👋 ${response.user.name}`;
    }
    
    return true;
  } catch (error) {
    window.location.href = '/MacroMunch/frontend/login.html';
    return false;
  }
}

async function logout() {
  if (confirmAction('Are you sure you want to logout?')) {
    try {
      await fetch('/MacroMunch/backend/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/MacroMunch/frontend/login.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/MacroMunch/frontend/login.html';
    }
  }
}

// ============ Initialization ============
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuth = await checkAuth();
  if (!isAuth) return;
  
  // Set year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Initialize navigation
  initNavigation();
  
  // Load initial dashboard
  await loadDashboard();
  
  // Event Listeners
  document.getElementById('addFoodBtn')?.addEventListener('click', () => openFoodModal());
  document.getElementById('closeFoodModal')?.addEventListener('click', closeFoodModal);
  document.getElementById('cancelFoodBtn')?.addEventListener('click', closeFoodModal);
  document.getElementById('foodForm')?.addEventListener('submit', saveFoodForm);
  
  document.getElementById('addCategoryBtn')?.addEventListener('click', openCategoryModal);
  document.getElementById('closeCategoryModal')?.addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryBtn')?.addEventListener('click', closeCategoryModal);
  document.getElementById('categoryForm')?.addEventListener('submit', saveCategoryForm);
  
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
  
  // Close modals on background click
  document.getElementById('foodModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'foodModal') closeFoodModal();
  });
  document.getElementById('categoryModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') closeCategoryModal();
  });
});

// Make functions globally available
window.editFood = editFood;
window.deleteFood = deleteFood;
window.deleteCategory = deleteCategory;
window.updateUserRole = updateUserRole;
window.deleteUser = deleteUser;
window.updateOrderStatus = updateOrderStatus;
