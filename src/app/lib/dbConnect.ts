
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Global cache to prevent multiple connections in serverless environment
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose | null> {
    // Return null gracefully if no URI (allows build to complete)
    if (!MONGODB_URI) {
        console.warn('Warning: MONGODB_URI not set');
        return null;
    }

    // Return existing connection
    if (cached.conn) {
        return cached.conn;
    }

    // Create new connection
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log('MongoDB Connected');
                return mongoose;
            })
            .catch((err) => {
                console.error('MongoDB Connection Error:', err.message);
                cached.promise = null;
                return null;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('DB Connect Error:', e);
        return null;
    }

    return cached.conn;
}

export default dbConnect;
