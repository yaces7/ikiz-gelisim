
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

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

        // Parent Dashboard Logic: Fetch child's activity
        // For demo: Fetch own user's interactions (assuming they are child)

        const interactions = await Interaction.find({ user_id: decoded.id })
            .sort({ timestamp: -1 })
            .limit(10);

        return NextResponse.json({ interactions });

    } catch (error) {
        console.error('Parent Dashboard Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
