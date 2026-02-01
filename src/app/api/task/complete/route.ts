
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { task, score } = await request.json();

        // Auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        const userId = decoded.id;

        // 1. Save Interaction
        await Interaction.create({
            user_id: userId,
            action_type: 'task_complete',
            content: `Görev: ${task}`,
            impact_score: score || 0,
            timestamp: new Date()
        });

        // 2. Update User XP
        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: score || 0 }
        });

        return NextResponse.json({ success: true, points: score });

    } catch (error) {
        console.error("Task Complete Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
