//MODULE IMPORTS
const express = require('express');
const router = express.Router();

//SETTINGS
const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');
const isAdminMiddleware = require('../middleware/isAdminMiddleware.js');

// ADMIN DASHBOARD
router.get('/admin/dashboard', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /admin/dashboard hívás érkezett.`);

    try {
        const stats = await database.getAdminStats();
        const recentReservations = await database.getAdminRecentReservations(10);

        res.status(200).json({
            success: true,
            stats,
            recent_reservations: recentReservations
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba az admin dashboard lekérése során. ' + error.message
        });
    }
});

// ADMIN USERS
router.get('/admin/users', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /admin/users hívás érkezett.`);

    try {
        const users = await database.getAdminUsers();

        res.status(200).json({
            success: true,
            results: users
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a felhasználók lekérése során. ' + error.message
        });
    }
});

// ADMIN MENU
router.get('/admin/menu', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /admin/menu hívás érkezett.`);

    try {
        const menuItems = await database.getAdminMenuItems();

        res.status(200).json({
            success: true,
            results: menuItems
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a menüelemek lekérése során. ' + error.message
        });
    }
});

// ADMIN EVENTS
router.get('/admin/events', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /admin/events hívás érkezett.`);

    try {
        const events = await database.getAdminEvents();

        res.status(200).json({
            success: true,
            results: events
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba az események lekérése során. ' + error.message
        });
    }
});

// ADMIN REVIEWS
router.get('/admin/reviews', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /admin/reviews hívás érkezett.`);

    try {
        const reviews = await database.getAdminReviews();

        res.status(200).json({
            success: true,
            results: reviews
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a vélemények lekérése során. ' + error.message
        });
    }
});

// ADMIN DELETE REVIEW
router.delete('/admin/reviews/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] DELETE - /admin/reviews/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen vélemény azonosító.'
            });
        }

        const existingReview = await database.getReviewById(id);

        if (!existingReview) {
            return res.status(404).json({
                success: false,
                message: 'A vélemény nem található.'
            });
        }

        await database.deleteReview(id);

        const reviews = await database.getAdminReviews();

        res.status(200).json({
            success: true,
            message: 'Vélemény sikeresen törölve.',
            results: reviews
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a vélemény törlése során. ' + error.message
        });
    }
});

// ADMIN CREATE EVENT
router.post('/admin/events', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /admin/events hívás érkezett.`);

    try {
        const {
            name,
            description,
            event_date,
            start_time,
            end_time,
            free_slots,
            category
        } = req.body;

        if (!name || !event_date || !category) {
            return res.status(400).json({
                success: false,
                message: 'A név, dátum és kategória megadása kötelező.'
            });
        }

        const validCategories = ['bowling', 'pub', 'competition', 'music'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen esemény kategória.'
            });
        }

        const slots = Number(free_slots);

        if (!slots || slots < 1) {
            return res.status(400).json({
                success: false,
                message: 'A szabad helyek száma legalább 1 legyen.'
            });
        }

        const newId = await database.createEvent(
            name.trim(),
            description || '',
            event_date,
            start_time || null,
            end_time || null,
            slots,
            category
        );

        const events = await database.getAdminEvents();

        res.status(201).json({
            success: true,
            message: 'Esemény sikeresen létrehozva.',
            id: newId,
            results: events
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba az esemény létrehozása során. ' + error.message
        });
    }
});

// ADMIN UPDATE EVENT
router.patch('/admin/events/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] PATCH - /admin/events/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            event_date,
            start_time,
            end_time,
            free_slots,
            category
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen esemény azonosító.'
            });
        }

        if (!name || !event_date || !category) {
            return res.status(400).json({
                success: false,
                message: 'A név, dátum és kategória megadása kötelező.'
            });
        }

        const validCategories = ['bowling', 'pub', 'competition', 'music'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen esemény kategória.'
            });
        }

        const slots = Number(free_slots);

        if (!slots || slots < 1) {
            return res.status(400).json({
                success: false,
                message: 'A szabad helyek száma legalább 1 legyen.'
            });
        }

        const existingEvent = await database.getEventById(id);

        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                message: 'Az esemény nem található.'
            });
        }

        await database.updateEvent(
            id,
            name.trim(),
            description || '',
            event_date,
            start_time || null,
            end_time || null,
            slots,
            category
        );

        const events = await database.getAdminEvents();

        res.status(200).json({
            success: true,
            message: 'Esemény sikeresen frissítve.',
            results: events
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba az esemény frissítése során. ' + error.message
        });
    }
});

// ADMIN DELETE EVENT
router.delete('/admin/events/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] DELETE - /admin/events/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen esemény azonosító.'
            });
        }

        const existingEvent = await database.getEventById(id);

        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                message: 'Az esemény nem található.'
            });
        }

        await database.deleteEvent(id);

        const events = await database.getAdminEvents();

        res.status(200).json({
            success: true,
            message: 'Esemény sikeresen törölve.',
            results: events
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba az esemény törlése során. ' + error.message
        });
    }
});

// ADMIN DELETE RESERVATION
router.delete('/admin/reservations/:id', authenticateToken, isAdminMiddleware, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] DELETE - /admin/reservations/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen foglalás azonosító.'
            });
        }

        const existingReservation = await database.getReservationById(id);

        if (!existingReservation) {
            return res.status(404).json({
                success: false,
                message: 'A foglalás nem található.'
            });
        }

        await database.deleteReservation(id);

        const dashboard = await database.getAdminDashboard();

        res.status(200).json({
            success: true,
            message: 'Foglalás sikeresen törölve.',
            results: dashboard.reservations || []
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a foglalás törlése során. ' + error.message
        });
    }
});

module.exports = router;