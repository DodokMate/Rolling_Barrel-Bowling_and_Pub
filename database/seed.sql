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
('Pálya 1', TRUE),
('Pálya 2', TRUE),
('Pálya 3', TRUE),
('Pálya 4', TRUE),
('Pálya 5', TRUE);

-- TABLES (pub)
INSERT INTO tables (table_number, capacity, is_active) VALUES
(1, 2, TRUE),
(2, 2, TRUE),
(3, 4, TRUE),
(4, 4, TRUE),
(5, 4, TRUE),
(6, 6, TRUE),
(7, 6, TRUE),
(8, 6, TRUE),
(9, 6, TRUE),
(10, 6, TRUE);

-- RESERVATIONS
INSERT INTO reservations (user_id, lane_id, table_id, reservation_date, start_time, end_time, guests, notes) VALUES
(2, 1, NULL, '2026-02-10', '18:00', '19:00', 2, 'Test bowling reservation'),
(2, NULL, 3, '2026-02-11', '19:00', '21:00', 4, 'Test table reservation');

-- MENU ITEMS
INSERT INTO menu_items (name, description, price, category, subcategory) VALUES
-- FOODS
('Barrel Burger', 'Szaftos marhahúspogácsa, cheddar sajt, bacon, házi szósz és ropogós saláta.', 3290, 'food', 'burger'),
('Neon Cheese Burger', 'Dupla cheddar, grillezett húspogácsa, savanyított uborka és füstös szósz.', 3490, 'food', 'burger'),
('Classic Pepperoni Pizza', 'Paradicsomos alap, mozzarella, pepperoni és oregánó.', 2990, 'food', 'pizza'),
('Rolling BBQ Pizza', 'BBQ alap, csirke, bacon, lilahagyma és mozzarella.', 3390, 'food', 'pizza'),
('Creamy Chicken Pasta', 'Tejszínes csirkés tészta parmezánnal és friss petrezselyemmel.', 2890, 'food', 'pasta'),
('Spicy Arrabbiata', 'Paradicsomos, fokhagymás, csípős tészta olívaolajjal.', 2590, 'food', 'pasta'),

-- DRINKS
('Barrel Mojito', 'Friss menta, lime, rum, szóda és jég.', 2490, 'drink', 'alcoholic'),
('Neon Gin Tonic', 'Gin, tonic, citrus és neon hangulat.', 2690, 'drink', 'alcoholic'),
('Craft Lager', 'Hideg csapolt lager sör.', 1490, 'drink', 'alcoholic'),
('Virgin Berry Lemonade', 'Erdei gyümölcsös alkoholmentes limonádé.', 1590, 'drink', 'non_alcoholic'),
('Classic Lemonade', 'Citromos házi limonádé friss mentával.', 1390, 'drink', 'non_alcoholic'),
('Cola', 'Szénsavas üdítőital jéggel.', 890, 'drink', 'non_alcoholic');

-- EVENTS
INSERT INTO events (name, description, event_date, start_time, end_time, free_slots, category)
VALUES
('Weekly Bowling Night', 'Heti baráti bowling est neon hangulattal és jó zenékkel.', '2026-02-14', '18:00', '22:00', 100, 'bowling'),

('Rolling Barrel Championship', 'Havi bajnokság profi és amatőr játékosoknak értékes nyereményekkel.', '2026-02-28', '17:00', '23:00', 64, 'competition'),

('Retro Synthwave Night', '80-as évek synthwave hangulat neon fényekkel és DJ-szettel.', '2026-02-20', '21:00', '01:00', 150, 'music'),

('Craft Beer Tasting', 'Kézműves sörkóstoló helyi főzdékkel és limitált tételekkel.', '2026-02-18', '18:00', '21:00', 50, 'pub'),

('Glow Strike Party', 'UV-fényes bowling buli, ahol minden strike után fényshow indul.', '2026-03-02', '20:00', '23:00', 80, 'bowling'),

('Duo Strike Tournament', 'Kétfős csapatverseny, ahol a csapatmunka dönt mindent.', '2026-03-15', '18:00', '22:00', 40, 'competition'),

('Acoustic Chill Evening', 'Élő akusztikus est, tökéletes lazuláshoz és baráti beszélgetésekhez.', '2026-03-07', '19:00', '22:00', 90, 'music'),

('Pub Quiz Night', 'Csapatok versenyeznek tudásban, humorban és gyorsaságban.', '2026-03-04', '19:00', '22:00', 80, 'pub'),

('Family Bowling Sunday', 'Családi délután kedvezményes pályákkal és gyerekbarát programokkal.', '2026-03-09', '14:00', '18:00', 120, 'bowling'),

('Midnight Knockout Cup', 'Éjszakai kieséses torna, csak a legkitartóbbaknak.', '2026-04-05', '22:00', '02:00', 32, 'competition'),

('Neon Beats Live DJ', 'Elektronikus DJ-szett neon fényekkel és táncos hangulattal.', '2026-03-21', '22:00', '02:00', 200, 'music'),

('Whiskey & Vinyl Evening', 'Prémium whiskey kóstoló klasszikus vinyl zenékkel.', '2026-03-18', '20:00', '23:00', 60, 'pub');

-- REVIEWS
INSERT INTO reviews (user_id, rating, comment) VALUES
(2, 5, 'Nagyon jó hely, szuper hangulat!');