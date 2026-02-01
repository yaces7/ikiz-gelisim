
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/ResearchData';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { username, password } = await request.json();

        // 1. Find User
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Validate Password (Simple logic for demo robustness)
        // bcrypt logic is best, but if existing users don't have hashed passwords, fallback.
        // For security, assume hashed first.
        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, user.password);
        } catch (e) { /* Assume plaintext if error */ }

        if (!isValid && user.password === password) isValid = true; // Fallback for reset accounts

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: { username: user.username, role: user.role, level: user.level }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
