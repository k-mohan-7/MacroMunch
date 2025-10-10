<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../../database/database.php';
require_once __DIR__ . '/../Food.php';

// Initialize database connection
$db = (new Database())->getConnection();
$foodModel = new Food($db);

// Get action from query string
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'listCategories':
            $stmt = $db->query('SELECT * FROM categories ORDER BY id');
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($categories);
            break;

        case 'listFoods':
            $categoryId = $_GET['category_id'] ?? '';
            $search = $_GET['q'] ?? '';
            
            $sql = 'SELECT * FROM foods WHERE 1=1';
            $params = [];
            
            if (!empty($categoryId)) {
                $sql .= ' AND category_id = ?';
                $params[] = $categoryId;
            }
            
            if (!empty($search)) {
                $sql .= ' AND name LIKE ?';
                $params[] = '%' . $search . '%';
            }
            
            $sql .= ' ORDER BY name';
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($foods);
            break;

        case 'addToCart':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $foodId = $input['food_id'] ?? null;
            $quantity = $input['quantity'] ?? 1;
            
            if (!$foodId) {
                throw new Exception('Food ID is required');
            }
            
            // Initialize cart in session if not exists
            if (!isset($_SESSION['cart'])) {
                $_SESSION['cart'] = [];
            }
            
            // Add or update item in cart
            if (isset($_SESSION['cart'][$foodId])) {
                $_SESSION['cart'][$foodId] += $quantity;
            } else {
                $_SESSION['cart'][$foodId] = $quantity;
            }
            
            echo json_encode(['success' => true, 'message' => 'Item added to cart']);
            break;

        case 'getCart':
            $cart = $_SESSION['cart'] ?? [];
            $items = [];
            
            foreach ($cart as $foodId => $quantity) {
                $food = $foodModel->getFoodById($foodId);
                if ($food) {
                    $items[] = [
                        'id' => $food['id'],
                        'name' => $food['name'],
                        'price' => $food['price'],
                        'quantity' => $quantity,
                        'calories' => $food['calories'],
                        'protein' => $food['protein'],
                        'carbs' => $food['carbs'],
                        'fats' => $food['fats']
                    ];
                }
            }
            
            echo json_encode(['items' => $items, 'count' => count($items)]);
            break;

        case 'removeFromCart':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $foodId = $input['food_id'] ?? null;
            
            if (!$foodId) {
                throw new Exception('Food ID is required');
            }
            
            if (isset($_SESSION['cart'][$foodId])) {
                unset($_SESSION['cart'][$foodId]);
            }
            
            echo json_encode(['success' => true, 'message' => 'Item removed from cart']);
            break;

        case 'checkout':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Invalid request method');
            }
            
            if (!isset($_SESSION['user_id'])) {
                throw new Exception('Please login to checkout');
            }
            
            $cart = $_SESSION['cart'] ?? [];
            
            if (empty($cart)) {
                throw new Exception('Cart is empty');
            }
            
            // Save orders to database with pending status
            $stmt = $db->prepare('INSERT INTO orders (user_id, food_id, quantity, timestamp, status) VALUES (?, ?, ?, NOW(), "pending")');
            
            foreach ($cart as $foodId => $quantity) {
                $stmt->execute([$_SESSION['user_id'], $foodId, $quantity]);
            }
            
            // Clear cart
            $_SESSION['cart'] = [];
            
            echo json_encode(['success' => true, 'message' => 'Order placed successfully']);
            break;
            
        case 'getUserOrders':
            if (!isset($_SESSION['user_id'])) {
                echo json_encode(['orders' => []]);
                break;
            }
            
            $stmt = $db->prepare('
                SELECT o.*, f.name, f.price, f.image, f.calories, f.protein, f.carbs, f.fats,
                       (o.quantity * f.price) as total
                FROM orders o
                JOIN foods f ON o.food_id = f.id
                WHERE o.user_id = ?
                ORDER BY o.timestamp DESC
            ');
            $stmt->execute([$_SESSION['user_id']]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['orders' => $orders]);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
