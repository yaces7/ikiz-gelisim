const mongoose = require('mongoose');

const ProgressionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    current_week: { type: Number, default: 1 },
    is_locked: { type: Boolean, default: false },
    last_activity: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Progression || mongoose.model('Progression', ProgressionSchema);
