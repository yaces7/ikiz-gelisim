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
                action_type: { $in: ['test_complete', 'game_complete', 'journal_entry', 'login', 'character_created'] }
            }).sort({ timestamp: -1 }).limit(10);

            // Calculate aggregations
            let totalIndividuation = 50;
            let factors = {
                boundaries: 50,
                social: 50,
                selfAwareness: 50
            };

            // Privacy-aware Journal Stats
            let journalCount = 0;
            let totalJournalSentiment = 0;
            let meTotal = 0;

            interactions.forEach(i => {
                if (i.action_type === 'journal_entry') {
                    let parsed = {};
                    try { parsed = JSON.parse(i.content); } catch (e) { }
                    totalJournalSentiment += (parsed.sentimentScore || 50);
                    meTotal += (parsed.meRatio || 0.5);
                    journalCount++;
                }
            });

            scores.forEach(s => {
                if (s.test_type === 'GAME') {
                    const raw = s.sub_dimensions?.rawScore || 50;
                    const gid = s.sub_dimensions?.gameId;
                    if (gid === 'boundary') factors.boundaries = Math.min(100, (factors.boundaries + raw) / 2);
                    if (gid === 'diplomacy') factors.social = Math.min(100, (factors.social + raw) / 2);
                } else if (s.test_type === 'BSO' || s.test_type === 'WEEKLY') {
                    totalIndividuation = s.total_score;
                    factors.selfAwareness = Math.min(100, (factors.selfAwareness + totalIndividuation) / 2);
                }
            });

            const avgSentiment = journalCount > 0 ? (totalJournalSentiment / journalCount) : 50;
            const avgMeRatio = journalCount > 0 ? (meTotal / journalCount) : 0.5;

            // Tailored Insight
            let tailoredInsight = `${child.username} sürece aktif katılıyor. `;
            if (avgMeRatio > 0.7) tailoredInsight += "Özellikle 'ben' dilini kullanımı artmış, bu güçlü bir bireyleşme sinyali.";
            else if (avgMeRatio < 0.4) tailoredInsight += "Hala 'biz' dili çok baskın, ortak aktiviteler yerine tekil hobilere teşvik edebilirsiniz.";

            if (factors.boundaries < 45) tailoredInsight += " Sınır koyma konusunda biraz desteğe ihtiyacı olabilir.";

            // Sanitized Activities
            const sanitizedActivities = interactions.slice(0, 5).map(i => {
                let desc = i.content;
                if (i.action_type === 'journal_entry') {
                    desc = "Günlük Girişi Tamamlandı";
                } else if (i.action_type === 'character_created') {
                    desc = "Özgün Karakter Oluşturuldu";
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
                factors,
                character: child.character || null,
                aiInsight: tailoredInsight,
                recentActivities: sanitizedActivities
            };
        }));

        // Twin Comparison Logic
        let comparisonInsight = "Çocuklarınızın gelişimi paralel ilerliyor.";
        if (dashboardData.length >= 2) {
            const c1 = dashboardData[0];
            const c2 = dashboardData[1];
            const diff = Math.abs(c1.progress - c2.progress);
            const interests1 = c1.character?.goals || [];
            const interests2 = c2.character?.goals || [];

            const sharedInterests = interests1.filter(i => interests2.includes(i));

            if (diff > 20) {
                comparisonInsight = `${c1.name} gelişim basamaklarını daha hızlı tırmanıyor. ${c2.name}'i kendi hızıyla desteklemek önemli.`;
            } else if (sharedInterests.length < 2 && sharedInterests.length > 0) {
                comparisonInsight = "Harika! Farklı ilgi alanları geliştirmeye başlamışlar. Bu bireyselleşme için çok sağlıklı.";
            } else if (sharedInterests.length > 4) {
                comparisonInsight = "İlgi alanları hala çok iç içe. Birbirlerinden bağımsız kulüp veya kurslara yönlendirebilirsiniz.";
            }
        }

        // Prepare Chart Data
        const chartLabels = ['Giriş', '1. Aşama', '2. Aşama', '3. Aşama', '4. Aşama', 'Güncel'];
        const datasets = dashboardData.map((child, index) => {
            const current = child.progress;
            return {
                label: child.name,
                data: [40, 45, 52, 60, 68, current].map(v => Math.min(current, v)),
                borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(168, 85, 247)',
                backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                tension: 0.4,
                fill: true
            };
        });

        res.json({
            data: {
                averageProgress: Math.round(dashboardData.reduce((acc, curr) => acc + curr.progress, 0) / (dashboardData.length || 1)),
                totalActivities: dashboardData.reduce((acc, curr) => acc + curr.points, 0),
                guidanceMode: "İleri Seviye AI Analizi",
                aiInsight: comparisonInsight,
                children: dashboardData,
                chartLabels,
                datasets,
                recentActivities: dashboardData.flatMap(c => c.recentActivities).sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Parent Dashboard Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
