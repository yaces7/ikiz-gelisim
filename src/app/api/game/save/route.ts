
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { gameId, score, maxScore, metadata } = await request.json();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const userId = decoded.id;

        // 1. Save Score
        const savedScore = await Score.create({
            user_id: userId,
            test_type: 'GAME',
            scale_period: 'process',
            total_score: score || 0,
            sub_dimensions: { gameId, rawScore: score, ...metadata },
            timestamp: new Date()
        });

        // 2. Save Interaction Log
        await Interaction.create({
            user_id: userId,
            action_type: 'game_played',
            content: `${gameId.toUpperCase()} oynandı: ${score}`,
            impact_score: score,
            timestamp: new Date()
        });

        // 3. Update User XP
        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: score || 0 }
        });

        return NextResponse.json({ success: true, score: savedScore });

    } catch (error) {
        console.error("Game Save Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
