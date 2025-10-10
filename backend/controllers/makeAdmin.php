<?php
/**
 * Make Admin Script
 * Promotes a user to admin role
 * SECURITY: This file should be deleted after initial setup
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

require_once __DIR__ . '/../../database/database.php';

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data || !isset($data['email'])) {
        throw new Exception('Email is required');
    }
    
    $email = trim($data['email']);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Get database connection
    $db = (new Database())->getConnection();
    
    // Check if user exists
    $stmt = $db->prepare('SELECT id, role FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    if ($user['role'] === 'admin') {
        echo json_encode([
            'success' => true,
            'message' => 'User is already an admin'
        ]);
        exit();
    }
    
    // Update to admin
    $stmt = $db->prepare('UPDATE users SET role = ? WHERE email = ?');
    $success = $stmt->execute(['admin', $email]);
    
    if (!$success) {
        throw new Exception('Failed to update user role');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'User promoted to admin successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
