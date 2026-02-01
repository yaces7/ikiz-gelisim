
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic'; // CRITICAL FIX for 404s

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

        const userId = decoded.id;

        // Fetch Data
        const scores = await Score.find({ user_id: userId });

        // Calculate Totals / Radar Stats
        const radarStats: Record<string, number> = {
            'Özerklik': 50,
            'Sınırlar': 50,
            'İletişim': 50,
            'Özgüven': 50,
            'Farkındalık': 50
        };

        let totalPoints = 0;
        let gamesPlayed = 0;
        let testsCompleted = 0;

        scores.forEach(s => {
            totalPoints += s.total_score || 0;

            if (s.test_type === 'GAME') {
                gamesPlayed++;
                // Add simple logic to boost stats based on game type
                const gid = s.sub_dimensions?.gameId;
                if (gid === 'boundary') radarStats['Sınırlar'] += 5;
                if (gid === 'diplomacy') radarStats['İletişim'] += 5;
                if (gid === 'mirror') radarStats['Farkındalık'] += 5;
                if (gid === 'social') radarStats['Özerklik'] += 5;
            }
            else if (s.test_type === 'BSO') {
                testsCompleted++;
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
            }
        });

        // Normalize Stats to 100
        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, radarStats[k]));
        });

        // Fetch Recent Activity
        const interactions = await Interaction.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(5);

        const recentActivities = interactions.map(i => ({
            action: i.content || 'Aktivite',
            timestamp: i.timestamp
        }));

        // Level Calculation
        const level = Math.floor(totalPoints / 500) + 1;
        const nextLevelProgress = (totalPoints % 500) / 5;

        return NextResponse.json({
            user: {
                level,
                title: level > 5 ? 'Uzman' : 'Kâşif',
                nextLevelProgress,
                twinName: 'İkizim (Bağlanmadı)' // Placeholder for now
            },
            stats: {
                totalPoints,
                gamesPlayed,
                testsCompleted,
                radarData: Object.values(radarStats),
                radarLabels: Object.keys(radarStats)
            },
            recentActivities
        });

    } catch (error) {
        console.error('Profile Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
