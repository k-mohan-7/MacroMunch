<?php
/**
 * Admin Controller
 * Handles all administrative operations with proper security and validation
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../database/database.php';
require_once __DIR__ . '/../User.php';
require_once __DIR__ . '/../Food.php';

// Initialize database connection
$db = (new Database())->getConnection();
$action = $_GET['action'] ?? '';

try {
    // All admin actions require admin role
    $currentUser = AuthMiddleware::requireAdmin();
    
    switch ($action) {
        // ============ DASHBOARD STATS ============
        case 'getStats':
            $stats = [];
            
            // Total users
            $stmt = $db->query('SELECT COUNT(*) as count FROM users');
            $stats['totalUsers'] = $stmt->fetch()['count'];
            
            // Total foods
            $stmt = $db->query('SELECT COUNT(*) as count FROM foods');
            $stats['totalFoods'] = $stmt->fetch()['count'];
            
            // Total orders
            $stmt = $db->query('SELECT COUNT(*) as count FROM orders');
            $stats['totalOrders'] = $stmt->fetch()['count'];
            
            // Total categories
            $stmt = $db->query('SELECT COUNT(*) as count FROM categories');
            $stats['totalCategories'] = $stmt->fetch()['count'];
            
            // Recent orders (last 10)
            $stmt = $db->query('
                SELECT o.*, u.name as user_name, u.email, f.name as food_name, f.price
                FROM orders o
                JOIN users u ON o.user_id = u.id
                JOIN foods f ON o.food_id = f.id
                ORDER BY o.timestamp DESC
                LIMIT 10
            ');
            $stats['recentOrders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $stats]);
            break;
            
        // ============ FOOD MANAGEMENT ============
        case 'getAllFoods':
            $stmt = $db->query('
                SELECT f.*, c.name as category_name 
                FROM foods f 
                LEFT JOIN categories c ON f.category_id = c.id 
                ORDER BY f.id DESC
            ');
            $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $foods]);
            break;
            
        case 'addFood':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['name', 'category_id', 'calories', 'protein', 'carbs', 'fats', 'price'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || $input[$field] === '') {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            // Validate numeric fields
            if ($input['calories'] < 0 || $input['protein'] < 0 || $input['carbs'] < 0 || 
                $input['fats'] < 0 || $input['price'] < 0) {
                throw new Exception('Numeric values must be positive');
            }
            
            $stmt = $db->prepare('
                INSERT INTO foods (name, category_id, calories, protein, carbs, fats, micros, price, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            
            $stmt->execute([
                $input['name'],
                $input['category_id'],
                $input['calories'],
                $input['protein'],
                $input['carbs'],
                $input['fats'],
                $input['micros'] ?? '',
                $input['price'],
                $input['image'] ?? null
            ]);
            
            $newId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Food item added successfully',
                'id' => $newId
            ]);
            break;
            
        case 'updateFood':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('Food ID is required');
            }
            
            // Build dynamic update query
            $fields = [];
            $values = [];
            
            $allowedFields = ['name', 'category_id', 'calories', 'protein', 'carbs', 'fats', 'micros', 'price', 'image'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                throw new Exception('No fields to update');
            }
            
            $values[] = $input['id'];
            
            $sql = 'UPDATE foods SET ' . implode(', ', $fields) . ' WHERE id = ?';
            $stmt = $db->prepare($sql);
            $stmt->execute($values);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Food item updated successfully'
            ]);
            break;
            
        case 'deleteFood':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('Food ID is required');
            }
            
            // Check if food exists
            $stmt = $db->prepare('SELECT id FROM foods WHERE id = ?');
            $stmt->execute([$input['id']]);
            if (!$stmt->fetch()) {
                throw new Exception('Food item not found');
            }
            
            $stmt = $db->prepare('DELETE FROM foods WHERE id = ?');
            $stmt->execute([$input['id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Food item deleted successfully'
            ]);
            break;
            
        // ============ CATEGORY MANAGEMENT ============
        case 'getAllCategories':
            $stmt = $db->query('SELECT * FROM categories ORDER BY name');
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $categories]);
            break;
            
        case 'addCategory':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || empty(trim($input['name']))) {
                throw new Exception('Category name is required');
            }
            
            // Check if category exists
            $stmt = $db->prepare('SELECT id FROM categories WHERE name = ?');
            $stmt->execute([trim($input['name'])]);
            if ($stmt->fetch()) {
                throw new Exception('Category already exists');
            }
            
            $stmt = $db->prepare('INSERT INTO categories (name) VALUES (?)');
            $stmt->execute([trim($input['name'])]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Category added successfully',
                'id' => $db->lastInsertId()
            ]);
            break;
            
        case 'deleteCategory':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('Category ID is required');
            }
            
            // Check if category has foods
            $stmt = $db->prepare('SELECT COUNT(*) as count FROM foods WHERE category_id = ?');
            $stmt->execute([$input['id']]);
            $count = $stmt->fetch()['count'];
            
            if ($count > 0) {
                throw new Exception("Cannot delete category with $count food items. Remove foods first.");
            }
            
            $stmt = $db->prepare('DELETE FROM categories WHERE id = ?');
            $stmt->execute([$input['id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Category deleted successfully'
            ]);
            break;
            
        // ============ USER MANAGEMENT ============
        case 'getAllUsers':
            $stmt = $db->query('
                SELECT id, name, email, role, 
                (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as order_count
                FROM users 
                ORDER BY id DESC
            ');
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $users]);
            break;
            
        case 'updateUserRole':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id']) || !isset($input['role'])) {
                throw new Exception('User ID and role are required');
            }
            
            if (!in_array($input['role'], ['user', 'admin'])) {
                throw new Exception('Invalid role. Must be "user" or "admin"');
            }
            
            // Prevent user from removing their own admin role
            if ($input['user_id'] == $currentUser['user_id'] && $input['role'] !== 'admin') {
                throw new Exception('You cannot remove your own admin privileges');
            }
            
            $stmt = $db->prepare('UPDATE users SET role = ? WHERE id = ?');
            $stmt->execute([$input['role'], $input['user_id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'User role updated successfully'
            ]);
            break;
            
        case 'deleteUser':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id'])) {
                throw new Exception('User ID is required');
            }
            
            // Prevent user from deleting themselves
            if ($input['user_id'] == $currentUser['user_id']) {
                throw new Exception('You cannot delete your own account');
            }
            
            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$input['user_id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'User deleted successfully'
            ]);
            break;
            
        // ============ ORDER MANAGEMENT ============
        case 'getAllOrders':
            $stmt = $db->query('
                SELECT o.*, u.name as user_name, u.email, 
                       f.name as food_name, f.price,
                       (o.quantity * f.price) as total
                FROM orders o
                JOIN users u ON o.user_id = u.id
                JOIN foods f ON o.food_id = f.id
                ORDER BY o.timestamp DESC
            ');
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $orders]);
            break;
            
        case 'updateOrderStatus':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['order_id']) || !isset($input['status'])) {
                throw new Exception('Order ID and status are required');
            }
            
            $validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
            if (!in_array($input['status'], $validStatuses)) {
                throw new Exception('Invalid status. Must be: pending, processing, delivered, or cancelled');
            }
            
            $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
            $stmt->execute([$input['status'], $input['order_id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Order status updated successfully'
            ]);
            break;
            
        default:
            throw new Exception('Invalid action specified');
    }
    
} catch (Exception $e) {
    $code = http_response_code();
    if ($code === 200) {
        http_response_code(400);
    }
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
