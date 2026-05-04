//MODULE IMPORTS
const express = require('express');
const cors = require('cors');
const path = require('path');

//SETTINGS
const database = require('./database');

const app = express();
app.use(express.json());
app.use(cors());

//Static frontend
app.use(express.static(path.join(__dirname, '../frontend/client')));

//ENDPOINTS
const authRoutes = require('./routes/auth.routes.js');
app.use('/api', authRoutes);

const profileRoutes = require('./routes/profile.routes.js');
app.use('/api', profileRoutes);

const eventsRoutes = require('./routes/events.routes.js');
app.use('/api', eventsRoutes);

const reviewsRoutes = require('./routes/reviews.routes.js');
app.use('/api', reviewsRoutes);

const menuRouter = require('./routes/menu.routes.js');
app.use('/api', menuRouter);

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
            message: 'Ez a végpont működik.',
            results: test
        });
        console.log('Ez a végpont működik.'+ test);
    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'Ez a végpont nem működik. ' + error.message
        });
        console.log('Ez a végpont nem működik. '+ error.message);
    }
});

module.exports = app;