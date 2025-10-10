<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'session':
            $user = null;
            $cartCount = 0;
            
            if (isset($_SESSION['user_id'])) {
                $user = [
                    'id' => $_SESSION['user_id'],
                    'name' => $_SESSION['user_name'] ?? '',
                    'email' => $_SESSION['user_email'] ?? '',
                    'role' => $_SESSION['user_role'] ?? 'user'
                ];
            }
            
            if (isset($_SESSION['cart'])) {
                $cartCount = count($_SESSION['cart']);
            }
            
            echo json_encode([
                'success' => true,
                'user' => $user,
                'cartCount' => $cartCount
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
