<?php
class Food {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllFoods() {
        try {
            $stmt = $this->db->query('SELECT * FROM foods');
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting foods: " . $e->getMessage());
            throw new Exception("Failed to retrieve food items");
        }
    }

    public function getFoodsByCategory($categoryId) {
        try {
            $stmt = $this->db->prepare('SELECT * FROM foods WHERE category_id = ?');
            $stmt->execute(array($categoryId));
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error getting foods by category: " . $e->getMessage());
            throw new Exception("Failed to retrieve food items");
        }
    }

    public function getFoodById($id) {
        try {
            $stmt = $this->db->prepare('SELECT * FROM foods WHERE id = ?');
            $stmt->execute(array($id));
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error getting food: " . $e->getMessage());
            throw new Exception("Failed to retrieve food item");
        }
    }
}