const mongoose = require('mongoose');

const ScaleResultSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scale_type: String,
    scores_json: String, // Stored as JSON string to match previous SQLite logic
    total_score: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ScaleResult || mongoose.model('ScaleResult', ScaleResultSchema);
