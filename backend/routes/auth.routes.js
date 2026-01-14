//MODULE IMPORTS
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//SETTINGS
const database = require('../database');

//REGISTRATION AND LOGIN

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

        const existingEmail = await database.checkEmail(email);

        if (existingEmail) {
            console.log('Account with this email is already exists.');

            return res.status(409).json({
                success: false,
                message: 'Account with this email is already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await database.registration({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully!'
        });
        console.log('User registered successfully!');
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed! ' + error.message
        });
        console.log('Registration failed!');
    }
});

//Login
router.post('/login', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] - /login call has been recived.`);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing email or password!'
            });
        }

        const user = await database.checkEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password!'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password!'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            role: user.role
        });
        console.log('Login successful!');
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed! ' + error.message
        });
        console.log('Login failed!');
    }
});


module.exports = router;