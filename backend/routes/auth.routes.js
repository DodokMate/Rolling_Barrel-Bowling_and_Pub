//MODULE IMPORTS
const express = require('express');

//SETTINGS
const bcrypt = require('bcrypt');
const router = express.Router();
const database = require('../database');

//REGISTRATION AND SIGN IN

//Registration
router.post('/registration', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] - /registration call has been recived.`);

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields!'
            });
        }

        const existingEmail = await database.doubleEmail(email);

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Account with this email is already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await database.registration({
            username: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully!'
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed! ' + error.message
        });
    }
});

module.exports = router;