const express = require('express');
const router = express.Router();

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

module.exports = router;