const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ANALYZE & SAVE JOURNAL ENTRY
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { content, mood, moodIcon, guidedQuestion, week } = req.body;
        const userId = req.user.id;

        if (!content || content.length < 10) {
            return res.status(400).json({ error: 'Entry too short' });
        }

        const lowerEntry = content.toLowerCase();

        // Sentiment Analysis
        let sentimentScore = 50;
        const positiveWords = ['mutlu', 'harika', 'güzel', 'seviyorum', 'başardım', 'gurur', 'huzur', 'iyi', 'keyif', 'sevinç', 'umut'];
        const negativeWords = ['üzgün', 'kötü', 'sinir', 'kızgın', 'korku', 'endişe', 'stres', 'kaygı', 'yalnız', 'bıktım', 'zor'];

        let posCount = 0, negCount = 0;
        positiveWords.forEach(w => { if (lowerEntry.includes(w)) posCount++; });
        negativeWords.forEach(w => { if (lowerEntry.includes(w)) negCount++; });

        sentimentScore = Math.min(100, Math.max(0, 50 + (posCount * 10) - (negCount * 10)));

        let sentimentLabel = 'Nötr 😐';
        if (sentimentScore >= 60) sentimentLabel = 'Pozitif 😊';
        else if (sentimentScore <= 40) sentimentLabel = 'Negatif 😔';

        // Me/We Analysis
        const meWords = (content.match(/\bben\b|\bbenim\b|\bkendim\b|\bkendi\b|\bbana\b|\bbeni\b/gi) || []).length;
        const weWords = (content.match(/\bbiz\b|\bbizim\b|\bikizim\b|\bkardeşim\b|\bberaber\b|\bbirlikte\b/gi) || []).length;
        const total = meWords + weWords || 1;
        const meRatio = meWords / total;

        // Theme Detection
        const themes = [];
        if (lowerEntry.includes('okul') || lowerEntry.includes('ders') || lowerEntry.includes('sınav')) themes.push('Akademik');
        if (lowerEntry.includes('arkadaş') || lowerEntry.includes('sosyal')) themes.push('Sosyal');
        if (lowerEntry.includes('aile') || lowerEntry.includes('anne') || lowerEntry.includes('baba')) themes.push('Aile');
        if (lowerEntry.includes('ikiz') || lowerEntry.includes('kardeş')) themes.push('İkizlik');
        if (lowerEntry.includes('karar') || lowerEntry.includes('seçtim')) themes.push('Karar Alma');
        if (lowerEntry.includes('sınır') || lowerEntry.includes('hayır')) themes.push('Sınır Koyma');
        if (lowerEntry.includes('gelecek') || lowerEntry.includes('hedef')) themes.push('Gelecek');
        if (themes.length === 0) themes.push('Genel');

        // AI Feedback
        let feedback = meRatio > 0.6
            ? 'Yazında bireysel odak yüksek - bireyselleşme sürecinde olumlu bir işaret! '
            : meRatio < 0.4
                ? 'Yazında ikizin ve "biz" kavramı öne çıkıyor. Kendi alanını da oluşturmaya çalış. '
                : 'Dengeli bir bakış açısı görüyorum. ';

        feedback += sentimentScore >= 70
            ? 'Olumlu bir ruh hali içindesin!'
            : sentimentScore <= 30
                ? 'Kendine nazik ol ve destek almaktan çekinme.'
                : 'Her duygu geçerlidir, yazmaya devam et.';

        // Save to DB
        await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: JSON.stringify({
                text: content,
                mood, moodIcon, guidedQuestion, week,
                sentimentScore, meRatio, weRatio: 1 - meRatio, themes
            }),
            impact_score: sentimentScore,
            timestamp: new Date()
        });

        // Add XP
        await User.findByIdAndUpdate(userId, { $inc: { total_points: 10 } });

        res.json({
            success: true,
            sentiment: sentimentLabel,
            sentimentScore,
            me_ratio: meRatio,
            we_ratio: 1 - meRatio,
            themes,
            feedback
        });

    } catch (error) {
        console.error('Journal Analyze Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET HISTORY
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const interactions = await Interaction.find({
            user_id: userId,
            action_type: 'journal_entry'
        }).sort({ timestamp: -1 }).limit(30);

        const entries = interactions.map(i => {
            let parsed = {};
            try {
                parsed = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
            } catch {
                parsed = { text: i.content || '' };
            }

            return {
                _id: i._id,
                date: i.timestamp,
                mood: parsed.moodIcon || '😐',
                preview: (parsed.text || '').substring(0, 100) + '...',
                sentiment: parsed.sentimentScore >= 60 ? 'Pozitif' : parsed.sentimentScore <= 40 ? 'Negatif' : 'Nötr',
                themes: parsed.themes || []
            };
        });

        res.json({ entries });

    } catch (error) {
        console.error('Journal History Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET INSIGHTS
router.get('/insights', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const interactions = await Interaction.find({
            user_id: userId,
            action_type: 'journal_entry',
            timestamp: { $gte: oneWeekAgo }
        });

        if (interactions.length < 1) {
            return res.json({ totalEntries: 0, message: 'Henüz yeterli veri yok' });
        }

        const moodDistribution = {};
        const allThemes = [];
        let totalMeRatio = 0, totalSentiment = 0;

        interactions.forEach(i => {
            let parsed = {};
            try {
                parsed = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
            } catch { parsed = {}; }

            const mood = parsed.moodIcon || '😐';
            moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
            if (parsed.themes) allThemes.push(...parsed.themes);
            totalMeRatio += (parsed.meRatio || 0.5);
            totalSentiment += (parsed.sentimentScore || 50);
        });

        const themeCount = {};
        allThemes.forEach(t => { themeCount[t] = (themeCount[t] || 0) + 1; });
        const topThemes = Object.entries(themeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);

        const avgMeRatio = Math.round((totalMeRatio / interactions.length) * 100);
        const avgSentiment = Math.round(totalSentiment / interactions.length);

        let summary = avgSentiment >= 60
            ? 'Bu hafta genel olarak olumlu bir ruh hali içindesin. '
            : avgSentiment <= 40
                ? 'Bu hafta bazı zorluklarla karşılaşmış olabilirsin. '
                : 'Bu hafta dengeli bir dönem geçirdin. ';

        summary += avgMeRatio >= 60
            ? 'Bireysel odağın yüksek. '
            : avgMeRatio <= 40
                ? 'İkizin hakkında çok düşünüyorsun. '
                : '';

        summary += `Bu hafta ${interactions.length} günlük yazısı yazdın!`;

        res.json({
            totalEntries: interactions.length,
            moodDistribution,
            topThemes,
            avgMeRatio,
            avgSentiment,
            summary
        });

    } catch (error) {
        console.error('Journal Insights Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
