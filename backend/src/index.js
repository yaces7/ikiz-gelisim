require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);

// 1. VERSION
const API_VERSION = "2.1.0-ULTRA-STABLE";

// 2. CORS - GLOBAL MANUAL HEADERS (Catch-all)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 3. SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 4. MIDDLEWARES
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 5. DIAGNOSTIC ROUTES
app.get('/test', (req, res) => {
    res.send(`API IS ALIVE - VERSION: ${API_VERSION}`);
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        version: API_VERSION,
        db: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED'
    });
});

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
    console.warn(`[404] NOT FOUND: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Endpoint Bulunamadı',
        path: req.url,
        version: API_VERSION,
        message: 'Lütfen API yolunu kontrol edin veya Renderda Root Directory ayarını "backend" yapın.'
    });
});

// 8. ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('[CRITICAL ERROR]', err);
    res.status(500).json({
        error: 'Sunucu Hatası',
        details: err.message,
        version: API_VERSION
    });
});

// 9. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =========================================
    🚀 İKİZ GELİŞİM API v${API_VERSION}
    📡 Port: ${PORT}
    🏠 Root: backend/src/index.js
    =========================================
    `);
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => console.error('❌ MongoDB Error:', err.message));
} else {
    console.error('❌ MONGODB_URI IS MISSING!');
}
