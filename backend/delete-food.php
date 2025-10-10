<?php
require_once 'Admin.php';
require_once '../database/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        throw new Exception('Food ID is required');
    }

    $db = new Database();
    $admin = new Admin($db->getConnection());
    $admin->deleteFood($data['id']);

    echo json_encode(array(
        'success' => true,
        'message' => 'Food item deleted successfully'
    ));

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ));
}