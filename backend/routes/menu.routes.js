const express = require('express');
const router = express.Router();

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

module.exports = router;