
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// app/api/profile/stats/route.ts
export async function GET(request: Request) {
    return NextResponse.json({ message: "Rota çalışıyor!" }); // Bunu ekleyip tarayıcıdan /api/profile/stats adresine git.
export async function GET(request: Request) {
    try {
        // --- 1. Auth Check ---
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Token Invalid' }, { status: 401 });
        }

        const userId = decoded.id;

        // --- 2. Database Connection ---
        await dbConnect();

        // Fetch user data
        let userData = {
            username: decoded.username || 'Kullanıcı',
            level: 1,
            total_points: 0
        };

        try {
            const user = await User.findById(userId);
            if (user) {
                userData = {
                    username: user.username || decoded.username,
                    level: user.level || 1,
                    total_points: user.total_points || 0
                };
            }
        } catch (e) {
            console.error('User fetch error:', e);
        }

        // Fetch scores
        let scores: any[] = [];
        try {
            scores = await Score.find({ user_id: userId }) || [];
        } catch (e) {
            console.error('Scores fetch error:', e);
        }

        // Fetch interactions
        let interactions: any[] = [];
        try {
            interactions = await Interaction.find({ user_id: userId }).sort({ timestamp: -1 }).limit(10) || [];
        } catch (e) {
            console.error('Interactions fetch error:', e);
        }

        // --- 3. Calculate Stats ---
        const radarStats: Record<string, number> = {
            'Özerklik': 50,
            'Sınırlar': 50,
            'İletişim': 50,
            'Özgüven': 50,
            'Farkındalık': 50
        };

        let gamesPlayed = 0;
        let testsCompleted = 0;

        scores.forEach((s: any) => {
            if (s.test_type === 'GAME') {
                gamesPlayed++;
                const raw = s.sub_dimensions?.rawScore || 10;
                const gid = s.sub_dimensions?.gameId;
                if (gid === 'boundary') radarStats['Sınırlar'] += (raw / 5);
                if (gid === 'diplomacy') radarStats['İletişim'] += (raw / 5);
                if (gid === 'mirror') radarStats['Farkındalık'] += (raw / 5);
                if (gid === 'social') radarStats['Özerklik'] += (raw / 10);
            } else if (s.test_type === 'BSO') {
                testsCompleted++;
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
            }
        });

        // Normalize 0-100
        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, radarStats[k]));
        });

        // --- 4. Build Response ---
        const level = Math.floor((userData.total_points || 0) / 500) + 1;

        return NextResponse.json({
            user: {
                username: userData.username,
                level,
                title: level > 5 ? 'Uzman' : 'Kâşif',
                nextLevelProgress: ((userData.total_points || 0) % 500) / 5,
                twinName: null
            },
            stats: {
                totalPoints: userData.total_points || 0,
                gamesPlayed,
                testsCompleted,
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
        return NextResponse.json({ error: 'Server Error', message: error.message }, { status: 500 });
    }
}
