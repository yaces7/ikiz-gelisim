
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
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

        // Fetch completed weeks
        const scores = await Score.find({ user_id: userId, test_type: 'BSO' }).select('week_number total_score');

        // Map to simpler format
        const history = scores.map(s => ({
            weekId: s.week_number || (s.scale_period === 'pre' ? 1 : (s.scale_period === 'post' ? 6 : null)),
            score: s.total_score
        })).filter(h => h.weekId != null);

        // Deduplicate chunks if multiple attempts, keep latest or highest? Let's keep distinct weeks.
        const completedWeeks = Array.from(new Set(history.map(h => h.weekId)));

        return NextResponse.json({ completedWeeks, history });

    } catch (error) {
        console.error('Test History Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
