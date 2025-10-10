<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    session_destroy();
    echo json_encode(array(
        'success' => true,
        'message' => 'Logged out successfully'
    ));
} else {
    http_response_code(400);
    echo json_encode(array(
        'success' => false,
        'message' => 'No active session'
    ));
}