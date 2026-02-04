const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// CHECK PROGRESSION
router.post('/check', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return current week for locking logic
        res.json({
            success: true,
            week: user.current_week || 1,
            activeWeek: user.active_week || 1
        });

    } catch (error) {
        console.error('Progression Check Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// SELECT ACTIVE WEEK
router.post('/select-week', authMiddleware, async (req, res) => {
    try {
        const { week } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Ensure user cannot select a locked week
        if (week > (user.current_week || 1)) {
            return res.status(403).json({ error: 'Bu hafta henüz açılmadı.' });
        }

        user.active_week = week;
        await user.save();

        res.json({ success: true, activeWeek: week });
    } catch (error) {
        console.error('Select Week Error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// UPDATE PROGRESSION (Optional: For admin or automatic updates)
router.post('/update', authMiddleware, async (req, res) => {
    try {
        const { week } = req.body;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { current_week: week },
            { new: true }
        );

        res.json({ success: true, week: user.current_week });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
