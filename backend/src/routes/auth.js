const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Interaction } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, user.password);
        } catch {
            isValid = user.password === password;
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Şifre yanlış' });
        }

        await User.findByIdAndUpdate(user._id, { last_login: new Date() });

        await Interaction.create({
            user_id: user._id,
            action_type: 'login',
            content: 'Giriş yaptı',
            timestamp: new Date()
        });

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                level: user.level || 1,
                total_points: user.total_points || 0,
                current_week: user.current_week || 1
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tüm alanlar gerekli' });
        }

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({ error: 'Bu kullanıcı adı veya email zaten kayıtlı' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user',
            level: 1,
            total_points: 0,
            current_week: 1
        });

        await Interaction.create({
            user_id: user._id,
            action_type: 'register',
            content: 'Kayıt oldu',
            timestamp: new Date()
        });

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                level: 1,
                total_points: 0,
                current_week: 1
            }
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
