
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // Check if user is researcher/admin
        const user = await User.findById(decoded.id);
        if (!user || (user.role !== 'researcher' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Aggregate Stats
        const totalUsers = await User.countDocuments();
        const totalScores = await Score.countDocuments();
        const totalInteractions = await Interaction.countDocuments();

        // Recent Activity
        const recentInteractions = await Interaction.find()
            .sort({ timestamp: -1 })
            .limit(10);

        // Average Score
        const avgScore = await Score.aggregate([
            { $group: { _id: null, avg: { $avg: "$total_score" } } }
        ]);

        return NextResponse.json({
            totalUsers,
            totalScores,
            totalInteractions,
            averageScore: avgScore[0]?.avg || 0,
            recentActivity: recentInteractions
        });

    } catch (error) {
        console.error("Admin Dashboard Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
