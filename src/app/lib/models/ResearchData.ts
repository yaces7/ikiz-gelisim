
import mongoose, { Schema, Types, Model } from 'mongoose';

// --- User Schema ---
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'researcher', 'parent', 'admin'], default: 'user' },
    level: { type: Number, default: 1 },
    total_points: { type: Number, default: 0 },
    twin_id: { type: String, default: null }, // Link to another user ID
    created_at: { type: Date, default: Date.now },
}, { timestamps: true });

// --- Interaction Schema ---
const InteractionSchema = new Schema({
    user_id: { type: String, required: true },
    action_type: { type: String, required: true }, // e.g. 'game_played', 'journal_entry', 'task_complete'
    content: { type: String },
    impact_score: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

// --- Score Schema ---
const ScoreSchema = new Schema({
    user_id: { type: String, required: true },
    test_type: { type: String, required: true }, // 'BSO', 'GAME', 'TEST'
    scale_period: { type: String, default: 'process' },
    total_score: { type: Number, default: 0 },
    sub_dimensions: { type: Object }, // Flexible JSON for game/test details
    week_number: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

// --- Singleton Models (Crucial for Serverless Next.js) ---
let User: Model<any>;
let Interaction: Model<any>;
let Score: Model<any>;

try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', UserSchema);
}

try {
    Interaction = mongoose.model('Interaction');
} catch {
    Interaction = mongoose.model('Interaction', InteractionSchema);
}

try {
    Score = mongoose.model('Score');
} catch {
    Score = mongoose.model('Score', ScoreSchema);
}

export { User, Interaction, Score };
