const mongoose = require('mongoose');

// --- User Schema ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'twin', 'researcher', 'parent', 'admin'], default: 'user' },
    level: { type: Number, default: 1 },
    total_points: { type: Number, default: 0 },
    twin_id: { type: String, default: null },
    familyCode: { type: String, default: null },
    current_week: { type: Number, default: 1 }, // Max unlocked week
    active_week: { type: Number, default: 1 }, // Currently selected week for content
    completed_weeks: [{ type: Number }],
    character: {
        name: { type: String, default: null },
        appearance: { type: Object, default: null },
        values: [{ type: String }],
        goals: [{ type: String }]
    },
    wheelTasks: [{
        task: { type: String },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        addedAt: { type: Date, default: Date.now }
    }],
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// --- Interaction Schema (Günlük, Aktivite logları) ---
const InteractionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    action_type: { type: String, required: true },
    content: { type: String },
    impact_score: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

// --- Score Schema (Oyun, Test sonuçları) ---
const ScoreSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    test_type: { type: String, required: true },
    scale_period: { type: String, default: 'process' },
    total_score: { type: Number, default: 0 },
    sub_dimensions: { type: Object },
    week_number: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

// Model exports
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Interaction = mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);
const Score = mongoose.models.Score || mongoose.model('Score', ScoreSchema);

module.exports = { User, Interaction, Score };
