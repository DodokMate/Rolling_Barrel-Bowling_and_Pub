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

//GET EVENT BY ID
async function getEventById(eventId) {
    const query = "SELECT id, free_slots FROM events WHERE id = ?";
    const [rows] = await pool.execute(query, [eventId]);
    return rows[0];
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
    isTableAvailable
};