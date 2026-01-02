const express = require('express');
const database = require('./database');

const app = express();
app.use(express.json());

//ENDPOINTS
app.get('/', (req, res) => {
    res.send('Rolling Barrel backend is running');
});

//api/testsql
app.get('/api/testsql', async (request, response) => {
    try {
        const test = await database.test();
        response.status(200).json({
            success: true,
            message: 'This endpoint is working.',
            results: test
        });
        console.log('This endpoint is working.', test)
    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'This endpoint is not working. ' + error.message
        });
        console.log('This endpoint is not working. ' + error.message)
    }
});

module.exports = app;