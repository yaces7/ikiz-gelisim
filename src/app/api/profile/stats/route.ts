
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // 1. Auth Check
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

        const userId = decoded.id; // Assuming payload has id

        // 2. Fetch Aggregated Data

        // a. Latest Independence Score
        const latestScore = await Score.findOne({ user_id: userId, test_type: 'BSO' })
            .sort({ timestamp: -1 });

        const independenceScore = latestScore ? latestScore.total_score : 50; // Default start mid-point or 0

        // b. Completed Tests Count
        const completedTests = await Score.countDocuments({ user_id: userId });

        // c. Completed Scenarios (Interactions type 'simulation')
        const completedScenarios = await Interaction.countDocuments({ user_id: userId, action_type: 'simulation' });

        // d. Last Activity
        const lastInteraction = await Interaction.findOne({ user_id: userId }).sort({ timestamp: -1 });
        const lastActivityDate = lastInteraction ? new Date(lastInteraction.timestamp) : null;

        // e. Streak Calculation (Simplified: Count distinct days in last 7 days)
        // For real app, use aggregation pipeline
        const streak = lastActivityDate ? 1 : 0; // Placeholder logic for now

        // f. Chart Data (Last 6 Scores)
        const recentScores = await Score.find({ user_id: userId, test_type: 'BSO' })
            .sort({ timestamp: 1 })
            .limit(6);

        const chartData = recentScores.map(s => ({
            date: new Date(s.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            score: s.total_score
        }));

        return NextResponse.json({
            stats: {
                independenceScore,
                completedTests,
                completedScenarios,
                weeklyStreak: streak,
                lastActivity: lastActivityDate
                    ? lastActivityDate.toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                    : 'Henüz aktivite yok',
            },
            chartData
        });

    } catch (error) {
        console.error('Profile Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
