<?php
require_once __DIR__ . '/../database/database.php';

class User {
    private $db;
    
    public function __construct() {
        try {
            $db = new Database();
            $this->db = $db->getConnection();
        } catch (Exception $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Service temporarily unavailable");
        }
    }

    public function register($name, $email, $password) {
        try {
            // Validate inputs
            if (empty($name) || empty($email) || empty($password)) {
                throw new Exception("All fields are required");
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format");
            }
            
            if (strlen($password) < 6) {
                throw new Exception("Password must be at least 6 characters");
            }

            // Check if email exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute(array($email));
            if ($stmt->fetch()) {
                throw new Exception("Email already registered");
            }

            // Create user
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')");
            $success = $stmt->execute(array($name, $email, $hash));
            
            if (!$success) {
                throw new Exception("Failed to create user");
            }
            
            // Return the newly created user
            $user = $this->findByEmail($email);
            
            // Remove password from response
            if ($user) {
                unset($user['password']);
            }
            
            return $user;
        } catch (PDOException $e) {
            error_log("Database error in create: " . $e->getMessage());
            throw new Exception("Failed to create user");
        }
    }
    
    public function login($email, $password) {
        try {
            // Validate inputs
            if (empty($email) || empty($password)) {
                throw new Exception("Email and password are required");
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Invalid email format");
            }
            
            // Find and verify user
            $user = $this->verify($email, $password);
            
            if (!$user) {
                throw new Exception("Invalid email or password");
            }
            
            // Remove password from response
            unset($user['password']);
            
            return $user;
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            throw $e;
        }
    }

    public function findByEmail($email) {
        try {
            $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
            $stmt->execute(array($email));
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Database error in findByEmail: " . $e->getMessage());
            throw new Exception("Error looking up user");
        }
    }

    public function verify($email, $password) {
        try {
            $user = $this->findByEmail($email);
            if (!$user) {
                return null; // User not found
            }
            if (password_verify($password, $user['password'])) {
                return $user;
            }
            return null; // Invalid password
        } catch (Exception $e) {
            error_log("Error in verify: " . $e->getMessage());
            throw new Exception("Authentication failed");
        }
    }
    
    // ============ ADMIN METHODS ============
    
    public function getAllUsers() {
        try {
            $stmt = $this->db->query('SELECT id, name, email, role FROM users ORDER BY id DESC');
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting users: " . $e->getMessage());
            throw new Exception("Failed to retrieve users");
        }
    }
    
    public function getUserById($id) {
        try {
            $stmt = $this->db->prepare('SELECT id, name, email, role FROM users WHERE id = ?');
            $stmt->execute(array($id));
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting user: " . $e->getMessage());
            throw new Exception("Failed to retrieve user");
        }
    }
    
    public function updateUserRole($userId, $role) {
        try {
            if (!in_array($role, ['user', 'admin'])) {
                throw new Exception("Invalid role");
            }
            
            $stmt = $this->db->prepare('UPDATE users SET role = ? WHERE id = ?');
            return $stmt->execute(array($role, $userId));
        } catch (PDOException $e) {
            error_log("Error updating user role: " . $e->getMessage());
            throw new Exception("Failed to update user role");
        }
    }
    
    public function deleteUser($userId) {
        try {
            $stmt = $this->db->prepare('DELETE FROM users WHERE id = ?');
            return $stmt->execute(array($userId));
        } catch (PDOException $e) {
            error_log("Error deleting user: " . $e->getMessage());
            throw new Exception("Failed to delete user");
        }
    }
    
    public function getUserStats($userId) {
        try {
            $stmt = $this->db->prepare('
                SELECT 
                    u.id, u.name, u.email, u.role,
                    COUNT(o.id) as total_orders,
                    COALESCE(SUM(o.quantity * f.price), 0) as total_spent
                FROM users u
                LEFT JOIN orders o ON u.id = o.user_id
                LEFT JOIN foods f ON o.food_id = f.id
                WHERE u.id = ?
                GROUP BY u.id
            ');
            $stmt->execute(array($userId));
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting user stats: " . $e->getMessage());
            throw new Exception("Failed to retrieve user stats");
        }
    }
}