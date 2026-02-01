
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const userId = decoded.id;
        const body = await request.json();
        const { gameId, score, maxScore, metadata } = body;

        // Model Fix: Check if test_type supports 'GAME' enum. Let's force it if strict schema fails.
        // Assuming loose schema or 'test_type' is String.

        await Score.create({
            user_id: userId,
            test_type: 'GAME',
            scale_period: 'process', // Ongoing
            week_number: 0,
            total_score: score || 0,
            sub_dimensions: { gameId, rawScore: score, ...metadata },
            timestamp: new Date()
        });

        await Interaction.create({
            user_id: userId,
            action_type: 'game_played',
            content: `${gameId.toUpperCase()} oynandı: ${score}`,
            impact_score: score,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Game Save Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
