<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'User.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'message' => 'Method not allowed'));
    exit();
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        throw new Exception('Invalid request data');
    }

    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required');
    }

    $user = new User();
    $result = $user->login($email, $password);

    // Start session and set user data
    session_start();
    $_SESSION['user_id'] = $result['id'];
    $_SESSION['user_name'] = $result['name'];
    $_SESSION['user_email'] = $result['email'];
    $_SESSION['user_role'] = $result['role'];
    $_SESSION['user'] = $result;
    $_SESSION['last_activity'] = time();

    echo json_encode(array(
        'success' => true,
        'message' => 'Login successful',
        'user' => $result
    ));
} catch (Exception $e) {
    http_response_code(401);
    $response = array(
        'success' => false,
        'message' => $e->getMessage()
    );
    echo json_encode($response);
}