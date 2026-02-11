//MODULE IMPORTS
const express = require('express');
const path = require('path');

//SETTINGS
const database = require('./database');

const app = express();
app.use(express.json());

//Static frontend
app.use(express.static(path.join(__dirname, '../frontend/client')));

//ENDPOINTS
const authRoutes = require('./routes/auth.routes.js');
app.use('/api', authRoutes);

const profileRoutes = require('./routes/profile.routes.js');
app.use('/api', profileRoutes);

/* Test
app.get('/', (req, res) => {
    res.send('Rolling Barrel backend is running');
});
*/

//api/testsql
app.get('/api/testsql', async (request, response) => {
    console.log(`[${new Date().toLocaleTimeString()}] - /testsql call has been recived.`);

    try {
        const test = await database.test();
        response.status(200).json({
            success: true,
            message: 'This endpoint is working.',
            results: test
        });
        console.log('This endpoint is working.', test);
    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'This endpoint is not working. ' + error.message
        });
        console.log('This endpoint is not working. ' + error.message);
    }
});

module.exports = app;