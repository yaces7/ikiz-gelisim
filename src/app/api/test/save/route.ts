
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Score } from '@/app/lib/models/ResearchData';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        // 1. Authenticate
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

        // 2. Parse Data
        const body = await request.json();
        const { weekId, score, answers } = body;
        // answers is optional array of { questionId, answerId } if frontend sends it

        if (typeof weekId !== 'number' || typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid Data' }, { status: 400 });
        }

        // 3. Save Score
        const newScore = await Score.create({
            user_id: userId,
            test_type: 'BSO', // Weekly tests contribute to BSO metric generally
            scale_period: weekId === 1 ? 'pre' : (weekId === 6 ? 'post' : 'process'),
            week_number: weekId, // Add week number to schema if needed, or query by timestamp
            total_score: score,
            sub_dimensions: { week: weekId, answers: answers || [] }, // Store raw data
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, score: newScore });

    } catch (error) {
        console.error('Save Test Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
