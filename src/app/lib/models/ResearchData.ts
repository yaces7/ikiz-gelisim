import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String },
    role: { type: String, enum: ['twin', 'parent', 'admin'], required: true },

    // Demographics
    gender: String,
    birth_date: Date,
    twin_type: { type: String, enum: ['monozygotic', 'dizygotic', 'unknown'] },

    // Research Logic
    group_type: { type: String, enum: ['experiment', 'control'], default: 'control' },
    family_code: { type: String, required: true },

    created_at: { type: Date, default: Date.now }
});

export const User = models.User || model('User', UserSchema);

const ScoreSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    test_type: { type: String, enum: ['BSO', 'ATE'] },
    scale_period: { type: String, enum: ['pre', 'post', 'follow-up'], default: 'pre' },
    total_score: Number,
    sub_dimensions: Object, // JSON of sub-scores
    timestamp: { type: Date, default: Date.now }
});

export const Score = models.Score || model('Score', ScoreSchema);

const InteractionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    action_type: { type: String, enum: ['simulation', 'journal'] },
    content: String,
    impact_score: Number,
    timestamp: { type: Date, default: Date.now }
});

export const Interaction = models.Interaction || model('Interaction', InteractionSchema);
