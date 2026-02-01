
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        // Support both 'content' and 'entry' field names for flexibility
        const entryText = body.content || body.entry || '';
        const mood = body.mood || 'neutral';

        if (!entryText || entryText.length < 10) {
            return NextResponse.json({ error: 'Entry too short' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.id;

        // Simple sentiment analysis based on keywords
        const lowerEntry = entryText.toLowerCase();
        let sentimentScore = 50;
        let sentimentLabel = 'Nötr';

        // Positive words
        if (lowerEntry.includes('mutlu') || lowerEntry.includes('harika') || lowerEntry.includes('güzel') || lowerEntry.includes('seviyorum')) {
            sentimentScore = 80;
            sentimentLabel = 'Pozitif 😊';
        }
        // Negative words
        if (lowerEntry.includes('üzgün') || lowerEntry.includes('kötü') || lowerEntry.includes('sinir') || lowerEntry.includes('kızgın')) {
            sentimentScore = 30;
            sentimentLabel = 'Negatif 😔';
        }
        // Self vs Twin analysis
        const meWords = (entryText.match(/\bben\b|\bbenim\b|\bkendim\b/gi) || []).length;
        const weWords = (entryText.match(/\bbiz\b|\bbizim\b|\bikizim\b|\nkardeşim\b/gi) || []).length;
        const total = meWords + weWords || 1;

        // Themes detection
        const themes: string[] = [];
        if (lowerEntry.includes('okul') || lowerEntry.includes('ders')) themes.push('Akademik');
        if (lowerEntry.includes('arkadaş') || lowerEntry.includes('sosyal')) themes.push('Sosyal');
        if (lowerEntry.includes('aile') || lowerEntry.includes('anne') || lowerEntry.includes('baba')) themes.push('Aile');
        if (lowerEntry.includes('ikiz') || lowerEntry.includes('kardeş')) themes.push('İkizlik');
        if (themes.length === 0) themes.push('Genel');

        // Save Interaction
        await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: `Günlük: ${entryText.substring(0, 100)}...`,
            impact_score: sentimentScore,
            timestamp: new Date()
        });

        // Update User XP
        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: 10 } // 10 XP for journal entry
        });

        return NextResponse.json({
            success: true,
            sentiment: sentimentLabel,
            sentimentScore,
            me_ratio: meWords / total,
            we_ratio: weWords / total,
            themes,
            feedback: sentimentScore > 60
                ? "Bugün pozitif bir gün geçirmişsin gibi görünüyor. Bu enerjiyi korumaya devam et!"
                : sentimentScore < 40
                    ? "Zor bir gün geçirmiş olabilirsin. Kendine nazik olmayı unutma."
                    : "Dengeli bir gün. Her duygu geçerlidir, yazmaya devam et."
        });

    } catch (error) {
        console.error("Journal Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
