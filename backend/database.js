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
    await pool.execute(query, values);
    const result = { 
        success: true, 
        username: user.name 
    };
    return result;
}

//DETECTING EMAIL DUPLICATION + LOGIN
async function checkEmail(email) {
    const query = 'SELECT name FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
}

//Exports
module.exports = {
    test,
    registration,
    checkEmail
};