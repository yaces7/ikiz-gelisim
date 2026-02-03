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

// 1. CORS - MUST BE AT THE VERY TOP
app.use(cors()); // Allow all origins, all methods, all headers by default
app.options('*', cors()); // Enable pre-flight across-the-board

// 2. HELMET & MORGAN
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ikiz-gelisim';

mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err.message));

// Health Check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'İkiz Gelişim API',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/test', testRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/character', characterRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
