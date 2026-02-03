
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Interaction } from '@/app/lib/models/ResearchData';
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

        const { name, appearance, values, goals } = await request.json();

        await dbConnect();

        // Kullanıcıyı güncelle
        await User.findByIdAndUpdate(decoded.id, {
            character: {
                name: name || 'Kahraman',
                appearance: appearance || { emoji: '👤' },
                values: values || [],
                goals: goals || []
            },
            $inc: { total_points: 25 } // 25 XP for character creation
        });

        // Aktivite logla
        await Interaction.create({
            user_id: decoded.id,
            action_type: 'character_created',
            content: `Karakter oluşturuldu: ${name}`,
            impact_score: 25,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Character Save Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
