
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Interaction, Score } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const entryText = body.content || body.entry || '';
        const mood = body.mood || 'Nötr';
        const moodIcon = body.moodIcon || '😐';
        const guidedQuestion = body.guidedQuestion || '';
        const week = body.week || 1;

        if (!entryText || entryText.length < 10) {
            return NextResponse.json({ error: 'Entry too short' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
        const token = authHeader.split(' ')[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.id;
        const lowerEntry = entryText.toLowerCase();

        // === DUYGU ANALİZİ ===
        let sentimentScore = 50;
        let sentimentLabel = 'Nötr';

        // Pozitif kelimeler
        const positiveWords = ['mutlu', 'harika', 'güzel', 'seviyorum', 'başardım', 'gurur', 'huzur', 'rahat', 'iyi', 'keyif', 'sevinç', 'umut'];
        const negativeWords = ['üzgün', 'kötü', 'sinir', 'kızgın', 'korku', 'endişe', 'stres', 'kaygı', 'kıskandım', 'yalnız', 'bıktım', 'zor'];

        let posCount = 0;
        let negCount = 0;
        positiveWords.forEach(w => { if (lowerEntry.includes(w)) posCount++; });
        negativeWords.forEach(w => { if (lowerEntry.includes(w)) negCount++; });

        sentimentScore = Math.min(100, Math.max(0, 50 + (posCount * 10) - (negCount * 10)));

        if (sentimentScore >= 60) sentimentLabel = 'Pozitif 😊';
        else if (sentimentScore <= 40) sentimentLabel = 'Negatif 😔';
        else sentimentLabel = 'Nötr 😐';

        // === BEN / BİZ ANALİZİ ===
        const meWords = (entryText.match(/\bben\b|\bbenim\b|\bkendim\b|\bkendi\b|\bbana\b|\bbeni\b/gi) || []).length;
        const weWords = (entryText.match(/\bbiz\b|\bbizim\b|\bikizim\b|\bkardeşim\b|\bberaber\b|\bbirlikte\b/gi) || []).length;
        const total = meWords + weWords || 1;
        const meRatio = meWords / total;
        const weRatio = weWords / total;

        // === TEMA TESPİTİ ===
        const themes: string[] = [];
        if (lowerEntry.includes('okul') || lowerEntry.includes('ders') || lowerEntry.includes('sınav')) themes.push('Akademik');
        if (lowerEntry.includes('arkadaş') || lowerEntry.includes('sosyal') || lowerEntry.includes('parti')) themes.push('Sosyal');
        if (lowerEntry.includes('aile') || lowerEntry.includes('anne') || lowerEntry.includes('baba')) themes.push('Aile');
        if (lowerEntry.includes('ikiz') || lowerEntry.includes('kardeş')) themes.push('İkizlik');
        if (lowerEntry.includes('karar') || lowerEntry.includes('seçtim') || lowerEntry.includes('seçim')) themes.push('Karar Alma');
        if (lowerEntry.includes('sınır') || lowerEntry.includes('hayır') || lowerEntry.includes('özel')) themes.push('Sınır Koyma');
        if (lowerEntry.includes('gelecek') || lowerEntry.includes('hedef') || lowerEntry.includes('hayal')) themes.push('Gelecek');
        if (lowerEntry.includes('duygular') || lowerEntry.includes('hissettim') || lowerEntry.includes('duygu')) themes.push('Duygusal');
        if (themes.length === 0) themes.push('Genel');

        // === AI FEEDBACK ===
        let feedback = '';

        // Ben/Biz oranına göre
        if (meRatio > 0.6) {
            feedback = 'Yazında bireysel odak yüksek - bu bireyselleşme sürecinde olumlu bir işaret! ';
        } else if (weRatio > 0.6) {
            feedback = 'Yazında ikizin ve "biz" kavramı öne çıkıyor. Bu bağı korurken kendi alanını da oluşturmaya çalış. ';
        } else {
            feedback = 'Dengeli bir bakış açısı görüyorum. ';
        }

        // Duygu durumuna göre
        if (sentimentScore >= 70) {
            feedback += 'Olumlu bir ruh hali içindesin, bu enerjiyi sürdür!';
        } else if (sentimentScore <= 30) {
            feedback += 'Zor bir dönemden geçiyor olabilirsin. Kendine nazik ol ve destek almaktan çekinme.';
        } else if (sentimentScore <= 40) {
            feedback += 'Bazı zorluklar yaşıyor olabilirsin. Duygularını fark etmen önemli bir adım.';
        } else {
            feedback += 'Dengeli bir gün. Her duygu geçerlidir, yazmaya devam et.';
        }

        // Haftaya göre ek yorum
        const weekFeedback: Record<number, string> = {
            1: ' Bu hafta kimlik keşfi üzerine düşünüyoruz - sen kimsin?',
            2: ' Sınır koyma bu haftanın teması - kendi alanını korumayı öğren.',
            3: ' Karar alma becerilerini geliştiriyorsun - kimin etkisinde kalıyorsun?',
            4: ' Duygusal farkındalık önemli - duygularını ikizinden ayırt edebiliyor musun?',
            5: ' Sosyal kimliğini keşfet - kendi arkadaşlıklarını kur.',
            6: ' Entegrasyon zamanı - tüm öğrendiklerini birleştir.'
        };
        feedback += weekFeedback[week] || '';

        // === VERİTABANINA KAYDET ===
        await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: JSON.stringify({
                text: entryText,
                mood: mood,
                moodIcon: moodIcon,
                guidedQuestion: guidedQuestion,
                week: week,
                sentimentScore: sentimentScore,
                meRatio: meRatio,
                weRatio: weRatio,
                themes: themes
            }),
            impact_score: sentimentScore,
            timestamp: new Date()
        });

        // XP ekle
        await User.findByIdAndUpdate(userId, {
            $inc: { total_points: 10 }
        });

        return NextResponse.json({
            success: true,
            sentiment: sentimentLabel,
            sentimentScore,
            me_ratio: meRatio,
            we_ratio: weRatio,
            themes,
            feedback
        });

    } catch (error) {
        console.error("Journal Analyze Error", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
