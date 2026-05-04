//MODULE IMPORTS
const express = require('express');
const router = express.Router();

//SETTINGS
const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

//ALL EVENTS
router.get('/allEvents', async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /allEvents hívás érkezett.`);

    try {
        const events = await database.getEvents();

        const formatted = events.map(date => ({
            ...date,
            event_date: date.event_date.toISOString().split("T")[0]
        }));

        res.status(200).json({
            success: true,
            message: 'Események sikeresen lekérve.',
            results: formatted
        });
        console.log('Események sikeresen lekérve.');
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Hiba az események lekérése során. ' + error.message
        });
        console.log('Hiba az események lekérése során.');
    }
});

//JOIN EVENT
router.post("/toggleJoin", authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /toggleJoin hívás érkezett.`);

    try {
        const userId = req.user.id;
        const { event_id } = req.body;

        let raw = await database.getUserRegisteredEvents(userId);
        let events = [];

        if (raw && raw !== "null" && raw !== "") {
            try {
                events = JSON.parse(raw);
            } catch (e) {
                events = [];
            }
        }

        let action = "";
        const eventIdNum = Number(event_id);

        if (events.includes(eventIdNum)) {
            events = events.filter(id => id !== eventIdNum);
            action = "removed";
        } else {
            action = "added";
        }

        if (action === "added") {
            console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] Sikeres jelentkezés az eseményre (eventId: ${eventIdNum}).`);

            const updatedRows = await database.updateEventFreeSlots(eventIdNum, -1);
            if (!updatedRows) {
                console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] Sikertelen jelentkezés: nincs több szabad hely az eseményen (eventId: ${eventIdNum}).`);
                return res.status(400).json({
                    success: false,
                    message: 'Nincs több szabad hely erre az eseményre.'
                });
            }
            events.push(eventIdNum);
        } 
        else {
            console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] Eseményről való visszavonás sikeresen megtörtént (eventId: ${eventIdNum}).`);

            await database.updateEventFreeSlots(eventIdNum, 1);
        }

        await database.updateUserRegisteredEvents(userId, JSON.stringify(events));

        const updatedEvent = await database.getEventById(eventIdNum);

        res.status(200).json({
            success: true,
            action,
            free_slots: updatedEvent?.free_slots ?? null
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Szerverhiba.' + err.message
        });
        console.log('Szerverhiba.');
    }
});

module.exports = router;