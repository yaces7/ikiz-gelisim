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
            // 1. Scores (Games & Tests)
            const scores = await Score.find({ user_id: child._id });

            // 2. Recent Activities (Interactions)
            const interactions = await Interaction.find({
                user_id: child._id,
                action_type: { $in: ['test_complete', 'game_complete', 'journal_entry', 'login'] }
            }).sort({ timestamp: -1 }).limit(5);

            // 3. Wheel Tasks
            const completedTasks = child.wheelTasks?.filter(t => t.completed).length || 0;

            // Calculate aggregations
            let totalIndividuation = 50;
            let gameScores = { boundary: 0, distinctness: 0 };
            let totalPoints = child.total_points || 0;

            scores.forEach(s => {
                if (s.test_type === 'GAME') {
                    const raw = s.sub_dimensions?.rawScore || 0;
                    if (s.sub_dimensions?.gameId === 'boundary') gameScores.boundary = raw;
                } else if (s.test_type === 'BSO' || s.test_type === 'WEEKLY') {
                    // Update individuation based on latest test
                    totalIndividuation = s.total_score;
                }
            });

            return {
                id: child._id,
                name: child.username,
                progress: totalIndividuation,
                points: totalPoints,
                recentActivities: interactions.map(i => ({
                    type: i.action_type,
                    description: i.content,
                    timestamp: i.timestamp
                }))
            };
        }));

        // Prepare Chart Data
        const chartLabels = ['Başlangıç', 'Hafta 1', 'Hafta 2', 'Güncel'];
        const datasets = dashboardData.map((child, index) => ({
            label: child.name,
            data: [50, 55, 60, child.progress], // Placeholder history, real app would query historic scores
            borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(168, 85, 247)',
            backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(168, 85, 247, 0.5)',
            tension: 0.4
        }));

        // Aggregated Stats
        const totalActivities = dashboardData.reduce((acc, curr) => acc + curr.points, 0);
        const averageProgress = Math.round(dashboardData.reduce((acc, curr) => acc + curr.progress, 0) / (dashboardData.length || 1));
        const allRecentActivities = dashboardData.flatMap(c => c.recentActivities)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        // Simple AI Insight Logic
        let aiInsight = "Çocuklarınızın gelişimi düzenli ilerliyor.";
        if (averageProgress > 70) aiInsight = "Harika! Çocuklarınızın bireyselleşme seviyesi yüksek. Onları desteklemeye devam edin.";
        else if (averageProgress < 40) aiInsight = "Çocuklarınızın biraz daha desteğe ihtiyacı olabilir. Bireysel aktivitelere teşvik edin.";

        res.json({
            data: {
                averageProgress,
                totalActivities,
                guidanceMode: "Aktif",
                aiInsight,
                chartLabels,
                datasets,
                recentActivities: allRecentActivities
            }
        });

    } catch (error) {
        console.error('Parent Dashboard Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
