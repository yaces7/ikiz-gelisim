const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// GROQ AI ile analiz yap
async function analyzeWithAI(content, mood, week) {
    if (!GROQ_API_KEY) {
        console.log('GROQ_API_KEY not found, using fallback analysis');
        return null;
    }

    try {
        const prompt = `Sen bir ergen psikolojisi uzmanısın. İkiz kardeşlerin bireyselleşme sürecini destekleyen bir platformda çalışıyorsun.

Aşağıdaki günlük yazısını analiz et ve JSON formatında yanıt ver:

Günlük Yazısı: "${content}"
Seçilen Duygu: ${mood}
Hafta: ${week} (1: Kimlik, 2: Sınırlar, 3: Kararlar, 4: Duygular, 5: Sosyal, 6: Entegrasyon)

JSON formatında yanıt ver (sadece JSON, başka bir şey yazma):
{
  "sentiment": "pozitif/negatif/nötr",
  "sentimentScore": 0-100 arası sayı,
  "themes": ["tema1", "tema2", "tema3"] (maksimum 5 tema: Kimlik, Sınırlar, Karar Alma, Duygusal, Sosyal, Akademik, Aile, İkizlik, Gelecek, Özgüven gibi),
  "meRatio": 0-1 arası (bireysel odak oranı, 1=tamamen bireysel),
  "summary": "2-3 cümlelik özet - yazının ana noktaları",
  "feedback": "Kullanıcıya özel, destekleyici ve içgörü sağlayan 2-3 cümle. Hafta temasına uygun olsun.",
  "insights": ["içgörü1", "içgörü2"] (2 kısa içgörü)
}`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            console.error('GROQ API Error:', response.status);
            return null;
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content;

        if (!aiResponse) return null;

        // JSON parse
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;

    } catch (error) {
        console.error('AI Analysis Error:', error.message);
        return null;
    }
}

// Fallback analiz (AI yoksa)
function fallbackAnalysis(content, mood) {
    const lowerEntry = content.toLowerCase();

    // Sentiment
    let sentimentScore = 50;
    const positiveWords = ['mutlu', 'harika', 'güzel', 'seviyorum', 'başardım', 'gurur', 'huzur', 'iyi', 'keyif', 'sevinç', 'umut', 'heyecan'];
    const negativeWords = ['üzgün', 'kötü', 'sinir', 'kızgın', 'korku', 'endişe', 'stres', 'kaygı', 'yalnız', 'bıktım', 'zor', 'mutsuz'];

    positiveWords.forEach(w => { if (lowerEntry.includes(w)) sentimentScore += 8; });
    negativeWords.forEach(w => { if (lowerEntry.includes(w)) sentimentScore -= 8; });
    sentimentScore = Math.min(100, Math.max(0, sentimentScore));

    // Me/We
    const meWords = (content.match(/\bben\b|\bbenim\b|\bkendim\b|\bkendi\b|\bbana\b|\bbeni\b/gi) || []).length;
    const weWords = (content.match(/\bbiz\b|\bbizim\b|\bikizim\b|\bkardeşim\b|\bberaber\b|\bbirlikte\b/gi) || []).length;
    const total = meWords + weWords || 1;
    const meRatio = meWords / total;

    // Themes
    const themes = [];
    if (lowerEntry.includes('okul') || lowerEntry.includes('ders') || lowerEntry.includes('sınav')) themes.push('Akademik');
    if (lowerEntry.includes('arkadaş') || lowerEntry.includes('sosyal')) themes.push('Sosyal');
    if (lowerEntry.includes('aile') || lowerEntry.includes('anne') || lowerEntry.includes('baba')) themes.push('Aile');
    if (lowerEntry.includes('ikiz') || lowerEntry.includes('kardeş')) themes.push('İkizlik');
    if (lowerEntry.includes('karar') || lowerEntry.includes('seçtim')) themes.push('Karar Alma');
    if (lowerEntry.includes('sınır') || lowerEntry.includes('hayır')) themes.push('Sınır Koyma');
    if (lowerEntry.includes('gelecek') || lowerEntry.includes('hedef')) themes.push('Gelecek');
    if (themes.length === 0) themes.push('Genel');

    return {
        sentiment: sentimentScore >= 60 ? 'pozitif' : sentimentScore <= 40 ? 'negatif' : 'nötr',
        sentimentScore,
        themes,
        meRatio,
        summary: content.substring(0, 100) + '...',
        feedback: meRatio > 0.6
            ? 'Bireysel odağın yüksek, bu bireyselleşme sürecinde olumlu bir işaret!'
            : 'Dengeli bir bakış açısı görüyorum. Yazmaya devam et.',
        insights: ['Duygularını ifade etmen önemli', 'Yazmaya devam et']
    };
}

// ANALYZE & SAVE JOURNAL ENTRY
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { content, mood, moodIcon, guidedQuestion, week } = req.body;
        const userId = req.user.id;

        if (!content || content.length < 10) {
            return res.status(400).json({ error: 'Entry too short' });
        }

        // AI Analizi
        let analysis = await analyzeWithAI(content, mood, week || 1);

        // AI başarısızsa fallback
        if (!analysis) {
            analysis = fallbackAnalysis(content, mood);
        }

        // Sentiment label
        let sentimentLabel = 'Nötr 😐';
        if (analysis.sentiment === 'pozitif' || analysis.sentimentScore >= 60) sentimentLabel = 'Pozitif 😊';
        else if (analysis.sentiment === 'negatif' || analysis.sentimentScore <= 40) sentimentLabel = 'Negatif 😔';

        // Veritabanına kaydet - ÖZETLİ
        const savedEntry = await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: JSON.stringify({
                // Orijinal içerik
                text: content,
                mood,
                moodIcon,
                guidedQuestion,
                week: week || 1,
                // AI Analiz sonuçları
                sentimentScore: analysis.sentimentScore,
                sentiment: analysis.sentiment,
                meRatio: analysis.meRatio,
                themes: analysis.themes,
                // AI Özetleri (veri yönetimi için önemli)
                summary: analysis.summary,
                feedback: analysis.feedback,
                insights: analysis.insights,
                // Metadata
                analyzedBy: GROQ_API_KEY ? 'groq-ai' : 'fallback',
                analyzedAt: new Date().toISOString()
            }),
            impact_score: analysis.sentimentScore,
            timestamp: new Date()
        });

        // XP ekle
        await User.findByIdAndUpdate(userId, { $inc: { total_points: 10 } });

        res.json({
            success: true,
            entryId: savedEntry._id,
            sentiment: sentimentLabel,
            sentimentScore: analysis.sentimentScore,
            me_ratio: analysis.meRatio,
            we_ratio: 1 - analysis.meRatio,
            themes: analysis.themes,
            summary: analysis.summary,
            feedback: analysis.feedback,
            insights: analysis.insights,
            analyzedBy: GROQ_API_KEY ? 'AI' : 'Sistem'
        });

    } catch (error) {
        console.error('Journal Analyze Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET HISTORY - Özetlerle birlikte
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
                moodLabel: parsed.mood,
                // AI özet - geçmişte hızlı görünüm için
                summary: parsed.summary || (parsed.text || '').substring(0, 100) + '...',
                preview: (parsed.text || '').substring(0, 150) + '...',
                sentiment: parsed.sentiment === 'pozitif' ? 'Pozitif' :
                    parsed.sentiment === 'negatif' ? 'Negatif' : 'Nötr',
                sentimentScore: parsed.sentimentScore || 50,
                themes: parsed.themes || [],
                insights: parsed.insights || [],
                meRatio: parsed.meRatio,
                week: parsed.week,
                analyzedBy: parsed.analyzedBy
            };
        });

        res.json({ entries });

    } catch (error) {
        console.error('Journal History Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET INSIGHTS - Haftalık AI özeti
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
        const allInsights = [];
        let totalMeRatio = 0, totalSentiment = 0;

        interactions.forEach(i => {
            let parsed = {};
            try {
                parsed = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
            } catch { parsed = {}; }

            const mood = parsed.moodIcon || '😐';
            moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
            if (parsed.themes) allThemes.push(...parsed.themes);
            if (parsed.insights) allInsights.push(...parsed.insights);
            totalMeRatio += (parsed.meRatio || 0.5);
            totalSentiment += (parsed.sentimentScore || 50);
        });

        // Top themes
        const themeCount = {};
        allThemes.forEach(t => { themeCount[t] = (themeCount[t] || 0) + 1; });
        const topThemes = Object.entries(themeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);

        const avgMeRatio = Math.round((totalMeRatio / interactions.length) * 100);
        const avgSentiment = Math.round(totalSentiment / interactions.length);

        // AI ile haftalık özet oluştur
        let weeklySummary = '';

        if (GROQ_API_KEY && interactions.length >= 3) {
            try {
                const summaries = interactions.map(i => {
                    const p = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
                    return p.summary || '';
                }).filter(s => s).join('\n');

                const promptWeekly = `Bu hafta yazılan günlük özetleri:
${summaries}

Bu haftanın:
- Ortalama duygu skoru: ${avgSentiment}/100
- Bireysel odak oranı: ${avgMeRatio}%
- Ana temalar: ${topThemes.join(', ')}

Lütfen 3-4 cümlelik destekleyici ve içgörü dolu bir haftalık özet yaz. Türkçe olsun.`;

                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: promptWeekly }],
                        temperature: 0.7,
                        max_tokens: 200
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    weeklySummary = data.choices?.[0]?.message?.content || '';
                }
            } catch (e) {
                console.error('Weekly AI Summary Error:', e.message);
            }
        }

        // Fallback summary
        if (!weeklySummary) {
            weeklySummary = avgSentiment >= 60
                ? `Bu hafta genel olarak olumlu bir ruh hali içindesin. ${avgMeRatio >= 60 ? 'Bireysel odağın yüksek, bu bireyselleşme sürecinde önemli.' : ''} Bu hafta ${interactions.length} günlük yazısı yazdın, böyle devam et!`
                : avgSentiment <= 40
                    ? `Bu hafta bazı zorluklarla karşılaşmış olabilirsin. Kendine nazik ol. ${interactions.length} günlük yazısı yazdın, duygularını ifade etmen önemli.`
                    : `Bu hafta dengeli bir dönem geçirdin. ${interactions.length} günlük yazısı yazdın. Yazmaya devam et!`;
        }

        res.json({
            totalEntries: interactions.length,
            moodDistribution,
            topThemes,
            topInsights: [...new Set(allInsights)].slice(0, 5),
            avgMeRatio,
            avgSentiment,
            summary: weeklySummary
        });

    } catch (error) {
        console.error('Journal Insights Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
