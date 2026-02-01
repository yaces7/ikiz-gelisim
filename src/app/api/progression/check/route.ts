
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');

        // Allow unauthenticated access with default values
        if (!authHeader) {
            return NextResponse.json({ level: 1, xp: 0, nextLevel: 500, streak: 0 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ level: 1, xp: 0, nextLevel: 500, streak: 0 });
        }

        await dbConnect();

        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json({ level: 1, xp: 0, nextLevel: 500, streak: 0 });
        }

        const level = Math.floor((user.total_points || 0) / 500) + 1;
        const xp = user.total_points || 0;
        const nextLevel = level * 500;

        return NextResponse.json({ level, xp, nextLevel, streak: 0 });

    } catch (error) {
        console.error("Progression Check Error", error);
        return NextResponse.json({ level: 1, xp: 0, nextLevel: 500, streak: 0 });
    }
}
