
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
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

        const { task, score } = await request.json();

        await Interaction.create({
            user_id: decoded.id,
            action_type: 'task_complete',
            content: `Görev Tamamlandı: ${task}`,
            impact_score: score || 0,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, message: `Completed ${task}` });

    } catch (error) {
        console.error('Task Complete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
