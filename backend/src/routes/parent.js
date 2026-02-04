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

        // Helper to generate AI Insight based on stats (Heuristic-based)
        const generateAIInsight = (child, trends, avgSentiment) => {
            const highBoundaries = child.stats?.gameScores?.boundary > 60;
            const lowSocial = trends.some(t => t.themes && t.themes.includes('Sosyal') && t.sentiment < 40);

            if (avgSentiment < 40) return `${child.name} bu aralar biraz zorlanıyor gibi görünüyor. Duygusal desteğinizi artırabilirsiniz.`;
            if (highBoundaries && lowSocial) return `${child.name} sınırlarını korumakta başarılı ancak sosyal ilişkilerinde çekingen olabilir.`;
            if (child.progress > 70) return `${child.name} harika bir bireyselleşme süreci geçiriyor! Özgüveni yüksek.`;
            return `${child.name} dengeli bir gelişim gösteriyor. Aktivitelerine devam etmesi önemli.`;
        };

        const dashboardData = await Promise.all(children.map(async (child) => {
            // 1. Scores (Games & Tests)
            const scores = await Score.find({ user_id: child._id });

            // 2. Recent Activities (Interactions)
            const interactions = await Interaction.find({
                user_id: child._id,
                action_type: { $in: ['test_complete', 'game_complete', 'journal_entry', 'login'] }
            }).sort({ timestamp: -1 }).limit(10);

            // 3. Wheel Tasks
            const completedTasks = child.wheelTasks?.filter(t => t.completed).length || 0;

            // Calculate aggregations
            let totalIndividuation = 50;
            let gameScores = { boundary: 0, distinctness: 0 };

            // Privacy-aware Journal Stats
            const journalStats = [];
            let totalJournalSentiment = 0;
            let journalCount = 0;

            interactions.forEach(i => {
                if (i.action_type === 'journal_entry') {
                    let parsed = {};
                    try { parsed = JSON.parse(i.content); } catch (e) { }

                    // PRIVACY FILTER: Do not return raw text/summary to parent
                    journalStats.push({
                        date: i.timestamp,
                        sentiment: parsed.sentimentScore || 50,
                        meRatio: parsed.meRatio || 0.5,
                        themes: parsed.themes || []
                    });
                    totalJournalSentiment += (parsed.sentimentScore || 50);
                    journalCount++;
                }
            });

            scores.forEach(s => {
                if (s.test_type === 'GAME') {
                    const raw = s.sub_dimensions?.rawScore || 0;
                    if (s.sub_dimensions?.gameId === 'boundary') gameScores.boundary = raw;
                } else if (s.test_type === 'BSO' || s.test_type === 'WEEKLY') {
                    totalIndividuation = s.total_score;
                }
            });

            const avgSentiment = journalCount > 0 ? (totalJournalSentiment / journalCount) : 50;
            const aiInsight = generateAIInsight({ name: child.username, stats: { gameScores }, progress: totalIndividuation }, journalStats, avgSentiment);

            // Sanitized Activities
            const sanitizedActivities = interactions.slice(0, 5).map(i => {
                let desc = i.content;
                if (i.action_type === 'journal_entry') {
                    // Extract themes if possible for a generic description
                    let themes = "";
                    try {
                        const p = JSON.parse(i.content);
                        if (p.themes && p.themes.length > 0) themes = ` - Odak: ${p.themes.join(', ')}`;
                    } catch (e) { }
                    desc = `Günlük Girişi${themes}`;
                }
                return {
                    type: i.action_type,
                    description: desc,
                    timestamp: i.timestamp
                };
            });

            return {
                id: child._id,
                name: child.username,
                progress: totalIndividuation,
                points: child.total_points || 0,
                activeWeek: child.active_week || 1,
                aiInsight,
                recentActivities: sanitizedActivities
            };
        }));

        // Twin Comparison Logic
        let comparisonInsight = "Çocuklarınızın gelişimi paralel ilerliyor.";
        if (dashboardData.length >= 2) {
            const c1 = dashboardData[0];
            const c2 = dashboardData[1];
            const diff = Math.abs(c1.progress - c2.progress);

            if (diff > 20) {
                comparisonInsight = `${c1.name} ve ${c2.name} arasında bireyselleşme hızında fark var. Her çocuğun kendi hızına saygı duymak önemlidir.`;
            } else if (c1.progress > 75 && c2.progress > 75) {
                comparisonInsight = "Harika! Her iki çocuğunuz da güçlü birer birey olma yolunda ilerliyor. Ayrışma süreci sağlıklı görünüyor.";
            } else if (c1.progress < 45 && c2.progress < 45) {
                comparisonInsight = "İkizler arasında bağımlılık yüksek olabilir. Bireysel aktivitelere daha fazla teşvik edebilirsiniz.";
            }
        }

        // Prepare Chart Data
        const chartLabels = ['Başlangıç', 'H1', 'H2', 'H3', 'H4', 'Güncel'];
        const datasets = dashboardData.map((child, index) => {
            // Simulate curve
            const start = 50;
            const current = child.progress;
            const step = (current - start) / 5;

            return {
                label: child.name,
                data: [start, start + step, start + step * 2, start + step * 3, start + step * 4, current].map(Math.round),
                borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(168, 85, 247)',
                backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(168, 85, 247, 0.5)',
                tension: 0.4
            };
        });

        // Aggregated Stats
        const totalActivities = dashboardData.reduce((acc, curr) => acc + curr.points, 0);
        const averageProgress = Math.round(dashboardData.reduce((acc, curr) => acc + curr.progress, 0) / (dashboardData.length || 1));
        const allRecentActivities = dashboardData.flatMap(c => c.recentActivities)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.json({
            data: {
                averageProgress,
                totalActivities,
                guidanceMode: "AI Destekli Analiz",
                aiInsight: comparisonInsight,
                childInsights: dashboardData.map(c => ({ name: c.name, insight: c.aiInsight })),
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
