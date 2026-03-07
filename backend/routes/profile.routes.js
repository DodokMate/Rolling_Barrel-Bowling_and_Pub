//MODULE IMPORTS
const express = require('express');
const router = express.Router();

//SETTINGS
const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

router.get('/profile', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /profile hívás érkezett.`);

    try {
        const userEmail = req.user.email;

        const userData = await database.userData(userEmail);
        if (!userData) {
            console.log('Nem található felhasználó ezzel az email címmel:', userEmail);

            return res.status(404).json({
                success: false,
                message: "Nem található felhasználó ezzel az email címmel." + userEmail
            });
        }

        res.status(200).json({
            success: true,
            user: userData
        });
        console.log('Felhasználói adatok sikeresen lekérve.');

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Hiba történt a felhasználói adatok lekérése során." + error.message
        });
        console.log("Hiba történt a felhasználói adatok lekérése során.");
    }
});

module.exports = router;