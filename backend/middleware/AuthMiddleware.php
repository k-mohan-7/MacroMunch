<?php
/**
 * Authentication Middleware
 * Handles session validation and role-based access control
 */
class AuthMiddleware {
    
    /**
     * Check if user is authenticated
     * @throws Exception if user is not logged in
     */
    public static function requireAuth() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_email'])) {
            http_response_code(401);
            throw new Exception('Authentication required. Please login.');
        }
        
        // Check session timeout (30 minutes)
        if (isset($_SESSION['last_activity'])) {
            $timeout = 1800; // 30 minutes
            if (time() - $_SESSION['last_activity'] > $timeout) {
                session_unset();
                session_destroy();
                http_response_code(401);
                throw new Exception('Session expired. Please login again.');
            }
        }
        
        $_SESSION['last_activity'] = time();
        
        return [
            'user_id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'name' => $_SESSION['user_name'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'user'
        ];
    }
    
    /**
     * Check if user has admin role
     * @throws Exception if user is not an admin
     */
    public static function requireAdmin() {
        $user = self::requireAuth();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            throw new Exception('Access denied. Admin privileges required.');
        }
        
        return $user;
    }
    
    /**
     * Check if user is authenticated (returns boolean, no exception)
     */
    public static function isAuthenticated() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return isset($_SESSION['user_id']);
    }
    
    /**
     * Check if current user is admin (returns boolean, no exception)
     */
    public static function isAdmin() {
        if (!self::isAuthenticated()) {
            return false;
        }
        return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
    }
    
    /**
     * Get current user info (returns null if not authenticated)
     */
    public static function getCurrentUser() {
        if (!self::isAuthenticated()) {
            return null;
        }
        
        return [
            'user_id' => $_SESSION['user_id'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'user'
        ];
    }
    
    /**
     * Validate CSRF token (for future enhancement)
     */
    public static function validateCSRF($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Generate CSRF token
     */
    public static function generateCSRF() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
}
