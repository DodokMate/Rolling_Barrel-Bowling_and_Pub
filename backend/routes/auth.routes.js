//MODULE IMPORTS
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//SETTINGS
const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

//REGISTRATION AND LOGIN

//Registration
router.post('/registration', async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /registration hívás érkezett.`);

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            console.log('Sikertelen regisztráció: Hiányzó szükséges adatok!');
            return res.status(400).json({
                success: false,
                message: 'Hiányzó szükséges adatok!'
            });
        }

        const existingEmail = await database.checkEmail(email);

        if (existingEmail) {
            console.log('Sikertelen regisztráció: Felhasználói fiók ezzel az email címmel már létezik.');
            return res.status(409).json({
                success: false,
                message: 'Felhasználói fiók ezzel az email címmel már létezik.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await database.registration({
            name,
            email,
            password: hashedPassword
        }); 

        const newUser = await database.checkEmail(email);

        const token = jwt.sign({ 
            id: newUser.id, 
            role: newUser.role,
            name: newUser.name, 
            email: newUser.email 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '10s' });

        res.status(201).json({
            success: true,
            message: 'Felhasználó sikeresen regisztrálva!',
            user: newUser,
            token
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
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /login hívás érkezett.`);

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Sikertelen bejelentkezés: Hiányzó email vagy jelszó!');
            return res.status(400).json({
                success: false,
                message: 'Hiányzó email vagy jelszó!'
            });
        }

        const user = await database.checkEmail(email);

        if (!user) {
            console.log('Sikertelen bejelentkezés: Helytelen email vagy jelszó!');
            return res.status(401).json({
                success: false,
                message: 'Helytelen email vagy jelszó!'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Sikertelen bejelentkezés: Helytelen jelszó!');
            return res.status(401).json({
                success: false,
                message: 'Helytelen jelszó!'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '10s' }
        );

        res.status(200).json({
            success: true,
            message: 'Sikeres bejelentkezés!',
            token
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

//Authenticate token
router.get('/authToken', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token érvényes!',
        user: req.user
    });
});

module.exports = router;