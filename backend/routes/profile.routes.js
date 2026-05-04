const express = require('express');
const router = express.Router();

const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

// GET PROFILE DATA
router.get('/profile', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /profile hívás érkezett.`);

    try {
        const userId = req.user.id;

        const user = await database.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Felhasználó nem található.'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a profil lekérése során. ' + error.message
        });
    }
});

// UPDATE PROFILE NAME
router.patch('/profile', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] PATCH - /profile hívás érkezett.`);

    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'A név legalább 2 karakter hosszú legyen.'
            });
        }

        if (name.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: 'A név maximum 100 karakter lehet.'
            });
        }

        await database.updateUserName(userId, name.trim());

        const user = await database.getUserById(userId);

        res.status(200).json({
            success: true,
            message: 'Profil sikeresen frissítve.',
            user
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a profil frissítése során. ' + error.message
        });
    }
});

// GET PROFILE RESERVATIONS
router.get('/profile/reservations', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /profile/reservations hívás érkezett.`);

    try {
        const userId = req.user.id;

        const laneReservations = await database.getUserLastLaneReservations(userId, 3);
        const tableReservations = await database.getUserLastTableReservations(userId, 3);

        res.status(200).json({
            success: true,
            lane_reservations: laneReservations,
            table_reservations: tableReservations
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a foglalások lekérése során. ' + error.message
        });
    }
});

module.exports = router;