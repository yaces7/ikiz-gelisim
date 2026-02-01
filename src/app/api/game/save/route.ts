
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

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

        // 1. Save Game Score to Dashboard (Score Model)
        // We use 'BSO' type or a new 'GAME' type. Let's stick to BSO for radar integration if simplified,
        // but cleaner to have test_type: 'GAME'.
        // For compatibility with Profile Radar (which might filter BSO), let's save as 'GAME' and update profile to read it.

        await Score.create({
            user_id: userId,
            test_type: 'GAME',
            scale_period: 'process', // Ongoing process
            week_number: 0, // 0 for games
            total_score: Math.round((score / maxScore) * 100), // Normalize to 0-100
            sub_dimensions: { gameId, rawScore: score, ...metadata }, // Store specific game data
            timestamp: new Date()
        });

        // 2. Log Interaction for Activity Feed
        await Interaction.create({
            user_id: userId,
            action_type: 'simulation',
            content: `${gameId} oyunu tamamlandı. Skor: ${score}`,
            impact_score: Math.round((score / maxScore) * 100),
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Game Save Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
