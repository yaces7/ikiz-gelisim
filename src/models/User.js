const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password_hash: { type: String, required: true },
    full_name: String,
    role: { type: String, enum: ['twin', 'parent', 'admin'], required: true },
    gender: String,
    birth_date: Date,
    twin_type: { type: String, enum: ['monozygotic', 'dizygotic'] },
    group_type: { type: String, enum: ['experiment', 'control'], default: 'control' },
    family_code: String,
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
