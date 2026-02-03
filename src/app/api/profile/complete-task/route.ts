
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { taskIndex } = await request.json();

        await dbConnect();

        const user = await User.findById(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.wheelTasks && user.wheelTasks[taskIndex]) {
            user.wheelTasks[taskIndex].completed = true;
            user.wheelTasks[taskIndex].completedAt = new Date();
            user.total_points = (user.total_points || 0) + 15; // 15 XP for task completion
            await user.save();
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Complete Task Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
