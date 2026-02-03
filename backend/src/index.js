require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const journalRoutes = require('./routes/journal');
const testRoutes = require('./routes/test');
const gameRoutes = require('./routes/game');
const taskRoutes = require('./routes/task');
const characterRoutes = require('./routes/character');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. ABSOLUTE CORS OVERRIDE (Must be at the top)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
    res.header('Access-Control-Expose-Headers', 'Content-Length,Content-Range');

    // Log pre-flight
    if (req.method === 'OPTIONS') {
        console.log(`[CORS Preflight] ${req.method} ${req.url}`);
        return res.status(200).end();
    }
    next();
});

// 2. STANDARD CORS MIDDLEWARE
app.use(cors({ origin: '*', credentials: true }));

// 3. MIDDLEWARES
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// Log Detail
app.use((req, res, next) => {
    console.log(`[API REQUEST] ${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// 4. DATABASE
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Connected Successfully'))
        .catch(err => console.error('❌ MongoDB Connection Error:', err.message));
} else {
    console.error('⚠️ WARNING: MONGODB_URI is missing from environment variables!');
}

// 5. TEST ROUTES
app.get('/test', (req, res) => res.status(200).send('API IS ALIVE AND CORS IS OPEN'));
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/health', (req, res) => res.status(200).json({ status: 'active', node_env: process.env.NODE_ENV }));

// 6. BUSINESS ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/test', testRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/character', characterRoutes);

// 7. CATCH-ALL 404 (with CORS)
app.use((req, res) => {
    console.warn(`[API 404] Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Not Found',
        path: req.url,
        message: 'Bu endpoint mevcut değil. Lütfen URLi kontrol edin.'
    });
});

// 8. ERROR HANDLER (with CORS)
app.use((err, req, res, next) => {
    console.error('[API CRASH]', err);
    res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =========================================
    🚀 API Sunucusu Başlatıldı
    🌐 Port: ${PORT}
    📡 CORS: Aktif (Tüm Originler)
    =========================================
    `);
});
