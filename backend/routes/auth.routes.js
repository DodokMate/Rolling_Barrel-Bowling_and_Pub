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
                message: 'Hiányzó szükséges adatok!'
            });
        }

        const existingEmail = await database.checkEmail(email);

        if (existingEmail) {
            console.log('Felhasználói fiók ezzel az email címmel már létezik.');

            return res.status(409).json({
                success: false,
                message: 'Felhasználói fiók ezzel az email címmel már létezik.'
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
            message: 'Felhasználó sikeresen regisztrálva!'
        });
        console.log('Felhasználó sikeresen regisztrálva!');
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sikertelen regisztráció! ' + error.message
        });
        console.log('Sikertelen regisztráció!');
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
                message: 'Hiányzó email vagy jelszó!'
            });
        }

        const user = await database.checkEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Helytelen email vagy jelszó!'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Helytelen jelszó!'
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
            message: 'Sikeres bejelentkezés!',
            token,
            role: user.role
        });
        console.log('Sikeres bejelentkezés!');
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Sikertelen bejelentkezés! ' + error.message
        });
        console.log('Sikertelen bejelentkezés!');
    }
});


module.exports = router;