//MODULE IMPORTS
const express = require('express');
const router = express.Router();

//SETTINGS
const authorizeAdmin = require('../middleware/isAdminMiddleware.js');
const authenticateToken = require('../middleware/authMiddleware.js');
const database = require('../database.js');

// GET MENU ITEMS
router.get('/menu', async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /menu hívás érkezett.`);

    try {
        const menuItems = await database.getMenuItems();

        res.status(200).json({
            success: true,
            results: menuItems
        });

        console.log('Menü elemek sikeresen lekérve.');
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a menü elemek lekérése során. ' + error.message
        });
    }
});

// ADMIN CREATE MENU ITEM
router.post('/admin/menu', authenticateToken, authorizeAdmin, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /admin/menu hívás érkezett.`);

    try {
        const {
            name,
            description,
            price,
            category,
            subcategory
        } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'A név, ár és kategória megadása kötelező.'
            });
        }

        if (!['food', 'drink'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen kategória.'
            });
        }

        const validSubcategories = ['burger', 'pizza', 'pasta', 'alcoholic', 'non_alcoholic', '', null];

        if (!validSubcategories.includes(subcategory)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen alkategória.'
            });
        }

        const newId = await database.createMenuItem(
            name.trim(),
            description || '',
            Number(price),
            category,
            subcategory || null
        );

        const menuItems = await database.getAdminMenuItems();

        res.status(201).json({
            success: true,
            message: 'Menüelem sikeresen létrehozva.',
            id: newId,
            results: menuItems
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a menüelem létrehozása során. ' + error.message
        });
    }
});

// ADMIN UPDATE MENU ITEM
router.patch('/admin/menu/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] PATCH - /admin/menu/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            price,
            category,
            subcategory
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen menüelem azonosító.'
            });
        }

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'A név, ár és kategória megadása kötelező.'
            });
        }

        if (!['food', 'drink'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen kategória.'
            });
        }

        const validSubcategories = ['burger', 'pizza', 'pasta', 'alcoholic', 'non_alcoholic', '', null];

        if (!validSubcategories.includes(subcategory)) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen alkategória.'
            });
        }

        const existingItem = await database.getMenuItemById(id);

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'A menüelem nem található.'
            });
        }

        await database.updateMenuItem(
            id,
            name.trim(),
            description || '',
            Number(price),
            category,
            subcategory || null
        );

        const menuItems = await database.getAdminMenuItems();

        res.status(200).json({
            success: true,
            message: 'Menüelem sikeresen frissítve.',
            results: menuItems
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a menüelem frissítése során. ' + error.message
        });
    }
});

// ADMIN DELETE MENU ITEM
router.delete('/admin/menu/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] DELETE - /admin/menu/${req.params.id} hívás érkezett.`);

    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Érvénytelen menüelem azonosító.'
            });
        }

        const existingItem = await database.getMenuItemById(id);

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'A menüelem nem található.'
            });
        }

        await database.deleteMenuItem(id);

        const menuItems = await database.getAdminMenuItems();

        res.status(200).json({
            success: true,
            message: 'Menüelem sikeresen törölve.',
            results: menuItems
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a menüelem törlése során. ' + error.message
        });
    }
});

module.exports = router;