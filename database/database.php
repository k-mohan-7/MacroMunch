<?php
// Database connection helper with improved error handling
class Database {
    private $host = 'localhost';
    private $db   = 'macromunch';
    private $user = 'root';
    private $pass = '';
    private $charset = 'utf8mb4';
    private static $instance = null;

    public function getConnection() {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
                $options = array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                );
                self::$instance = new PDO($dsn, $this->user, $this->pass, $options);
                return self::$instance;
            } catch (PDOException $e) {
                error_log("Database Connection Error: " . $e->getMessage());
                throw new Exception("Database connection failed. Please try again later.");
            }
        }
        return self::$instance;
    }
}