
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import { Groq } from 'groq-sdk';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
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

        const body = await request.json();
        const { entry, mood } = body;

        if (!entry) {
            return NextResponse.json({ error: 'Entry is required' }, { status: 400 });
        }

        // AI Analysis with Groq
        let analysisResult = {
            sentiment: 50,
            me_ratio: 0.5,
            we_ratio: 0.5,
            analysis_note: "Analiz servisi şu an meşgul."
        };

        try {
            const prompt = `
            Sen bir ikiz psikolojisi uzmanısın. Aşağıdaki günlük yazısını analiz et.
            Yazı: "${entry}"
            
            Lütfen şu formatta JSON döndür:
            {
                "sentiment": (0-100 arası duygu puanı, 100 çok pozitif),
                "me_ratio": (0.0-1.0 arası "ben" dili kullanımı),
                "we_ratio": (0.0-1.0 arası "biz" dili kullanımı),
                "analysis_note": (Tek cümlelik Türkçe özet yorum, ikiz bireyselleşmesi açısından)
            }
            Sadece JSON.
            `;

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama3-8b-8192',
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                analysisResult = JSON.parse(content);
            }
        } catch (aiError) {
            console.error('Groq Analysis Error:', aiError);
            // Fallback mock analysis if API fails
            analysisResult = {
                sentiment: mood === 'happy' ? 80 : (mood === 'sad' ? 30 : 50),
                me_ratio: 0.5,
                we_ratio: 0.5,
                analysis_note: "Yazınız kaydedildi."
            };
        }

        // Save Interaction
        await Interaction.create({
            user_id: decoded.id,
            action_type: 'journal_entry',
            content: entry.substring(0, 100) + '...', // Preview
            impact_score: analysisResult.sentiment, // Use sentiment as score for now
            timestamp: new Date()
        });

        // We could also save the full journal in a Journal model if requested, but Interaction works for feed.

        return NextResponse.json({
            success: true,
            analysis: analysisResult
        });

    } catch (error) {
        console.error('Journal Analyze Error:', error);
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }
}
