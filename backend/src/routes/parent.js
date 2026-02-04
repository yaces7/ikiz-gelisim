const express = require('express');
const { User, Score, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// PARENT DASHBOARD DATA
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const parentId = req.user.id;
        const parent = await User.findById(parentId);

        if (!parent || parent.role !== 'parent') {
            return res.status(403).json({ error: 'Access denied. Parent role required.' });
        }

        if (!parent.familyCode) {
            return res.json({ children: [], message: 'No family code linked.' });
        }

        // Find children with same family code
        const children = await User.find({
            familyCode: parent.familyCode,
            role: { $in: ['user', 'twin'] },
            _id: { $ne: parentId }
        });

        const dashboardData = await Promise.all(children.map(async (child) => {
            // 1. Scores (Individuation)
            const scores = await Score.find({ user_id: child._id });

            // Calculate aggregations
            let totalIndividuation = 50;
            let gameScores = { boundary: 0, distinctness: 0 };

            scores.forEach(s => {
                if (s.test_type === 'GAME') {
                    // Normalize game scores
                    const raw = s.sub_dimensions?.rawScore || 0;
                    if (s.sub_dimensions?.gameId === 'boundary') gameScores.boundary = raw;
                }
            });

            // 2. Journal Analysis (Sentiment & Me-Ratio)
            const journals = await Interaction.find({
                user_id: child._id,
                action_type: 'journal_entry'
            }).sort({ timestamp: -1 }).limit(5);

            const journalStats = journals.map(j => {
                let parsed = {};
                try { parsed = JSON.parse(j.content); } catch (e) { }
                return {
                    date: j.timestamp,
                    sentiment: parsed.sentimentScore || 50,
                    meRatio: parsed.meRatio || 0.5
                };
            });

            return {
                id: child._id,
                name: child.username,
                level: child.level,
                currentWeek: child.current_week,
                stats: {
                    gameScores,
                    journalTrends: journalStats
                }
            };
        }));

        res.json({
            familyCode: parent.familyCode,
            children: dashboardData
        });

    } catch (error) {
        console.error('Parent Dashboard Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
