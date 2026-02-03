const express = require('express');
const { User, Score, Interaction } = require('../models');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// SAVE TEST RESULT
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { test_type, answers, total_score, sub_dimensions, scale_period, week_number } = req.body;
        const userId = req.user.id;

        await Score.create({
            user_id: userId,
            test_type: test_type || 'BSO',
            scale_period: scale_period || 'process',
            total_score: total_score || 0,
            sub_dimensions: sub_dimensions || {},
            week_number: week_number || 0,
            timestamp: new Date()
        });

        await Interaction.create({
            user_id: userId,
            action_type: 'test_complete',
            content: `${test_type || 'Test'} tamamlandı - Skor: ${total_score}`,
            impact_score: total_score || 0,
            timestamp: new Date()
        });

        await User.findByIdAndUpdate(userId, { $inc: { total_points: 25 } });

        res.json({ success: true, points: 25 });

    } catch (error) {
        console.error('Test Save Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET TEST HISTORY
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const scores = await Score.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(20);

        res.json({ scores });

    } catch (error) {
        console.error('Test History Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
