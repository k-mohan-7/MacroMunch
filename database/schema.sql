-- MacroMunch initial schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS macromunch;
USE macromunch;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category_id INT NOT NULL,
  calories INT NOT NULL DEFAULT 0,
  protein DECIMAL(6,2) NOT NULL DEFAULT 0,
  carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
  fats DECIMAL(6,2) NOT NULL DEFAULT 0,
  micros TEXT,
  price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  image VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  timestamp DATETIME NOT NULL,
  status ENUM('pending', 'processing', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- Seed categories
INSERT IGNORE INTO categories (id, name) VALUES
  (1,'Snacks'), (2,'Beverages'), (3,'Meals'), (4,'Bars'), (5,'Desserts');

-- Seed sample foods for demonstration
INSERT IGNORE INTO foods (id, name, category_id, calories, protein, carbs, fats, micros, price, image) VALUES
  -- Snacks (category_id: 1)
  (1, 'Protein Chips - BBQ', 1, 140, 21, 5, 3.5, 'Vitamin B6: 15%, Iron: 8%', 3.99, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'),
  (2, 'Almond Trail Mix', 1, 180, 6, 14, 12, 'Vitamin E: 35%, Magnesium: 20%', 4.49, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400'),
  (3, 'Greek Yogurt Parfait', 1, 150, 15, 20, 2, 'Calcium: 25%, Probiotics', 5.99, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
  
  -- Beverages (category_id: 2)
  (4, 'Protein Shake - Chocolate', 2, 160, 30, 6, 2, 'B-Complex: 25%, Calcium: 30%', 4.99, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400'),
  (5, 'Green Detox Smoothie', 2, 120, 4, 28, 0.5, 'Vitamin C: 180%, Iron: 15%', 6.49, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400'),
  (6, 'Cold Brew Coffee', 2, 5, 0, 1, 0, 'Caffeine: 200mg', 3.49, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400'),
  
  -- Meals (category_id: 3)
  (7, 'Grilled Chicken Bowl', 3, 420, 45, 38, 12, 'Iron: 25%, Vitamin A: 40%', 11.99, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'),
  (8, 'Quinoa Power Salad', 3, 380, 18, 52, 10, 'Fiber: 45%, Folate: 35%', 10.49, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'),
  (9, 'Turkey Avocado Wrap', 3, 450, 32, 42, 18, 'Vitamin K: 30%, Potassium: 18%', 9.99, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400'),
  
  -- Bars (category_id: 4)
  (10, 'Chocolate Peanut Energy Bar', 4, 210, 10, 24, 9, 'Iron: 15%, Fiber: 20%', 2.99, 'https://images.unsplash.com/photo-1606312619070-d48b4cbc4460?w=400'),
  (11, 'Blueberry Oat Bar', 4, 190, 8, 28, 6, 'Antioxidants, Fiber: 25%', 2.79, 'https://images.unsplash.com/photo-1590080876876-5acf2b42ab25?w=400'),
  (12, 'Almond Coconut Bar', 4, 230, 12, 20, 12, 'Vitamin E: 25%, Fiber: 30%', 3.29, 'https://images.unsplash.com/photo-1520103465474-4b7849d0f6a3?w=400'),
  
  -- Desserts (category_id: 5)
  (13, 'Protein Brownie', 5, 280, 20, 32, 8, 'Calcium: 15%, Fiber: 18%', 4.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400'),
  (14, 'Chia Seed Pudding', 5, 180, 6, 22, 8, 'Omega-3, Calcium: 18%', 5.49, 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=400'),
  (15, 'Frozen Yogurt Cup', 5, 140, 8, 24, 2, 'Probiotics, Calcium: 20%', 4.29, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400');