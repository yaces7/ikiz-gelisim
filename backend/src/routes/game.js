const express = require('express');
const { User, Score, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// SAVE GAME SCORE
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { gameId, score, maxScore } = req.body;
        const userId = req.user.id;

        await Score.create({
            user_id: userId,
            test_type: 'GAME',
            total_score: score || 0,
            sub_dimensions: { gameId, rawScore: score, maxScore },
            timestamp: new Date()
        });

        await Interaction.create({
            user_id: userId,
            action_type: 'game_played',
            content: `Oyun: ${gameId} - Skor: ${score}`,
            impact_score: score || 0,
            timestamp: new Date()
        });

        await User.findByIdAndUpdate(userId, { $inc: { total_points: Math.min(score || 0, 50) } });

        res.json({ success: true, points: Math.min(score || 0, 50) });

    } catch (error) {
        console.error('Game Save Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
