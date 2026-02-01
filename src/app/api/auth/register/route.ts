
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

        const { username, email, password } = await request.json();

        // Check existing
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            level: 1,
            total_points: 0
        });

        // Generate Token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: { username: user.username, role: user.role }
        });

    } catch (error) {
        console.error("Register Error", error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
