
// === İKİZ GELİŞİM V2 - DATABASE MODELS ===
import mongoose, { Schema, Model } from 'mongoose';

// === USER MODEL ===
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['twin', 'parent', 'researcher', 'admin'], default: 'twin' },

    // Twin Specific
    twin_type: { type: String, enum: ['identical', 'fraternal'], default: null }, // tek/çift yumurta
    birth_order: { type: Number, default: null }, // 1 veya 2
    age: { type: Number, default: null },
    gender: { type: String, enum: ['male', 'female', 'other'], default: null },

    // Family Connection
    family_id: { type: Schema.Types.ObjectId, ref: 'Family', default: null },
    twin_partner_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    // Research Group
    experiment_group: { type: String, enum: ['experiment', 'control', 'unassigned'], default: 'unassigned' },

    // Progress
    level: { type: Number, default: 1 },
    total_xp: { type: Number, default: 0 },
    current_week: { type: Number, default: 1 }, // 1-6 arası
    week_progress: { type: Map, of: Boolean, default: {} }, // {week1_module: true, week1_journal: true}

    // Consent
    consent_given: { type: Boolean, default: false },
    consent_date: { type: Date, default: null },

    // Notifications
    notification_preferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    },

    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now }
}, { timestamps: true });

// === FAMILY MODEL ===
const FamilySchema = new Schema({
    family_code: { type: String, unique: true, required: true }, // Aile bağlantı kodu
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    created_at: { type: Date, default: Date.now }
});

// === PSYCHOMETRIC TEST RESULT ===
const TestResultSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    test_type: { type: String, enum: ['BSO', 'ATE', 'OTHER'], required: true }, // Bireyselleşme Süreci Ölçeği / Aile Tutum Envanteri
    test_period: { type: String, enum: ['pre', 'post', 'followup'], required: true }, // Ön-test, Son-test, İzleme

    // Raw Answers (for reverse coding)
    raw_answers: { type: Map, of: Number },

    // Processed Scores
    sub_dimensions: {
        autonomy: { type: Number, default: 0 }, // Özerklik
        attachment: { type: Number, default: 0 }, // Bağlılık
        democratic: { type: Number, default: 0 }, // Demokratik (ATE)
        protective: { type: Number, default: 0 }, // Koruyucu (ATE)
    },
    total_score: { type: Number, default: 0 },

    completed_at: { type: Date, default: Date.now }
});

// === SIMULATION/GAME RESULT ===
const SimulationResultSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    simulation_type: { type: String, required: true }, // boundary, mirror, social, diplomacy
    week: { type: Number, required: true }, // Hangi hafta

    // Decision Data
    decisions: [{
        scenario_id: String,
        choice: String,
        independence_weight: Number, // 0-100 arası bağımsızlık puanı
        twin_influence_weight: Number // 0-100 arası ikiz etkisi
    }],

    // Final Analysis
    overall_independence_score: { type: Number, default: 50 },
    overall_twin_influence: { type: Number, default: 50 },
    ai_feedback: { type: String, default: '' },

    completed_at: { type: Date, default: Date.now }
});

// === DIGITAL JOURNAL ===
const JournalEntrySchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Number, required: true },

    // Content
    content: { type: String, required: true },
    mood_icon: { type: String, default: '😐' }, // Duygu ikonu
    guided_question: { type: String }, // Yönlendirici soru

    // AI Analysis
    sentiment_score: { type: Number, default: 50 }, // 0-100
    me_ratio: { type: Number, default: 0.5 }, // Ben zamiri oranı
    we_ratio: { type: Number, default: 0.5 }, // Biz zamiri oranı
    themes: [{ type: String }], // Tespit edilen temalar
    ai_insight: { type: String, default: '' },

    created_at: { type: Date, default: Date.now }
});

// === WEEKLY MODULE PROGRESS ===
const ModuleProgressSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    week: { type: Number, required: true }, // 1-6

    // Completion Status
    reading_completed: { type: Boolean, default: false },
    activity_completed: { type: Boolean, default: false },
    simulation_completed: { type: Boolean, default: false },
    journal_completed: { type: Boolean, default: false },

    // Timestamps
    started_at: { type: Date, default: Date.now },
    completed_at: { type: Date, default: null },

    // Time Tracking
    total_time_spent: { type: Number, default: 0 } // Minutes
});

// === ACTIVITY LOG (For Analytics) ===
const ActivityLogSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // login, module_start, simulation_complete, journal_write, etc.
    metadata: { type: Map, of: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

// === Singleton Models ===
let User: Model<any>;
let Family: Model<any>;
let TestResult: Model<any>;
let SimulationResult: Model<any>;
let JournalEntry: Model<any>;
let ModuleProgress: Model<any>;
let ActivityLog: Model<any>;

try { User = mongoose.model('User'); } catch { User = mongoose.model('User', UserSchema); }
try { Family = mongoose.model('Family'); } catch { Family = mongoose.model('Family', FamilySchema); }
try { TestResult = mongoose.model('TestResult'); } catch { TestResult = mongoose.model('TestResult', TestResultSchema); }
try { SimulationResult = mongoose.model('SimulationResult'); } catch { SimulationResult = mongoose.model('SimulationResult', SimulationResultSchema); }
try { JournalEntry = mongoose.model('JournalEntry'); } catch { JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema); }
try { ModuleProgress = mongoose.model('ModuleProgress'); } catch { ModuleProgress = mongoose.model('ModuleProgress', ModuleProgressSchema); }
try { ActivityLog = mongoose.model('ActivityLog'); } catch { ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema); }

export { User, Family, TestResult, SimulationResult, JournalEntry, ModuleProgress, ActivityLog };
