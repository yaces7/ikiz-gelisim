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

// 1. ABSOLUTE CORS OVERRIDE - MUST BE FIRST
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Explicitly handle pre-flight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 2. MIDDLEWARES
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// Log Request Details (For Debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 3. DATABASE
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables!');
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => console.error('❌ MongoDB Error:', err.message));
}

// 4. ROUTES
app.get('/test', (req, res) => {
    console.log('Test route hit!');
    res.send('API IS ALIVE AND CORS IS OPEN');
});

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'İkiz Gelişim API Çalışıyor', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', env: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/test', testRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/character', characterRoutes);

// 5. 404 HANDLER (with CORS)
app.use((req, res) => {
    console.warn(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Path ${req.url} not found` });
});

// 6. ERROR HANDLER (with CORS)
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Server ready on port ${PORT}`);
});
