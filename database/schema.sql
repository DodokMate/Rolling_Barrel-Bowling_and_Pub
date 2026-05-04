-- Rolling Barrel - Bowling & Pub
-- Database schema

CREATE DATABASE IF NOT EXISTS rolling_barrel_database
CHARACTER SET utf8mb4
COLLATE utf8mb4_hungarian_ci;

USE rolling_barrel_database;

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    registered_events TEXT NULL
);

-- LANES
CREATE TABLE lanes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- TABLES
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT,
    capacity INT,
    is_active BOOLEAN DEFAULT TRUE
);

-- RESERVATIONS
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lane_id INT NULL,
    table_id INT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guests INT DEFAULT 1,
    notes TEXT,
    status ENUM('active', 'cancelled') DEFAULT 'active',
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lane_id) REFERENCES lanes(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

-- MENU_ITEMS
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('food', 'drink') DEFAULT 'food'
);

-- EVENTS
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    free_slots INT DEFAULT 100,
    category VARCHAR(50) NOT NULL DEFAULT 'bowling';
);

-- REVIEWS
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);