<?php
/**
 * Test Data Controller
 * Helps populate database with sample data for testing
 * DELETE THIS FILE IN PRODUCTION
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../../database/database.php';

try {
    $db = (new Database())->getConnection();
    
    // Check if database needs initial setup
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM foods");
    $foodCount = $stmt->fetch()['count'];
    
    $response = [
        'success' => true,
        'message' => 'Database check complete',
        'data' => [
            'users' => $userCount,
            'foods' => $foodCount
        ]
    ];
    
    if ($userCount == 0) {
        $response['message'] .= ' - No users found. Please create an admin account.';
        $response['needsSetup'] = true;
    }
    
    if ($foodCount == 0) {
        $response['message'] .= ' - No foods found. Sample data available in schema.sql';
        $response['needsFoods'] = true;
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
