
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
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // For demo: Parent sees their own activity (expand later for child linking)
        const interactions = await Interaction.find({ user_id: decoded.id })
            .sort({ timestamp: -1 })
            .limit(20);

        return NextResponse.json({ interactions });

    } catch (error) {
        console.error("Parent Dashboard Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
