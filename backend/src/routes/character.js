const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// SAVE CHARACTER
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { name, appearance, values, goals } = req.body;
        const userId = req.user.id;

        await User.findByIdAndUpdate(userId, {
            character: {
                name: name || 'Kahraman',
                appearance: appearance || { emoji: '👤' },
                values: values || [],
                goals: goals || []
            },
            $inc: { total_points: 25 }
        });

        await Interaction.create({
            user_id: userId,
            action_type: 'character_created',
            content: `Karakter oluşturuldu: ${name}`,
            impact_score: 25,
            timestamp: new Date()
        });

        res.json({ success: true, points: 25 });

    } catch (error) {
        console.error('Character Save Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
