const express = require('express');
const { User, Score, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET PROFILE STATS
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const scores = await Score.find({ user_id: userId }) || [];
        const interactions = await Interaction.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(10) || [];

        // Calculate Stats
        const radarStats = {
            'Özerklik': 50,
            'Sınırlar': 50,
            'İletişim': 50,
            'Özgüven': 50,
            'Farkındalık': 50
        };

        let gamesPlayed = 0;
        let testsCompleted = 0;

        scores.forEach(s => {
            if (s.test_type === 'GAME') {
                gamesPlayed++;
                const raw = s.sub_dimensions?.rawScore || 10;
                const gid = s.sub_dimensions?.gameId;
                if (gid === 'boundary') radarStats['Sınırlar'] = Math.min(100, radarStats['Sınırlar'] + (raw / 5));
                if (gid === 'diplomacy') radarStats['İletişim'] = Math.min(100, radarStats['İletişim'] + (raw / 5));
                if (gid === 'mirror') radarStats['Farkındalık'] = Math.min(100, radarStats['Farkındalık'] + (raw / 5));
                if (gid === 'social') radarStats['Özerklik'] = Math.min(100, radarStats['Özerklik'] + (raw / 10));
            } else if (s.test_type === 'BSO') {
                testsCompleted++;
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
            }
        });

        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, Math.round(radarStats[k])));
        });

        const level = Math.floor((user.total_points || 0) / 500) + 1;
        const TITLES = ['Yeni Başlayan', 'Kâşif', 'Yolcu', 'Gezgin', 'Usta', 'Uzman', 'Bilge'];
        const title = TITLES[Math.min(level - 1, TITLES.length - 1)];

        res.json({
            user: {
                username: user.username,
                email: user.email,
                familyCode: user.familyCode,
                level,
                title,
                nextLevelProgress: ((user.total_points || 0) % 500) / 5,
                current_week: user.current_week || 1,
                completed_weeks: user.completed_weeks || []
            },
            stats: {
                totalPoints: user.total_points || 0,
                gamesPlayed,
                testsCompleted,
                radarData: Object.values(radarStats),
                radarLabels: Object.keys(radarStats)
            },
            character: user.character || null,
            wheelTasks: user.wheelTasks || [],
            recentActivities: interactions.map(i => ({
                action: (i.content || i.action_type || 'Aktivite').substring(0, 50),
                timestamp: i.timestamp
            }))
        });

    } catch (error) {
        console.error('Profile Stats Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// COMPLETE TASK
router.post('/complete-task', authMiddleware, async (req, res) => {
    try {
        const { taskIndex } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.wheelTasks && user.wheelTasks[taskIndex]) {
            user.wheelTasks[taskIndex].completed = true;
            user.wheelTasks[taskIndex].completedAt = new Date();
            user.total_points = (user.total_points || 0) + 15;
            await user.save();
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Complete Task Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
