
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score } from '@/app/lib/models/ResearchData';
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

        const { testType, answers } = await request.json();
        const userId = decoded.id;

        // Calculate score
        let totalScore = 0;
        Object.values(answers).forEach((val: any) => totalScore += Number(val));

        // Save Score
        const score = await Score.create({
            user_id: userId,
            test_type: testType,
            scale_period: 'process', // Or 'pre', 'post' based on logic
            week_number: 0,
            total_score: totalScore,
            sub_dimensions: answers,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, score: score });

    } catch (error) {
        console.error('Test Save API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
