<?php
class Admin {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function addFood($name, $categoryId, $calories, $protein, $carbs, $fats, $micros, $price) {
        try {
            $stmt = $this->db->prepare('INSERT INTO foods (name, category_id, calories, protein, carbs, fats, micros, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            return $stmt->execute(array($name, $categoryId, $calories, $protein, $carbs, $fats, $micros, $price));
        } catch (PDOException $e) {
            error_log("Error adding food: " . $e->getMessage());
            throw new Exception("Failed to add food item");
        }
    }

    public function updateFood($id, $name, $categoryId, $calories, $protein, $carbs, $fats, $micros, $price) {
        try {
            $stmt = $this->db->prepare('UPDATE foods SET name=?, category_id=?, calories=?, protein=?, carbs=?, fats=?, micros=?, price=? WHERE id=?');
            return $stmt->execute(array($name, $categoryId, $calories, $protein, $carbs, $fats, $micros, $price, $id));
        } catch (PDOException $e) {
            error_log("Error updating food: " . $e->getMessage());
            throw new Exception("Failed to update food item");
        }
    }

    public function deleteFood($id) {
        try {
            $stmt = $this->db->prepare('DELETE FROM foods WHERE id = ?');
            return $stmt->execute(array($id));
        } catch (PDOException $e) {
            error_log("Error deleting food: " . $e->getMessage());
            throw new Exception("Failed to delete food item");
        }
    }
}