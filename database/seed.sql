-- Test datas for the database

-- USERS (admin + test user)
INSERT INTO users (name, email, password, role) VALUES
(
    'Admin User',
    'admin@rollingbarrel.com',
    '$2b$10$y6q7wXW8t1X7o2Zxq7Xw6eF5Qq7vXnY8zXKQ2JZ1R1nQ9V9Z1kJbW',
    'admin'
),

(
    'Test User',
    'user@rollingbarrel.com',
    '$2b$10$4nKZKZpQ6xH4Tn0K9J8v5O0N0FJ9C3qkQKqF0XkQ2B7N0k2z8FZsW',
    'user'
);

-- LANES
INSERT INTO lanes (name, is_active) VALUES
('Lane 1', TRUE),
('Lane 2', TRUE),
('Lane 3', TRUE),
('Lane 4', TRUE);

-- TABLES (pub)
INSERT INTO tables (table_number, capacity, is_active) VALUES
(1, 4, TRUE),
(2, 4, TRUE),
(3, 6, TRUE),
(4, 2, TRUE),
(5, 8, TRUE);

-- RESERVATIONS
INSERT INTO reservations (user_id, lane_id, table_id, reservation_date, start_time, end_time, guests, notes) VALUES
(2, 1, NULL, '2026-02-10', '18:00', '19:00', 2, 'Test bowling reservation'),
(2, NULL, 3, '2026-02-11', '19:00', '21:00', 4, 'Test table reservation');

-- MENU ITEMS
INSERT INTO menu_items (name, description, price, category) VALUES
-- Foods
('Classic Burger', 'Beef burger with fries', 3490, 'food'),
('Chicken Wings', 'Spicy wings with dip', 2990, 'food'),
('French Fries', 'Crispy fries', 1490, 'food'),

-- Drinks
('Craft Beer', 'Local craft beer 0.5l', 1890, 'drink'),
('Cola', '0.33l', 690, 'drink'),
('Whiskey', 'Premium whiskey 4cl', 2490, 'drink');

-- EVENTS
INSERT INTO events (name, description, event_date, start_time, end_time) VALUES
(
    'Bowling Tournament',
    'Weekly bowling competition',
    '2026-02-15',
    '18:00',
    '22:00'
),

(
    'Live Music Night',
    'Local band live performance',
    '2026-02-22',
    '20:00',
    '23:00'
);

-- REVIEWS
INSERT INTO reviews (user_id, rating, comment) VALUES
(2, 5, 'Nagyon jó hely, szuper hangulat!'),