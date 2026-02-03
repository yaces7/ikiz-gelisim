
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        // Son 30 günlük yazıyı getir
        const interactions = await Interaction.find({
            user_id: decoded.id,
            action_type: 'journal_entry'
        })
            .sort({ timestamp: -1 })
            .limit(30);

        const entries = interactions.map(i => {
            let parsed: any = {};
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
                sentiment: parsed.sentimentScore >= 60 ? 'Pozitif 😊' : parsed.sentimentScore <= 40 ? 'Negatif 😔' : 'Nötr 😐',
                themes: parsed.themes || []
            };
        });

        return NextResponse.json({ entries });

    } catch (error) {
        console.error("Journal History Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
