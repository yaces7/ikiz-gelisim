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
const API_VERSION = "2.2.0-ULTRA-RESILIENT";

// 2. TRUST PROXY (Essential for Render/Vercel)
app.set('trust proxy', 1);

// 3. AGGRESSIVE CORS CONFIGURATION
// We use the 'cors' package for most things, but we handle OPTIONS and headers manually to be absolutely sure.
const corsOptions = {
    origin: true, // Echoes the origin of the request
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Extra manual header insurance for every single request
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Overwrite with wildcard for simplicity in debugging
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// 4. SOCKET.IO SETUP
const io = new Server(server, {
    path: "/socket.io/",
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`[Socket] Disconnected: ${socket.id}`));
});

// 5. MIDDLEWARES
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('origin')}`);
    next();
});

// 6. DIAGNOSTIC ROUTES
app.get('/test', (req, res) => res.send(`API IS ALIVE - VERSION: ${API_VERSION}`));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        version: API_VERSION,
        db: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
        env: process.env.NODE_ENV
    });
});

// 7. BUSINESS ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/test', testRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/character', characterRoutes);

// 8. CATCH-ALL 404 (with CORS)
app.use((req, res) => {
    console.warn(`[404] NOT FOUND: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Endpoint Bulunamadı',
        path: req.url,
        message: 'Bu yol sunucuda tanımlı değil. Eğer /api ekini unuttuysanız ekleyin.'
    });
});

// 9. ERROR HANDLER
app.use((err, req, res, next) => {
    console.error('[CRITICAL SERVER ERROR]', err);
    res.status(500).json({
        error: 'Sunucu Hatası',
        details: err.message,
        path: req.url
    });
});

// 10. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =========================================
    🚀 İKİZ GELİŞİM API v${API_VERSION}
    📡 Port: ${PORT}
    =========================================
    `);
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB Bağlantısı Başarılı'))
        .catch(err => console.error('❌ MongoDB Bağlantı Hatası:', err.message));
} else {
    console.warn('⚠️ MONGODB_URI TANIMLANMAMIŞ!');
}
