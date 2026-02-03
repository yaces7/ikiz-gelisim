
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        // Auth Check
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

        await dbConnect();

        // Fetch user data
        let userData = {
            username: decoded.username || 'Kullanıcı',
            level: 1,
            total_points: 0,
            current_week: 1,
            completed_weeks: [],
            character: null,
            wheelTasks: []
        };

        try {
            const user = await User.findById(userId);
            if (user) {
                userData = {
                    username: user.username || decoded.username,
                    level: user.level || 1,
                    total_points: user.total_points || 0,
                    current_week: user.current_week || 1,
                    completed_weeks: user.completed_weeks || [],
                    character: user.character || null,
                    wheelTasks: user.wheelTasks || []
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

        // Calculate Stats
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
                if (gid === 'boundary') radarStats['Sınırlar'] = Math.min(100, radarStats['Sınırlar'] + (raw / 5));
                if (gid === 'diplomacy') radarStats['İletişim'] = Math.min(100, radarStats['İletişim'] + (raw / 5));
                if (gid === 'mirror') radarStats['Farkındalık'] = Math.min(100, radarStats['Farkındalık'] + (raw / 5));
                if (gid === 'social') radarStats['Özerklik'] = Math.min(100, radarStats['Özerklik'] + (raw / 10));
            } else if (s.test_type === 'BSO') {
                testsCompleted++;
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
            }
        });

        // Normalize 0-100
        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, Math.round(radarStats[k])));
        });

        // Calculate level
        const level = Math.floor((userData.total_points || 0) / 500) + 1;
        const TITLES = ['Yeni Başlayan', 'Kâşif', 'Yolcu', 'Gezgin', 'Usta', 'Uzman', 'Bilge'];
        const title = TITLES[Math.min(level - 1, TITLES.length - 1)];

        return NextResponse.json({
            user: {
                username: userData.username,
                level,
                title,
                nextLevelProgress: ((userData.total_points || 0) % 500) / 5,
                twinName: null,
                current_week: userData.current_week,
                completed_weeks: userData.completed_weeks
            },
            stats: {
                totalPoints: userData.total_points || 0,
                gamesPlayed,
                testsCompleted,
                radarData: Object.values(radarStats),
                radarLabels: Object.keys(radarStats)
            },
            character: userData.character,
            wheelTasks: userData.wheelTasks,
            recentActivities: interactions.map((i: any) => ({
                action: i.content?.substring(0, 50) || i.action_type || 'Aktivite',
                timestamp: i.timestamp
            }))
        });

    } catch (error: any) {
        console.error('Profile Stats Error:', error);
        return NextResponse.json({ error: 'Server Error', message: error.message }, { status: 500 });
    }
}
