const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    me_count: Number,
    we_count: Number,
    sentiment_score: Number,
    week_number: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
