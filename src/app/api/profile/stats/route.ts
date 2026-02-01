
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

// Ensure dynamic rendering to access headers/DB correctly
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        // 1. Connect DB (Must succeed for real data)
        await dbConnect();

        // 2. Auth Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error("Token Error:", err);
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const userId = decoded.id;

        // 3. REAL Data Fetching
        // --- Scores ---
        const scores = await Score.find({ user_id: userId });

        // --- Interactions (Activity) ---
        const interactions = await Interaction.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(10); // Increased limit as requested for "detailed" feed

        // Process Data
        const radarStats: Record<string, number> = {
            'Özerklik': 50, // Base stats
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
                // Dynamic adjustments based on game performance
                // Assuming rawScore is saved in metadata
                const raw = s.sub_dimensions?.rawScore || 10;
                const gid = s.sub_dimensions?.gameId;

                // Impact Logic
                if (gid === 'boundary') radarStats['Sınırlar'] += (raw / 5);
                if (gid === 'diplomacy') radarStats['İletişim'] += (raw / 5);
                if (gid === 'mirror') radarStats['Farkındalık'] += (raw / 5);
                if (gid === 'social') radarStats['Özerklik'] += (raw / 10);
            }
            else if (s.test_type === 'BSO') {
                testsCompleted++;
                // BSO Directly maps to Autonomy
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (s.total_score || 50)) / 2;
            }
        });

        // Normalize Stats (0-100)
        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, radarStats[k]));
        });

        const recentActivities = interactions.map(i => ({
            action: i.content || 'Bilinmeyen Aktivite',
            timestamp: i.timestamp
        }));

        // Level Calc
        const level = Math.floor(totalPoints / 500) + 1;
        const nextLevelProgress = (totalPoints % 500) / 5; // Percentage (500 pts = 100%)

        return NextResponse.json({
            user: {
                level,
                title: level > 5 ? 'Uzman' : 'Kâşif',
                nextLevelProgress,
                twinName: 'İkizim (Bağlanmadı)' // Need schema update for real twin name
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

    } catch (error: any) {
        console.error('Profile Stats Error:', error);
        // Return actual error to help debugging connection issues
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
