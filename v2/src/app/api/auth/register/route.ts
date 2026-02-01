
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Family, ActivityLog } from '@/app/lib/models';
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

        const {
            username,
            email,
            password,
            role = 'twin',
            twin_type,
            birth_order,
            age,
            gender,
            family_code // Optional: To join existing family
        } = await request.json();

        // Validation
        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Tüm alanlar gerekli' }, { status: 400 });
        }

        // Check existing
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return NextResponse.json({ error: 'Bu kullanıcı adı veya email zaten kayıtlı' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle family connection
        let familyId = null;
        if (family_code) {
            const family = await Family.findOne({ family_code });
            if (family) {
                familyId = family._id;
            } else {
                return NextResponse.json({ error: 'Aile kodu bulunamadı' }, { status: 404 });
            }
        }

        // Auto-assign experiment group (50/50 split)
        const totalUsers = await User.countDocuments({ role: 'twin' });
        const experimentGroup = totalUsers % 2 === 0 ? 'experiment' : 'control';

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            twin_type: twin_type || null,
            birth_order: birth_order || null,
            age: age || null,
            gender: gender || null,
            family_id: familyId,
            experiment_group: role === 'twin' ? experimentGroup : 'unassigned',
            level: 1,
            total_xp: 0,
            current_week: 1,
            consent_given: false
        });

        // If family exists, add user to members
        if (familyId) {
            await Family.findByIdAndUpdate(familyId, {
                $push: { members: user._id }
            });
        }

        // Log activity
        await ActivityLog.create({
            user_id: user._id,
            action: 'register',
            metadata: { experiment_group: experimentGroup },
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
                consent_given: user.consent_given
            }
        });

    } catch (error: any) {
        console.error('Register Error:', error);
        return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
    }
}
