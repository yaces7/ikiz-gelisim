
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        // Son 7 günün yazılarını getir
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const interactions = await Interaction.find({
            user_id: decoded.id,
            action_type: 'journal_entry',
            timestamp: { $gte: oneWeekAgo }
        });

        if (interactions.length < 1) {
            return NextResponse.json({
                totalEntries: 0,
                message: 'Henüz yeterli veri yok'
            });
        }

        // Analiz yap
        const moodDistribution: Record<string, number> = {};
        const allThemes: string[] = [];
        let totalMeRatio = 0;
        let totalSentiment = 0;

        interactions.forEach(i => {
            let parsed: any = {};
            try {
                parsed = typeof i.content === 'string' ? JSON.parse(i.content) : i.content;
            } catch {
                parsed = {};
            }

            // Mood dağılımı
            const mood = parsed.moodIcon || '😐';
            moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;

            // Temalar
            if (parsed.themes) {
                allThemes.push(...parsed.themes);
            }

            // Oranlar
            totalMeRatio += (parsed.meRatio || 0.5);
            totalSentiment += (parsed.sentimentScore || 50);
        });

        // En çok tekrar eden temalar
        const themeCount: Record<string, number> = {};
        allThemes.forEach(t => { themeCount[t] = (themeCount[t] || 0) + 1; });
        const topThemes = Object.entries(themeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);

        // Ortalamalar
        const avgMeRatio = Math.round((totalMeRatio / interactions.length) * 100);
        const avgSentiment = Math.round(totalSentiment / interactions.length);

        // AI Özet oluştur
        let summary = '';
        if (avgSentiment >= 60) {
            summary = 'Bu hafta genel olarak olumlu bir ruh hali içindesin. ';
        } else if (avgSentiment <= 40) {
            summary = 'Bu hafta bazı zorluklarla karşılaşmış olabilirsin. ';
        } else {
            summary = 'Bu hafta dengeli bir dönem geçirdin. ';
        }

        if (avgMeRatio >= 60) {
            summary += 'Bireysel odağın yüksek, bu bireyselleşme sürecinde önemli. ';
        } else if (avgMeRatio <= 40) {
            summary += 'İkizin ve ailen hakkında çok düşünüyorsun, kendi alanını da oluşturmayı unutma. ';
        }

        if (topThemes.includes('Sınır Koyma')) {
            summary += 'Sınır koyma konusunda farkındalığın artıyor. ';
        }
        if (topThemes.includes('Karar Alma')) {
            summary += 'Karar alma süreçlerin üzerine düşünüyorsun, harika! ';
        }

        summary += `Bu hafta ${interactions.length} günlük yazısı yazdın, böyle devam et!`;

        return NextResponse.json({
            totalEntries: interactions.length,
            moodDistribution,
            topThemes,
            avgMeRatio,
            avgSentiment,
            summary
        });

    } catch (error) {
        console.error("Journal Insights Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
