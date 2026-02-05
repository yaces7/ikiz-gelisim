const express = require('express');
const { User, Interaction } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// AI Character Discovery Engine
async function discoverCharacter(answers) {
    if (!GROQ_API_KEY) return null;

    try {
        const prompt = `Sen İkiz Gelişim Platformu'nun bilge karakter rehberisin. Bir çocuk sana bazı soruları yanıtladı. Bu yanıtlara dayanarak ona özgün bir karakter profili oluştur.
        
        YANITLAR:
        ${JSON.stringify(answers, null, 2)}
        
        Senden beklentim, bu yanıtlara en uygun 3 kişilik özelliği, 3 güçlü yön ve bu çocuğun ikizinden ayrışmasını sağlayacak özgün bir hobi/ideal belirlemen.
        
        Yanıtını TÜRKÇE ve JSON formatında ver (SADECE JSON):
        {
          "personality": ["özellik1", "özellik2", "özellik3"],
          "strengths": ["güçlüYön1", "güçlüYön2", "güçlüYön3"],
          "avatarSuggested": "emoji (örn: 🧑‍🚀, 🧑‍🎨, 🧑‍🔬)",
          "discoveryMessage": "Çocuğun karakterini nasıl keşfettiğine dair 2 cümlelik bilgece bir mesaj."
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

        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content;
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }
    } catch (e) {
        console.error("AI Discovery Error:", e);
    }
    return null;
}

// ANALYZE ANSWERS
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { answers } = req.body;
        const result = await discoverCharacter(answers);

        if (!result) {
            return res.status(500).json({ error: 'AI Analysis failed' });
        }

        res.json({ success: true, analysis: result });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

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
            $inc: { total_points: 50 }
        });

        await Interaction.create({
            user_id: userId,
            action_type: 'character_created',
            content: `Karakter oluşturuldu: ${name}`,
            impact_score: 50,
            timestamp: new Date()
        });

        res.json({ success: true, points: 50 });

    } catch (error) {
        console.error('Character Save Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
