<?php
require_once __DIR__ . '/Admin.php';
require_once __DIR__ . '/../database/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(array('success' => false, 'message' => 'Unauthorized access'));
    exit();
}

try {
    $db = new Database();
    $admin = new Admin($db->getConnection());

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid request data');
    }

    // Validate required fields
    $required = array('name', 'categoryId', 'calories', 'protein', 'carbs', 'fats', 'price');
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    $micros = isset($data['micros']) ? $data['micros'] : '';
    
    $result = $admin->addFood(
        $data['name'],
        $data['categoryId'],
        $data['calories'],
        $data['protein'],
        $data['carbs'],
        $data['fats'],
        $micros,
        $data['price']
    );

    echo json_encode(array(
        'success' => true,
        'message' => 'Food item added successfully'
    ));

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}