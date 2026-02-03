const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// COMPLETE WHEEL TASK
router.post('/complete', authMiddleware, async (req, res) => {
    try {
        const { task, score } = req.body;
        const userId = req.user.id;

        await Interaction.create({
            user_id: userId,
            action_type: 'task_complete',
            content: `Çarkıfelek Görevi: ${task}`,
            impact_score: score || 15,
            timestamp: new Date()
        });

        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: score || 15 },
            $push: {
                wheelTasks: {
                    task: task,
                    completed: false,
                    addedAt: new Date()
                }
            }
        });

        res.json({ success: true, points: score || 15 });

    } catch (error) {
        console.error('Task Complete Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
