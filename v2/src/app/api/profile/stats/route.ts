
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, TestResult, SimulationResult, JournalEntry, ActivityLog } from '@/app/lib/models';
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
        } catch {
            return NextResponse.json({ error: 'Token Invalid' }, { status: 401 });
        }

        const userId = decoded.id;

        await dbConnect();

        // Fetch user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch test results
        const testResults = await TestResult.find({ user_id: userId });

        // Fetch simulation results
        const simResults = await SimulationResult.find({ user_id: userId });

        // Fetch recent activities
        const activities = await ActivityLog.find({ user_id: userId })
            .sort({ timestamp: -1 })
            .limit(10);

        // Calculate radar stats based on test results
        const radarStats: Record<string, number> = {
            'Özerklik': 50,
            'Sınırlar': 50,
            'İletişim': 50,
            'Özgüven': 50,
            'Farkındalık': 50
        };

        // Process test results
        testResults.forEach((test: any) => {
            if (test.test_type === 'BSO' && test.sub_dimensions) {
                radarStats['Özerklik'] = (radarStats['Özerklik'] + (test.sub_dimensions.autonomy || 50)) / 2;
                radarStats['Sınırlar'] = (radarStats['Sınırlar'] + (test.sub_dimensions.attachment || 50)) / 2;
            }
        });

        // Process simulation results
        simResults.forEach((sim: any) => {
            const impact = sim.overall_independence_score / 10;
            if (sim.simulation_type === 'boundary') radarStats['Sınırlar'] += impact;
            if (sim.simulation_type === 'diplomacy') radarStats['İletişim'] += impact;
            if (sim.simulation_type === 'mirror') radarStats['Farkındalık'] += impact;
            if (sim.simulation_type === 'social') radarStats['Özgüven'] += impact;
        });

        // Normalize
        Object.keys(radarStats).forEach(k => {
            radarStats[k] = Math.min(100, Math.max(0, radarStats[k]));
        });

        return NextResponse.json({
            user: {
                username: user.username,
                level: user.level || 1,
                title: (user.level || 1) > 5 ? 'Uzman' : 'Kâşif',
                nextLevelProgress: ((user.total_xp || 0) % 500) / 5,
                twinName: null
            },
            stats: {
                totalPoints: user.total_xp || 0,
                gamesPlayed: simResults.length,
                testsCompleted: testResults.length,
                radarData: Object.values(radarStats),
                radarLabels: Object.keys(radarStats)
            },
            recentActivities: activities.map((a: any) => ({
                action: a.action,
                timestamp: a.timestamp
            }))
        });

    } catch (error: any) {
        console.error('Profile Stats Error:', error);
        return NextResponse.json({ error: 'Server Error', message: error.message }, { status: 500 });
    }
}
