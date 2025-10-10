# 🍽️ MacroMunch - Fitness Bakery Management System

**MacroMunch** is a modern, full-stack web application for managing a fitness-focused food delivery service. Built with PHP, MySQL, and Vanilla JavaScript, it offers comprehensive features for both customers and administrators.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)

---

## ✨ Features

### 🛒 Customer Features

#### 1. **User Authentication**
- Secure registration with password hashing (bcrypt)
- Login/logout functionality with session management
- 30-minute session timeout for security
- Protected routes for authenticated users

#### 2. **Food Browsing & Search**
- Browse all available food items with images
- View detailed nutrition information (calories, protein, carbs, fats)
- Interactive hover tooltips showing complete nutrition facts
- Dynamic tooltip positioning (viewport-aware, never goes off-screen)
- Category filtering (snacks, beverages, meals, bars, desserts)
- Price display for each item

#### 3. **Shopping Cart**
- Add items to cart without login requirement
- View cart items with quantities and subtotals
- Remove items from cart
- Real-time cart count badge in navigation
- Cart persistence across sessions
- Empty cart state with helpful prompts

#### 4. **Order Management**
- Secure checkout (login required)
- Order placement with automatic status tracking
- **Persistent Order History** - Orders remain visible after checkout
- **Order Status Tracking** with color-coded badges:
  - ⏳ **Pending** (Orange) - Order received
  - 🔄 **Processing** (Blue) - Being prepared
  - ✅ **Delivered** (Green) - Successfully delivered
  - ❌ **Cancelled** (Red) - Order cancelled
- View complete order details (items, quantities, prices, timestamps)
- Order total calculations

#### 5. **Enhanced UI/UX**
- Featured products on homepage with images
- Responsive grid layouts
- Smooth animations and transitions
- Visual feedback for actions (add to cart, checkout success)
- Professional gradient designs
- Mobile-friendly interface

---

### 👨‍💼 Admin Features

#### 1. **Admin Dashboard**
- Secure admin-only access with role-based authentication
- Comprehensive food management interface
- Order management with status updates
- Real-time data synchronization

#### 2. **Food Management (CRUD)**
- **Create**: Add new food items with:
  - Name, category, price
  - Complete nutrition information (calories, protein, carbs, fats)
  - Image URLs (supports external hosting like Unsplash)
- **Read**: View all foods in a searchable table
- **Update**: Edit existing food details
- **Delete**: Remove food items with confirmation
- Form validation for all inputs

#### 3. **Order Management**
- View all customer orders in table format
- Real-time order status updates via dropdown
- Order details display:
  - Customer information (user_id)
  - Food item ordered
  - Quantity and total price
  - Order timestamp
  - Current status
- Instant status change functionality
- Color-coded status indicators

#### 4. **Image Management**
- URL-based image upload system
- Image preview in food cards
- Fallback handling for broken images
- Support for external CDN hosting (Unsplash, Imgur, etc.)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with:
  - CSS Grid & Flexbox layouts
  - Gradient backgrounds
  - Smooth transitions & animations
  - Responsive design
  - Fixed positioning for tooltips
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS:
  - Async/await for API calls
  - DOM manipulation
  - Event handling
  - Dynamic positioning calculations
  - Session management

### Backend
- **PHP 7.4+** - Server-side logic
- **PDO (PHP Data Objects)** - Database abstraction layer
- **MySQL** - Relational database
- **Session-based Authentication** - Secure user sessions

### Development Environment
- **XAMPP** - Local development stack
  - Apache Web Server
  - MySQL Database
  - PHP Interpreter
- **Git** - Version control

---

## 🏗️ Architecture

### Design Pattern: MVC (Model-View-Controller)

```
MacroMunch/
│
├── frontend/                    # View Layer
│   ├── index.html              # Homepage
│   ├── food-list.html          # Browse foods
│   ├── cart.html               # Shopping cart & order history
│   ├── login.html              # User login
│   ├── register.html           # User registration
│   ├── admin.html              # Admin dashboard
│   │
│   ├── css/
│   │   └── style.css           # Global styles (834+ lines)
│   │
│   └── js/
│       ├── app.js              # Global navigation & cart badge
│       ├── home.js             # Homepage logic & tooltips
│       ├── foods.js            # Food list page & tooltips
│       ├── cart.js             # Cart & order history logic
│       ├── auth.js             # Login/register forms
│       └── admin.js            # Admin dashboard logic
│
├── backend/                     # Controller & Model Layer
│   ├── controllers/
│   │   ├── foodController.php  # Public API (foods, cart, orders)
│   │   └── adminController.php # Admin API (CRUD, status updates)
│   │
│   ├── models/
│   │   ├── User.php            # User model & authentication
│   │   ├── Food.php            # Food model & queries
│   │   └── Admin.php           # Admin model & operations
│   │
│   ├── middleware/
│   │   └── AuthMiddleware.php  # Route protection
│   │
│   └── routes/
│       └── routes.php          # Authentication routes
│
└── database/
    ├── database.php            # PDO connection setup
    └── schema.sql              # Database structure & sample data
```

### Request Flow

```
User Request (Frontend)
    ↓
JavaScript Fetch API (AJAX)
    ↓
PHP Controller (Backend)
    ↓
PDO Model (Database Query)
    ↓
MySQL Database
    ↓
JSON Response
    ↓
JavaScript Render (Frontend)
    ↓
Updated UI (User sees result)
```

---

## 📦 Installation

### Prerequisites
- XAMPP (or LAMP/WAMP/MAMP)
- Web browser (Chrome, Firefox, Edge recommended)
- Git (optional, for cloning)

### Step-by-Step Setup

#### 1. **Clone or Download Project**
```bash
cd C:\xampp\htdocs
git clone https://github.com/k-mohan-7/MacroMunch.git
cd MacroMunch
```

#### 2. **Start XAMPP Services**
- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services

#### 3. **Create Database**
- Open phpMyAdmin: `http://localhost/phpmyadmin`
- Create new database named `macromunch`
- Import schema:
  - Click on `macromunch` database
  - Go to **SQL** tab
  - Copy and paste contents from `database/schema.sql`
  - Click **Go**

#### 4. **Update Database Configuration (if needed)**
Edit `database/database.php` if your MySQL credentials differ:
```php
$host = 'localhost';
$db = 'macromunch';
$user = 'root';         // Change if needed
$pass = '';             // Change if needed
```

#### 5. **Access Application**
- **Homepage**: `http://localhost/MacroMunch/frontend/index.html`
- **Browse Foods**: `http://localhost/MacroMunch/frontend/food-list.html`
- **Admin Panel**: `http://localhost/MacroMunch/frontend/admin.html`

#### 6. **Default Login Credentials**

**Customer Account:**
- Email: `user@test.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `admin123`

---

## 🗄️ Database Schema

### Tables Overview

#### 1. **users**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique user identifier
- `name`: User's full name
- `email`: Login email (unique)
- `password`: Bcrypt hashed password
- `role`: User role (user/admin)
- `created_at`: Registration timestamp

#### 2. **foods**
```sql
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    calories INT,
    protein INT,
    carbs INT,
    fats INT,
    image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique food identifier
- `name`: Food item name
- `category`: snacks/beverages/meals/bars/desserts
- `price`: Item price (decimal)
- `calories`: Calorie content
- `protein`: Protein grams
- `carbs`: Carbohydrate grams
- `fats`: Fat grams
- `image`: Image URL (external hosting)
- `created_at`: Item creation timestamp

#### 3. **orders**
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'delivered', 'cancelled') 
           NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (food_id) REFERENCES foods(id)
);
```

**Fields:**
- `id`: Unique order identifier
- `user_id`: Customer who placed order
- `food_id`: Ordered food item
- `quantity`: Number of items
- `timestamp`: Order placement time
- `status`: Current order status
- **Foreign Keys**: Ensures referential integrity

#### 4. **categories**
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
```

**Fields:**
- `id`: Unique category identifier
- `name`: Category name (unique)

---

## 🔌 API Endpoints

### Public API (`foodController.php`)

#### **GET** - List All Foods
```
GET /backend/controllers/foodController.php?action=listFoods
```
**Response:**
```json
[
    {
        "id": 1,
        "name": "Protein Cookie",
        "category": "snacks",
        "price": "3.50",
        "calories": 250,
        "protein": 20,
        "carbs": 30,
        "fats": 8,
        "image": "https://images.unsplash.com/..."
    }
]
```

#### **POST** - Add to Cart
```
POST /backend/controllers/foodController.php?action=addToCart
Content-Type: application/json

{
    "food_id": 1,
    "quantity": 2
}
```

#### **GET** - Get Cart
```
GET /backend/controllers/foodController.php?action=getCart
```
**Response:**
```json
{
    "items": [
        {
            "id": 1,
            "name": "Protein Cookie",
            "price": "3.50",
            "quantity": 2
        }
    ],
    "cart": {...}
}
```

#### **POST** - Remove from Cart
```
POST /backend/controllers/foodController.php?action=removeFromCart
Content-Type: application/json

{
    "food_id": 1
}
```

#### **POST** - Checkout
```
POST /backend/controllers/foodController.php?action=checkout
```
**Response:**
```json
{
    "success": true,
    "message": "Order placed successfully"
}
```

#### **GET** - Get User Orders
```
GET /backend/controllers/foodController.php?action=getUserOrders
```
**Response:**
```json
{
    "orders": [
        {
            "id": 1,
            "user_id": 2,
            "food_id": 1,
            "quantity": 2,
            "timestamp": "2025-10-10 14:30:00",
            "status": "pending",
            "name": "Protein Cookie",
            "price": "3.50",
            "image": "https://...",
            "calories": 250,
            "protein": 20,
            "carbs": 30,
            "fats": 8,
            "total": "7.00"
        }
    ]
}
```

---

### Admin API (`adminController.php`)

#### **GET** - List All Foods (Admin)
```
GET /backend/controllers/adminController.php?action=getFoods
```

#### **POST** - Add Food
```
POST /backend/controllers/adminController.php?action=addFood
Content-Type: application/json

{
    "name": "New Item",
    "category": "snacks",
    "price": 4.99,
    "calories": 300,
    "protein": 25,
    "carbs": 35,
    "fats": 10,
    "image": "https://example.com/image.jpg"
}
```

#### **POST** - Update Food
```
POST /backend/controllers/adminController.php?action=updateFood
Content-Type: application/json

{
    "id": 1,
    "name": "Updated Name",
    "category": "bars",
    ...
}
```

#### **POST** - Delete Food
```
POST /backend/controllers/adminController.php?action=deleteFood
Content-Type: application/json

{
    "id": 1
}
```

#### **GET** - Get All Orders
```
GET /backend/controllers/adminController.php?action=getOrders
```

#### **POST** - Update Order Status
```
POST /backend/controllers/adminController.php?action=updateOrderStatus
Content-Type: application/json

{
    "order_id": 1,
    "status": "delivered"
}
```

---

### Authentication API (`routes.php`)

#### **POST** - Register
```
POST /backend/routes/routes.php?action=register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
}
```

#### **POST** - Login
```
POST /backend/routes/routes.php?action=login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "secure123"
}
```

#### **POST** - Logout
```
POST /backend/routes/routes.php?action=logout
```

#### **GET** - Check Session
```
GET /backend/routes/routes.php?action=session
```
**Response:**
```json
{
    "loggedIn": true,
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    }
}
```

---

## 🔒 Security Features

### 1. **Password Security**
- **Bcrypt Hashing**: All passwords hashed with `password_hash()` and `PASSWORD_BCRYPT`
- **Salt Included**: Automatic salt generation
- **No Plain Text**: Passwords never stored or transmitted in plain text

### 2. **SQL Injection Prevention**
- **Prepared Statements**: All queries use PDO prepared statements with parameter binding
- **Example:**
```php
$stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
```

### 3. **Session Management**
- **Secure Sessions**: PHP session management with server-side storage
- **Session Timeout**: Automatic 30-minute expiration
- **Session Regeneration**: ID regenerated on login to prevent fixation attacks

### 4. **Role-Based Access Control (RBAC)**
- **User Roles**: `user` and `admin` roles in database
- **Route Protection**: `AuthMiddleware::requireAdmin()` for admin routes
- **Frontend Guards**: JavaScript checks for login status before sensitive operations

### 5. **Input Validation**
- **Frontend**: HTML5 form validation (required, type, pattern)
- **Backend**: PHP validation before database operations
- **Sanitization**: PDO parameter binding prevents injection

### 6. **CORS & Headers**
- **JSON Content-Type**: All API responses use proper headers
- **Error Handling**: Generic error messages to prevent information disclosure

---

## 📖 Usage Guide

### For Customers

#### 1. **Register an Account**
- Navigate to Register page
- Fill in name, email, password
- Click "Register"

#### 2. **Browse Foods**
- Visit "Foods" page
- Hover over nutrition info for detailed macros
- View images and prices

#### 3. **Add to Cart**
- Click "Add to Cart" on any food item
- See confirmation feedback
- Cart badge updates automatically

#### 4. **Checkout**
- Go to Cart page
- Review items and total
- Click "Checkout" (login required)
- Receive order confirmation

#### 5. **Track Orders**
- View "Order History" section on Cart page
- See all past orders with status badges
- Monitor order status changes (pending → processing → delivered)

---

### For Admins

#### 1. **Login to Admin Panel**
- Navigate to `/frontend/admin.html`
- Login with admin credentials

#### 2. **Manage Foods**
- **Add**: Click "Add New Food", fill form, submit
- **Edit**: Click "Edit" on any food row, modify, save
- **Delete**: Click "Delete", confirm action

#### 3. **Manage Orders**
- View all customer orders in table
- Change status via dropdown (pending/processing/delivered/cancelled)
- Status updates immediately

#### 4. **Image Management**
- Use external image URLs (Unsplash, Imgur, etc.)
- Paste URL in image field when adding/editing foods
- Images automatically display with fallback handling

---

## 🎨 Key Implementation Methods

### 1. **Dynamic Tooltip Positioning**
**Method**: Viewport-aware JavaScript calculations

```javascript
// Calculate optimal position based on viewport
const rect = element.getBoundingClientRect();
const tooltipWidth = 280;
const spacing = 15;

// Prefer right side
let leftPos = rect.right + spacing;

// Check if off-screen, flip to left
if (leftPos + tooltipWidth > window.innerWidth) {
    leftPos = rect.left - tooltipWidth - spacing;
}

// Apply calculated position
tooltip.style.left = leftPos + 'px';
tooltip.style.top = (rect.top + window.scrollY) + 'px';
```

**Benefits:**
- Never goes off-screen
- Consistent alignment
- Smooth transitions
- Works with scrolling

---

### 2. **Order Persistence System**
**Method**: Separate orders table with status tracking

**Flow:**
1. User adds items to cart (session storage)
2. Checkout creates order records in `orders` table
3. Cart clears, but orders remain in database
4. Order history fetches with JOIN query
5. Status updates via admin panel
6. Users see live status changes

**SQL Query:**
```sql
SELECT o.*, f.name, f.price, f.image, f.calories, f.protein, f.carbs, f.fats,
       (o.quantity * f.price) as total
FROM orders o
JOIN foods f ON o.food_id = f.id
WHERE o.user_id = ?
ORDER BY o.timestamp DESC
```

---

### 3. **Real-Time Cart Badge Updates**
**Method**: Global function with event-driven updates

```javascript
// Global function accessible across pages
window.updateGlobalCartBadge = async function() {
    const res = await fetch('...?action=getCart');
    const data = await res.json();
    const count = data.items.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
};

// Call after any cart modification
await addToCart(foodId);
if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
```

---

### 4. **Secure Authentication Flow**
**Method**: Session-based with bcrypt hashing

**Registration:**
```php
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
$stmt->execute([$name, $email, $hashedPassword]);
```

**Login:**
```php
$stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    // Success
}
```

---

### 5. **Admin Role Protection**
**Method**: Middleware class with role checking

```php
class AuthMiddleware {
    public static function requireAdmin() {
        session_start();
        
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        
        if ($_SESSION['user_role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden - Admin access required']);
            exit;
        }
    }
}

// Usage in controller
AuthMiddleware::requireAdmin();
```

---

## 🎯 Features Showcase

### ✅ Completed Features

1. ✅ **User Authentication System**
   - Registration with validation
   - Secure login with bcrypt
   - Session management
   - Role-based access

2. ✅ **Food Catalog with Images**
   - 15+ pre-loaded items
   - Unsplash CDN integration
   - Category organization
   - Nutrition display

3. ✅ **Interactive Tooltips**
   - Hover-triggered nutrition facts
   - Dynamic viewport positioning
   - Smooth animations
   - Never goes off-screen

4. ✅ **Shopping Cart System**
   - Add/remove items
   - Quantity management
   - Real-time badge updates
   - Session persistence

5. ✅ **Order Tracking System**
   - Persistent order history
   - 4-state status tracking
   - Color-coded badges
   - Timestamp display

6. ✅ **Admin Dashboard**
   - Complete CRUD operations
   - Order status management
   - Real-time updates
   - Secure access control

7. ✅ **Responsive Design**
   - Mobile-friendly layouts
   - Flexible grids
   - Touch-friendly buttons
   - Adaptive tooltips

---

## 🚀 Future Enhancements

- [ ] Advanced search and filtering
- [ ] User profile management
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Order invoice generation
- [ ] Multi-item checkout optimization
- [ ] Admin analytics dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Promo codes and discounts

---

## 📝 License

This project is created for educational purposes.

---

## 👨‍💻 Developer

**K Mohan**
- GitHub: [@k-mohan-7](https://github.com/k-mohan-7)

---

## 📞 Support

For issues or questions:
1. Check the documentation above
2. Review code comments
3. Open an issue on GitHub
4. Contact developer

---

## 🙏 Acknowledgments

- **Unsplash** - High-quality food images
- **XAMPP** - Local development environment
- **PHP Community** - Excellent documentation
- **MDN Web Docs** - JavaScript reference

---

**Built with ❤️ and PHP**
