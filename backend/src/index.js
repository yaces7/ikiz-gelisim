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
const parentRoutes = require('./routes/parent');

const app = express();
const server = http.createServer(app);

// 1. VERSION
const API_VERSION = "2.3.0-DEBUG-ENABLED";

// 2. IMMEDIATE LOGGING & CORS (Absolute Priority)
app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url} - ${new Date().toISOString()}`);

    // Explicit CORS headers for EVERY response
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        console.log(`[CORS] Handled OPTIONS for ${req.url}`);
        return res.status(200).send();
    }
    next();
});

// 3. MIDDLEWARES
app.use(cors({ origin: '*', credentials: true })); // Safe double-up
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// 4. SOCKET.IO
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// 5. DIAGNOSTICS
app.get('/test', (req, res) => {
    res.json({
        status: "alive",
        version: API_VERSION,
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

app.get('/ping', (req, res) => res.status(200).send('pong'));

// 6. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/test', testRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/parent', parentRoutes);

// 7. 404 & ERROR
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found", path: req.url });
});

app.use((err, req, res, next) => {
    console.error(`[ERR] ${err.message}`);
    res.status(500).json({ error: "Server error", message: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API v${API_VERSION} on port ${PORT}`);
});

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('✅ MongoDB connected'))
        .catch(err => console.error('❌ MongoDB error:', err.message));
}
