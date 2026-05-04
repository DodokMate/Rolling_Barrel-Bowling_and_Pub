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
    const [rows] = await pool.query(query,[userId]);
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
    addReview
};