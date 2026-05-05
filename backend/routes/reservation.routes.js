const express = require('express');
const router = express.Router();

const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

function addOneHour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours + 1, minutes, 0, 0);

    return date.toTimeString().slice(0, 5);
}

// GET AVAILABLE RESOURCES
router.get('/reservations/available', async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /reservations/available hívás érkezett.`);

    try {
        const { type, date, time, guests } = req.query;

        if (!type || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Hiányzó foglalási adatok.'
            });
        }

        const startTime = time;
        const endTime = addOneHour(time);
        const guestCount = Number(guests) || 1;

        let results = [];

        if (type === 'lane') {
            results = await database.getAvailableLanes(date, startTime, endTime);
        } else if (type === 'table') {
            results = await database.getAvailableTables(date, startTime, endTime, guestCount);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen foglalási típus.'
            });
        }

        res.status(200).json({
            success: true,
            results,
            start_time: startTime,
            end_time: endTime
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a szabad helyek lekérése során. ' + error.message
        });
    }
});

// CREATE RESERVATION
router.post('/reservations', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /reservations hívás érkezett.`);

    try {
        const userId = req.user.id;

        const {
            type,
            reservation_date,
            start_time,
            guests,
            resource_id,
            notes
        } = req.body;

        if (!type || !reservation_date || !start_time || !resource_id) {
            return res.status(400).json({
                success: false,
                message: 'Minden kötelező adatot ki kell tölteni.'
            });
        }

        const guestCount = Number(guests);

        if (!guestCount || guestCount < 1 || guestCount > 6) {
            return res.status(400).json({
                success: false,
                message: 'A létszám 1 és 6 fő között lehet.'
            });
        }

        const endTime = addOneHour(start_time);

        let reservationId;

        if (type === 'lane') {
            const available = await database.isLaneAvailable(
                Number(resource_id),
                reservation_date,
                start_time,
                endTime
            );

            if (!available) {
                return res.status(409).json({
                    success: false,
                    message: 'Ez a pálya ebben az időpontban már foglalt.'
                });
            }

            reservationId = await database.createLaneReservation(
                userId,
                Number(resource_id),
                reservation_date,
                start_time,
                endTime,
                guestCount,
                notes || ''
            );
        } else if (type === 'table') {
            const available = await database.isTableAvailable(
                Number(resource_id),
                reservation_date,
                start_time,
                endTime
            );

            if (!available) {
                return res.status(409).json({
                    success: false,
                    message: 'Ez az asztal ebben az időpontban már foglalt.'
                });
            }

            reservationId = await database.createTableReservation(
                userId,
                Number(resource_id),
                reservation_date,
                start_time,
                endTime,
                guestCount,
                notes || ''
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen foglalási típus.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Sikeres foglalás!',
            reservation_id: reservationId
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a foglalás rögzítése során. ' + error.message
        });
    }
});

module.exports = router;