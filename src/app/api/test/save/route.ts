
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { testType, answers } = await request.json();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const userId = decoded.id;

        // Calculate score
        let totalScore = 0;
        Object.values(answers).forEach((val: any) => totalScore += Number(val));

        // Save Score
        const score = await Score.create({
            user_id: userId,
            test_type: testType || 'BSO',
            scale_period: 'process',
            total_score: totalScore,
            sub_dimensions: answers,
            timestamp: new Date()
        });

        // Log Interaction
        await Interaction.create({
            user_id: userId,
            action_type: 'test_completed',
            content: `${testType || 'Test'} tamamlandı: ${totalScore}`,
            impact_score: totalScore,
            timestamp: new Date()
        });

        // Update User XP
        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: Math.round(totalScore / 2) }
        });

        return NextResponse.json({ success: true, score });

    } catch (error) {
        console.error("Test Save Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
