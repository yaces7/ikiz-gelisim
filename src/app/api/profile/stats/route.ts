
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

// CRITICAL: Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
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
        const db = await dbConnect();

        // Default values (will be used if DB fails or no data)
        let userData = {
            username: decoded.username || 'Kullanıcı',
            level: 1,
            total_points: 0,
            twin_id: null
        };
        let scores: any[] = [];
        let interactions: any[] = [];

        // Try to fetch from DB if connected
        if (db) {
            try {
                const user = await User.findById(userId).lean();
                if (user) {
                    userData = {
                        username: user.username || decoded.username,
                        level: user.level || 1,
                        total_points: user.total_points || 0,
                        twin_id: user.twin_id || null
                    };
                }
                scores = await Score.find({ user_id: userId }).lean() || [];
                interactions = await Interaction.find({ user_id: userId }).sort({ timestamp: -1 }).limit(10).lean() || [];
            } catch (dbErr) {
                console.error('DB Query Error:', dbErr);
            }
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
        return NextResponse.json({
            error: 'Server Error',
            message: error.message
        }, { status: 500 });
    }
}
