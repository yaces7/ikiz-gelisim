
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Interaction } from '@/app/lib/models/ResearchData';
import { Groq } from 'groq-sdk';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); // Ensure env is loaded

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

        const userId = decoded.id;
        const body = await request.json();
        const { entry, mood } = body;

        if (!entry) {
            return NextResponse.json({ error: 'Entry is required' }, { status: 400 });
        }

        let analysisResult = {
            sentiment: 50,
            me_ratio: 0.5,
            we_ratio: 0.5,
            analysis_note: "AI servisi şu an meşgul."
        };

        try {
            if (process.env.GROQ_API_KEY) {
                const prompt = `Analiz et: "${entry}" -> JSON: {sentiment(0-100), me_ratio(0-1), we_ratio(0-1), analysis_note(string)}`;
                const completion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: 'llama3-8b-8192',
                    response_format: { type: 'json_object' }
                });
                const content = completion.choices[0]?.message?.content;
                if (content) analysisResult = JSON.parse(content);
            }
        } catch (e) { console.error("AI Error", e); }

        await Interaction.create({
            user_id: userId,
            action_type: 'journal_entry',
            content: `Günlük: ${entry.substring(0, 50)}...`,
            impact_score: analysisResult.sentiment,
            timestamp: new Date()
        });

        return NextResponse.json({
            success: true,
            analysis: analysisResult
        });

    } catch (error) {
        console.error('Journal Analyze Error:', error);
        return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }
}
