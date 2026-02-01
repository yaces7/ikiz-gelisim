
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';
import Groq from 'groq-sdk';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Groq client
// Note: In production, ensure GROQ_API_KEY is set in .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummmy_key_to_prevent_crash_on_build'
});

export async function POST(request: Request) {
    try {
        await dbConnect();

        // 1. Authenticate User
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

        // 2. Parse Request Body
        const { content } = await request.json();
        if (!content || content.length < 10) {
            return NextResponse.json({ error: 'Content too short' }, { status: 400 });
        }

        // 3. Call Groq API for Analysis
        if (!process.env.GROQ_API_KEY) {
            console.warn("GROQ_API_KEY is missing. Returning mock analysis.");
            // Mock response if no key (dev mode fallback)
            const mockAnalysis = {
                sentiment: 'Nötr (Mock)',
                themes: ['Gelişim (Mock)', 'Farkındalık (Mock)'],
                feedback: 'API anahtarı eksik olduğu için bu bir simülasyon yanıtıdır. Lütfen .env dosyanıza GROQ_API_KEY ekleyin.',
                impact_score: 50
            };
            // Save to DB even if mock
            const interaction = await Interaction.create({
                user_id: userId,
                action_type: 'journal',
                content: content,
                impact_score: mockAnalysis.impact_score,
                analysis: mockAnalysis
            });

            return NextResponse.json(mockAnalysis);
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Sen uzman bir psikolojik danışmansın. Kullanıcının yazdığı günlüğü analiz etmelisin.
                    
                    Yanıtını *SADECE* aşağıdaki JSON formatında ver:
                    {
                        "sentiment": "Olumlu" | "Olumsuz" | "Nötr" | "Karmaşık",
                        "themes": ["Tema1", "Tema2", "Tema3"], (En fazla 3 tema, örneğin: Kaygı, Özgüven, Aile İlişkileri),
                        "feedback": "Kısa, empatik ve gelişim odaklı bir geri bildirim (maksimum 2 cümle).",
                        "impact_score": 0-100 (Bireyselleşme ve pozitif gelişime katkı puanı)
                    }
                    Ekstra metin yazma, sadece JSON.`
                },
                {
                    role: "user",
                    content: content
                }
            ],
            model: "llama3-8b-8192", // Fast and efficient model
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const resultText = completion.choices[0]?.message?.content || '{}';
        let analysisData;
        try {
            analysisData = JSON.parse(resultText);
        } catch (e) {
            console.error("JSON Parse Error form Groq:", resultText);
            analysisData = { sentiment: 'Analiz Hatası', feedback: 'Analiz formatında bir sorun oluştu.', themes: [], impact_score: 0 };
        }

        // 4. Save to Database
        const interaction = await Interaction.create({
            user_id: userId,
            action_type: 'journal',
            content: content, // Store the journal content (encrypted ideally, but plain for this demo)
            impact_score: analysisData.impact_score || 0,
            analysis: analysisData
        });

        return NextResponse.json(analysisData);

    } catch (error) {
        console.error('Journal API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
