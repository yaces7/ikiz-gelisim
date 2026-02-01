
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Support both GET and POST for flexibility
export async function GET(request: Request) {
    return handleDashboard(request);
}

export async function POST(request: Request) {
    return handleDashboard(request);
}

async function handleDashboard(request: Request) {
    try {
        await dbConnect();

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Get all interactions (child's activities)
        const interactions = await Interaction.find({ user_id: decoded.id })
            .sort({ timestamp: -1 })
            .limit(20);

        // Get all scores
        const scores = await Score.find({ user_id: decoded.id })
            .sort({ timestamp: -1 });

        // Calculate stats
        const totalActivities = interactions.length;
        const averageProgress = scores.length > 0
            ? Math.round(scores.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0) / scores.length)
            : 0;

        // Weekly data for chart
        const weeklyData: Record<string, number> = {};
        scores.forEach((s: any) => {
            const week = `Hafta ${Math.ceil((new Date().getTime() - new Date(s.timestamp).getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1}`;
            weeklyData[week] = (weeklyData[week] || 0) + (s.total_score || 0);
        });

        const chartLabels = Object.keys(weeklyData).reverse().slice(0, 4);
        const chartData = chartLabels.map(l => weeklyData[l] || 0);

        // Recent activities formatted
        const recentActivities = interactions.slice(0, 5).map((i: any) => ({
            type: i.action_type === 'journal_entry' ? 'journal' : 'activity',
            description: i.content || 'Aktivite',
            timestamp: i.timestamp
        }));

        // AI Insight based on data
        let aiInsight = "Çocuklarınızın aktiviteleri tamamlandıkça burada size özel yapay zeka önerileri belirecektir.";
        if (totalActivities > 10) {
            aiInsight = "Harika bir ilerleme! Çocuğunuz düzenli olarak katılım gösteriyor. Bireyselleşme sürecinde destekleyici olmaya devam edin.";
        } else if (totalActivities > 5) {
            aiInsight = "İyi gidiyorsunuz. Çocuğunuzu daha fazla aktiviteye teşvik edebilirsiniz.";
        }

        return NextResponse.json({
            success: true,
            data: {
                averageProgress: Math.min(100, averageProgress),
                totalActivities,
                guidanceMode: totalActivities > 5 ? "Aktif Rehberlik" : "Başlangıç Modu",
                chartLabels: chartLabels.length > 0 ? chartLabels : ['1. Hafta', '2. Hafta', '3. Hafta'],
                datasets: [{
                    label: 'Haftalık Puan',
                    data: chartData.length > 0 ? chartData : [0, 0, 0],
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                }],
                aiInsight,
                recentActivities
            }
        });

    } catch (error: any) {
        console.error("Parent Dashboard Error", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
