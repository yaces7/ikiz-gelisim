
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, ActivityLog } from '@/app/lib/models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
    try {
        const db = await dbConnect();
        if (!db) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // Find user
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Verify password
        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, user.password);
        } catch {
            // Fallback for plaintext passwords (legacy)
            isValid = user.password === password;
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Şifre yanlış' }, { status: 401 });
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { last_login: new Date() });

        // Log activity
        await ActivityLog.create({
            user_id: user._id,
            action: 'login',
            timestamp: new Date()
        });

        // Generate token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role,
                level: user.level,
                total_xp: user.total_xp,
                current_week: user.current_week,
                experiment_group: user.experiment_group,
                consent_given: user.consent_given,
                family_id: user.family_id?.toString(),
                twin_partner_id: user.twin_partner_id?.toString()
            }
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}
