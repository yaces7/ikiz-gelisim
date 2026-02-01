
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

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

        // Fetch User Scores
        const scores = await Score.find({ user_id: userId });

        // Calculate Totals / Radar Stats
        // Default Stats
        const radarStats = {
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
            // Aggregate Points
            totalPoints += s.total_score || 0;

            if (s.test_type === 'GAME') {
                gamesPlayed++;
                // Map Games to Radar Dimensions
                const gameId = s.sub_dimensions?.gameId;
                const scoreVal = s.total_score || 50;

                if (gameId === 'boundary') radarStats['Sınırlar'] = (radarStats['Sınırlar'] + scoreVal) / 2;
                if (gameId === 'mirror') radarStats['Farkındalık'] = (radarStats['Farkındalık'] + scoreVal) / 2;
                if (gameId === 'diplomacy') radarStats['İletişim'] = (radarStats['İletişim'] + scoreVal) / 2;
                if (gameId === 'social') radarStats['Özerklik'] = (radarStats['Özerklik'] + scoreVal) / 2;
                if (gameId === 'future') radarStats['Özgüven'] = (radarStats['Özgüven'] + scoreVal) / 2;
            }
            else if (s.test_type === 'BSO') {
                testsCompleted++;
                // BSO General Impact
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
                radarStats['Farkındalık'] = (radarStats['Farkındalık'] + (s.total_score || 50)) / 2;
            }
        });

        // Fetch Recent Activity
        const interactions = await Interaction.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(5);

        const recentActivities = interactions.map(i => ({
            action: i.content || 'Aktivite',
            timestamp: i.timestamp
        }));

        // Determine Level based on points
        const level = Math.floor(totalPoints / 500) + 1;
        const nextLevelProgress = (totalPoints % 500) / 5; // Percentage

        return NextResponse.json({
            user: {
                level,
                title: level > 5 ? 'Bireyselleşme Uzmanı' : (level > 2 ? 'Kâşif İkiz' : 'Çaylak'),
                nextLevelProgress
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
