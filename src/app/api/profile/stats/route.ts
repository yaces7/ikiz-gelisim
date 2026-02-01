
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // --- 1. Authenticaton Check ---
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Token Expired/Invalid' }, { status: 401 });
        }

        const userId = decoded.id;

        // --- 2. Data Aggregation (REAL DATA) ---
        const user = await User.findById(userId);
        const scores = await Score.find({ user_id: userId });
        const interactions = await Interaction.find({ user_id: userId }).sort({ timestamp: -1 }).limit(10);

        // --- 3. Stats Logic ---
        const radarStats: Record<string, number> = {
            'Özerklik': 50,
            'Sınırlar': 50,
            'İletişim': 50,
            'Özgüven': 50,
            'Farkındalık': 50
        };

        scores.forEach((s: any) => {
            if (s.test_type === 'GAME') {
                const raw = s.sub_dimensions?.rawScore || 10;
                const gid = s.sub_dimensions?.gameId;
                if (gid === 'boundary') radarStats['Sınırlar'] += (raw / 5);
                if (gid === 'diplomacy') radarStats['İletişim'] += (raw / 5);
                if (gid === 'mirror') radarStats['Farkındalık'] += (raw / 5);
                if (gid === 'social') radarStats['Özerklik'] += (raw / 10);
            }
            else if (s.test_type === 'BSO') {
                radarStats['Özerklik'] = (radarStats['Özerklik'] + s.total_score) / 2;
            }
        });

        // Normalize
        Object.keys(radarStats).forEach(k => radarStats[k] = Math.min(100, Math.max(0, radarStats[k])));

        // --- 4. Twin Data (If Linked) ---
        let twinName = null;
        if (user && user.twin_id) {
            const twin = await User.findById(user.twin_id);
            if (twin) twinName = twin.username;
        }

        return NextResponse.json({
            user: {
                username: user?.username || 'Kullanıcı',
                level: user?.level || 1,
                title: (user?.level || 1) > 5 ? 'Uzman' : 'Kâşif',
                nextLevelProgress: ((user?.total_points || 0) % 500) / 5,
                twinName
            },
            stats: {
                totalPoints: user?.total_points || 0,
                gamesPlayed: scores.filter((s: any) => s.test_type === 'GAME').length,
                testsCompleted: scores.filter((s: any) => s.test_type === 'BSO').length,
                radarData: Object.values(radarStats),
                radarLabels: Object.keys(radarStats)
            },
            recentActivities: interactions.map((i: any) => ({
                action: i.content || 'Aktivite',
                timestamp: i.timestamp
            }))
        });

    } catch (error: any) {
        console.error('Profile Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
