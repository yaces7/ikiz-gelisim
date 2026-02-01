
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { entry, mood } = await request.json();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const userId = decoded.id;

        // Simple sentiment analysis (AI integration can be added later)
        let sentiment = 50;
        if (mood === 'happy') sentiment = 80;
        if (mood === 'sad') sentiment = 30;
        if (mood === 'angry') sentiment = 20;
        if (mood === 'calm') sentiment = 70;

        // Save Interaction
        await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: `Günlük: ${entry.substring(0, 50)}...`,
            impact_score: sentiment,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            analysis: {
                sentiment,
                me_ratio: 0.6,
                we_ratio: 0.4,
                analysis_note: "Yazınız kaydedildi."
            }
        });

    } catch (error) {
        console.error("Journal Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
