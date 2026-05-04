const express = require('express');
const router = express.Router();

const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

// GET USER MENU FAVOURITES
router.get('/menu/favourites', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /menu/favourites hívás érkezett.`);

    try {
        const userId = req.user.id;
        const favourites = await database.getUserMenuFavourites(userId);

        res.status(200).json({
            success: true,
            results: favourites
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a kedvencek lekérése során. ' + error.message
        });
    }
});

// TOGGLE MENU FAVOURITE
router.post('/menu/favourites/toggle', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /menu/favourites/toggle hívás érkezett.`);

    try {
        const userId = req.user.id;
        const { menu_item_id } = req.body;

        if (!menu_item_id) {
            return res.status(400).json({
                success: false,
                message: 'Hiányzó menüelem azonosító.'
            });
        }

        const result = await database.toggleMenuFavourite(userId, Number(menu_item_id));
        const favourites = await database.getUserMenuFavourites(userId);

        res.status(200).json({
            success: true,
            action: result.action,
            results: favourites
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a kedvenc módosítása során. ' + error.message
        });
    }
});

module.exports = router;