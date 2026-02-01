
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Score, Interaction } from '@/app/lib/models/ResearchData';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { userId } = await request.json();

        const parentUser = await User.findById(userId);
        if (!parentUser || parentUser.role !== 'parent') {
            return NextResponse.json({ success: false, message: "Not a parent" });
        }

        // 1. Find Children
        // In real scenario, family_code links them.
        const children = await User.find({ family_code: parentUser.family_code, role: 'twin' });

        if (!children || children.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    averageProgress: 0,
                    totalActivities: 0,
                    guidanceMode: 'Veri Bekleniyor',
                    chartLabels: [],
                    datasets: [],
                    recentActivities: [],
                    aiInsight: "Henüz sisteme kayıtlı çocuğunuz bulunmamaktadır veya aile kodunuz eşleşmedi."
                }
            });
        }

        const childIds = children.map(c => c._id);

        // 2. Aggregate Data
        const scores = await Score.find({ user_id: { $in: childIds } }).sort({ timestamp: 1 });
        const activities = await Interaction.find({ user_id: { $in: childIds } }).sort({ timestamp: -1 }).limit(5);

        // 3. Process Chart Data
        // Group scores by week/timestamp roughly
        const chartLabels = scores.map(s => new Date(s.timestamp).toLocaleDateString('tr-TR'));
        const chartScoreData = scores.map(s => s.total_score);

        // 4. Calculate Average Progress
        const totalScore = chartScoreData.reduce((a, b) => a + b, 0);
        const averageProgress = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

        // 5. Generate Insight
        let aiInsight = "Çocuklarınızın gelişimi takip ediliyor.";
        if (averageProgress < 50) {
            aiInsight = "Çocuklarınızın bireyselleşme skorları başlangıç seviyesinde. Onlara daha fazla sorumluluk vererek özgüvenlerini destekleyebilirsiniz.";
        } else if (averageProgress > 80) {
            aiInsight = "Harika! Çocuklarınız yüksek bir özerklik seviyesi sergiliyor. Bu süreci pekiştirmek için onları sosyal aktivitelerde liderlik etmeye teşvik edin.";
        } else {
            aiInsight = "Gelişim devam diyor. 'Sınırlar' konusunda biraz daha net kurallar koymak, gelişim eğrisini yukarı taşıyabilir.";
        }

        const responseData = {
            averageProgress,
            totalActivities: scores.length + activities.length,
            guidanceMode: averageProgress > 60 ? 'Destekleyici Gözlemci' : 'Aktif Rehber',
            chartLabels,
            datasets: [{
                label: 'Çocukların Gelişim Skoru',
                data: chartScoreData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            }],
            recentActivities: activities.map(a => ({
                type: a.action_type,
                description: a.action_type === 'journal' ? 'Günlük girişi yapıldı' : 'Simülasyon tamamlandı',
                timestamp: a.timestamp
            })),
            aiInsight
        };

        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error('Parent Dashboard Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
