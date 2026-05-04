const express = require('express');
const router = express.Router();

const database = require('../database.js');
const authenticateToken = require('../middleware/authMiddleware.js');

//GET REVIEWS
router.get('/reviews', async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] GET - /reviews hívás érkezett.`);

    try {
        const reviews = await database.getReviews(3);

        res.status(200).json({
            success: true,
            results: reviews
        });

        console.log('Vélemények sikeresen lekérve.');
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Hiba a vélemények lekérése során. ' + error.message
        });
    }
});

//POST REVIEW
router.post('/reviews', authenticateToken, async (req, res) => {
    console.log(`[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] POST - /reviews hívás érkezett.`);

    try {
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const parsedRating = Number(rating);

        if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Az értékelésnek 1 és 5 csillag között kell lennie.'
            });
        }

        if (comment && comment.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'A vélemény maximum 1000 karakter lehet.'
            });
        }

        await database.addReview(userId, parsedRating, comment || '');

        const reviews = await database.getReviews(3);

        res.status(201).json({
            success: true,
            message: 'Köszönjük az értékelésedet!',
            results: reviews
        });

        console.log('Új vélemény sikeresen rögzítve.');
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Szerverhiba. ' + error.message
        });
    }
});

module.exports = router;