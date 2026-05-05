const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//SQL QUERIES

//Test
async function test() {
    const query = "SELECT * FROM users";
    const [rows] = await pool.execute(query);
    return rows;
}

//REGISTRATION
async function registration(user) {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?);';
    const values = [user.name, user.email, user.password, 'user'];
    const [result] = await pool.execute(query, values);
    const [rows] = await pool.execute("SELECT id, name, email, role FROM users WHERE id = ?", [result.insertId]);
    return rows[0];
}

//DETECTING EMAIL DUPLICATION + LOGIN
async function checkEmail(email) {
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
}

//USER'S DATA
async function userData(email) {
    const query = 'SELECT name, email, registered_events FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
}

//EVENTS 
async function getEvents() {
    const query = 'SELECT * FROM events ORDER BY event_date ASC';
    const [rows] = await pool.execute(query);
    return rows;
}

//UPDATE USER'S REGISTERED EVENTS
async function updateUserRegisteredEvents(userId, eventsId) {
    const query = "UPDATE users SET registered_events = ? WHERE id = ?";
    const [rows] = await pool.query(query, [eventsId, userId]);
    return rows;
}

//USER'S REGISTERED EVENTS (ALL)
async function getUserRegisteredEvents(userId) {
    const query = "SELECT registered_events FROM users WHERE id = ?";
    const [rows] = await pool.query(query, [userId]);
    return rows[0]?.registered_events || "[]";
}

//UPDATE EVENT FREE SLOTS
async function updateEventFreeSlots(eventId, delta) {
    const query = "UPDATE events SET free_slots = free_slots + ? WHERE id = ? AND free_slots + ? >= 0";
    const [result] = await pool.execute(query, [delta, eventId, delta]);
    return result.affectedRows;
}

//REVIEWS (LAST 3)
async function getReviews(limit = 3) {
    const query = `
        SELECT 
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.name AS user_name
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
        LIMIT ?
    `;

    const [rows] = await pool.execute(query, [Number(limit)]);
    return rows;
}

//ADD REVIEW
async function addReview(userId, rating, comment) {
    const query = `INSERT INTO reviews (user_id, rating, comment) VALUES (?, ?, ?)`;
    const [result] = await pool.execute(query, [userId, Number(rating), comment]);
    return result.insertId;
}

// MENU ITEMS
async function getMenuItems() {
    const query = `
        SELECT 
            id,
            name,
            description,
            price,
            category,
            subcategory
        FROM menu_items
        ORDER BY 
            FIELD(category, 'food', 'drink'),
            FIELD(subcategory, 'burger', 'pizza', 'pasta', 'alcoholic', 'non_alcoholic'),
            name ASC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// GET USER MENU FAVOURITES
async function getUserMenuFavourites(userId) {
    const query = `
        SELECT menu_item_id
        FROM menu_favourites
        WHERE user_id = ?
    `;

    const [rows] = await pool.execute(query, [userId]);
    return rows.map(row => Number(row.menu_item_id));
}

// CHECK MENU FAVOURITE
async function isMenuFavourite(userId, menuItemId) {
    const query = `
        SELECT id
        FROM menu_favourites
        WHERE user_id = ? AND menu_item_id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [userId, menuItemId]);
    return rows.length > 0;
}

// ADD MENU FAVOURITE
async function addMenuFavourite(userId, menuItemId) {
    const query = `
        INSERT IGNORE INTO menu_favourites (user_id, menu_item_id)
        VALUES (?, ?)
    `;

    await pool.execute(query, [userId, menuItemId]);
}

// REMOVE MENU FAVOURITE
async function removeMenuFavourite(userId, menuItemId) {
    const query = `
        DELETE FROM menu_favourites
        WHERE user_id = ? AND menu_item_id = ?
    `;

    await pool.execute(query, [userId, menuItemId]);
}

// TOGGLE MENU FAVOURITE
async function toggleMenuFavourite(userId, menuItemId) {
    const favourite = await isMenuFavourite(userId, menuItemId);

    if (favourite) {
        await removeMenuFavourite(userId, menuItemId);

        return {
            action: "removed"
        };
    }

    await addMenuFavourite(userId, menuItemId);

    return {
        action: "added"
    };
}

// GET ACTIVE LANES
async function getActiveLanes() {
    const query = `
        SELECT id, name
        FROM lanes
        WHERE is_active = TRUE
        ORDER BY id ASC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// GET ACTIVE TABLES
async function getActiveTables() {
    const query = `
        SELECT id, table_number, capacity
        FROM tables
        WHERE is_active = TRUE
        ORDER BY table_number ASC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// GET AVAILABLE LANES
async function getAvailableLanes(reservationDate, startTime, endTime) {
    const query = `
        SELECT l.id, l.name
        FROM lanes l
        WHERE l.is_active = TRUE
        AND l.id NOT IN (
            SELECT r.lane_id
            FROM reservations r
            WHERE r.lane_id IS NOT NULL
            AND r.status = 'active'
            AND r.reservation_date = ?
            AND r.start_time < ?
            AND r.end_time > ?
        )
        ORDER BY l.id ASC
    `;

    const [rows] = await pool.execute(query, [
        reservationDate,
        endTime,
        startTime
    ]);

    return rows;
}

// GET AVAILABLE TABLES
async function getAvailableTables(reservationDate, startTime, endTime, guests) {
    const query = `
        SELECT t.id, t.table_number, t.capacity
        FROM tables t
        WHERE t.is_active = TRUE
        AND t.capacity >= ?
        AND t.id NOT IN (
            SELECT r.table_id
            FROM reservations r
            WHERE r.table_id IS NOT NULL
            AND r.status = 'active'
            AND r.reservation_date = ?
            AND r.start_time < ?
            AND r.end_time > ?
        )
        ORDER BY t.capacity ASC, t.table_number ASC
    `;

    const [rows] = await pool.execute(query, [
        guests,
        reservationDate,
        endTime,
        startTime
    ]);

    return rows;
}

// CREATE LANE RESERVATION
async function createLaneReservation(userId, laneId, reservationDate, startTime, endTime, guests, notes = '') {
    const query = `
        INSERT INTO reservations 
            (user_id, lane_id, table_id, reservation_date, start_time, end_time, guests, notes)
        VALUES 
            (?, ?, NULL, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        userId,
        laneId,
        reservationDate,
        startTime,
        endTime,
        guests,
        notes
    ]);

    return result.insertId;
}

// CREATE TABLE RESERVATION
async function createTableReservation(userId, tableId, reservationDate, startTime, endTime, guests, notes = '') {
    const query = `
        INSERT INTO reservations 
            (user_id, lane_id, table_id, reservation_date, start_time, end_time, guests, notes)
        VALUES 
            (?, NULL, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        userId,
        tableId,
        reservationDate,
        startTime,
        endTime,
        guests,
        notes
    ]);

    return result.insertId;
}

// CHECK IF LANE IS AVAILABLE
async function isLaneAvailable(laneId, reservationDate, startTime, endTime) {
    const query = `
        SELECT id
        FROM reservations
        WHERE lane_id = ?
        AND status = 'active'
        AND reservation_date = ?
        AND start_time < ?
        AND end_time > ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [
        laneId,
        reservationDate,
        endTime,
        startTime
    ]);

    return rows.length === 0;
}

// CHECK IF TABLE IS AVAILABLE
async function isTableAvailable(tableId, reservationDate, startTime, endTime) {
    const query = `
        SELECT id
        FROM reservations
        WHERE table_id = ?
        AND status = 'active'
        AND reservation_date = ?
        AND start_time < ?
        AND end_time > ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [
        tableId,
        reservationDate,
        endTime,
        startTime
    ]);

    return rows.length === 0;
}

// UPDATE USER NAME
async function updateUserName(userId, name) {
    const query = `
        UPDATE users
        SET name = ?
        WHERE id = ?
    `;

    await pool.execute(query, [name, userId]);
}

// GET USER BY ID
async function getUserById(userId) {
    const query = `
        SELECT id, name, email, role, registered_events
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [userId]);
    return rows[0];
}

// GET USER LAST LANE RESERVATIONS
async function getUserLastLaneReservations(userId, limit = 3) {
    const query = `
        SELECT 
            r.id,
            r.reservation_date,
            r.start_time,
            r.end_time,
            r.guests,
            r.status,
            l.name AS lane_name
        FROM reservations r
        JOIN lanes l ON l.id = r.lane_id
        WHERE r.user_id = ?
        AND r.lane_id IS NOT NULL
        ORDER BY r.reservation_date DESC, r.start_time DESC
        LIMIT ?
    `;

    const [rows] = await pool.execute(query, [userId, Number(limit)]);
    return rows;
}

// GET USER LAST TABLE RESERVATIONS
async function getUserLastTableReservations(userId, limit = 3) {
    const query = `
        SELECT 
            r.id,
            r.reservation_date,
            r.start_time,
            r.end_time,
            r.guests,
            r.status,
            t.table_number,
            t.capacity
        FROM reservations r
        JOIN tables t ON t.id = r.table_id
        WHERE r.user_id = ?
        AND r.table_id IS NOT NULL
        ORDER BY r.reservation_date DESC, r.start_time DESC
        LIMIT ?
    `;

    const [rows] = await pool.execute(query, [userId, Number(limit)]);
    return rows;
}

// ADMIN STATS
async function getAdminStats() {
    const usersQuery = `
        SELECT COUNT(*) AS total_users
        FROM users
    `;

    const reservationsQuery = `
        SELECT COUNT(*) AS total_active_reservations
        FROM reservations
        WHERE status = 'active'
    `;

    const menuQuery = `
        SELECT COUNT(*) AS total_menu_items
        FROM menu_items
    `;

    const eventsQuery = `
        SELECT COUNT(*) AS total_events
        FROM events
    `;

    const [[users]] = await pool.execute(usersQuery);
    const [[reservations]] = await pool.execute(reservationsQuery);
    const [[menuItems]] = await pool.execute(menuQuery);
    const [[events]] = await pool.execute(eventsQuery);

    return {
        total_users: users.total_users,
        total_active_reservations: reservations.total_active_reservations,
        total_menu_items: menuItems.total_menu_items,
        total_events: events.total_events
    };
}

// ADMIN RECENT RESERVATIONS
async function getAdminRecentReservations(limit = 10) {
    const query = `
        SELECT 
            r.id,
            r.reservation_date,
            r.start_time,
            r.end_time,
            r.guests,
            r.status,
            u.name AS user_name,
            u.email AS user_email,
            l.name AS lane_name,
            t.table_number,
            t.capacity
        FROM reservations r
        JOIN users u ON u.id = r.user_id
        LEFT JOIN lanes l ON l.id = r.lane_id
        LEFT JOIN tables t ON t.id = r.table_id
        ORDER BY r.reservation_date DESC, r.start_time DESC
        LIMIT ?
    `;

    const [rows] = await pool.execute(query, [Number(limit)]);
    return rows;
}

// ADMIN USERS
async function getAdminUsers() {
    const query = `
        SELECT 
            id,
            name,
            email,
            role
        FROM users
        ORDER BY id DESC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// ADMIN MENU ITEMS
async function getAdminMenuItems() {
    const query = `
        SELECT 
            id,
            name,
            description,
            price,
            category,
            subcategory
        FROM menu_items
        ORDER BY id DESC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// ADMIN EVENTS
async function getAdminEvents() {
    const query = `
        SELECT 
            id,
            name,
            description,
            event_date,
            start_time,
            end_time,
            free_slots,
            category
        FROM events
        ORDER BY event_date DESC, start_time DESC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// CREATE MENU ITEM
async function createMenuItem(name, description, price, category, subcategory) {
    const query = `
        INSERT INTO menu_items 
            (name, description, price, category, subcategory)
        VALUES 
            (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        name,
        description,
        price,
        category,
        subcategory || null
    ]);

    return result.insertId;
}

// UPDATE MENU ITEM
async function updateMenuItem(id, name, description, price, category, subcategory) {
    const query = `
        UPDATE menu_items
        SET 
            name = ?,
            description = ?,
            price = ?,
            category = ?,
            subcategory = ?
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
        name,
        description,
        price,
        category,
        subcategory || null,
        id
    ]);

    return result.affectedRows;
}

// DELETE MENU ITEM
async function deleteMenuItem(id) {
    const query = `
        DELETE FROM menu_items
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
}

// GET MENU ITEM BY ID
async function getMenuItemById(id) {
    const query = `
        SELECT 
            id,
            name,
            description,
            price,
            category,
            subcategory
        FROM menu_items
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// ADMIN REVIEWS
async function getAdminReviews() {
    const query = `
        SELECT 
            r.id,
            r.rating,
            r.comment,
            r.created_at,
            u.name AS user_name,
            u.email AS user_email
        FROM reviews r
        JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC
    `;

    const [rows] = await pool.execute(query);
    return rows;
}

// GET REVIEW BY ID
async function getReviewById(id) {
    const query = `
        SELECT 
            id,
            user_id,
            rating,
            comment,
            created_at
        FROM reviews
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// DELETE REVIEW
async function deleteReview(id) {
    const query = `
        DELETE FROM reviews
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
}

// CREATE EVENT
async function createEvent(name, description, eventDate, startTime, endTime, freeSlots, category) {
    const query = `
        INSERT INTO events 
            (name, description, event_date, start_time, end_time, free_slots, category)
        VALUES 
            (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        name,
        description,
        eventDate,
        startTime,
        endTime,
        freeSlots,
        category
    ]);

    return result.insertId;
}

// UPDATE EVENT
async function updateEvent(id, name, description, eventDate, startTime, endTime, freeSlots, category) {
    const query = `
        UPDATE events
        SET 
            name = ?,
            description = ?,
            event_date = ?,
            start_time = ?,
            end_time = ?,
            free_slots = ?,
            category = ?
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
        name,
        description,
        eventDate,
        startTime,
        endTime,
        freeSlots,
        category,
        id
    ]);

    return result.affectedRows;
}

// DELETE EVENT
async function deleteEvent(id) {
    const query = `
        DELETE FROM events
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
}

// GET EVENT BY ID
async function getEventById(id) {
    const query = `
        SELECT 
            id,
            name,
            description,
            event_date,
            start_time,
            end_time,
            free_slots,
            category
        FROM events
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// GET RESERVATION BY ID
async function getReservationById(id) {
    const query = `
        SELECT 
            id,
            user_id,
            lane_id,
            table_id,
            reservation_date,
            start_time,
            end_time,
            guests,
            notes,
            status
        FROM reservations
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0];
}

// DELETE RESERVATION
async function deleteReservation(id) {
    const query = `
        DELETE FROM reservations
        WHERE id = ?
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows;
}

//Exports
module.exports = {
    test,
    registration,
    checkEmail,
    userData,
    getEvents,
    updateUserRegisteredEvents,
    getUserRegisteredEvents,
    updateEventFreeSlots,
    getEventById,
    getReviews,
    addReview,
    getMenuItems,
    getUserMenuFavourites,
    isMenuFavourite,
    addMenuFavourite,
    removeMenuFavourite,
    toggleMenuFavourite,
    getActiveLanes,
    getActiveTables,
    getAvailableLanes,
    getAvailableTables,
    createLaneReservation,
    createTableReservation,
    isLaneAvailable,
    isTableAvailable,
    updateUserName,
    getUserById,
    getUserLastLaneReservations,
    getUserLastTableReservations,
    getAdminStats,
    getAdminRecentReservations,
    getAdminUsers,
    getAdminMenuItems,
    getAdminEvents,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getAdminReviews,
    getReviewById,
    deleteReview,
    createEvent,
    updateEvent,
    deleteEvent,
    getReservationById,
    deleteReservation
};