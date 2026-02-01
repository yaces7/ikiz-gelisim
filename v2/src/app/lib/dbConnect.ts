
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose | null> {
    if (!MONGODB_URI) {
        console.warn('⚠️ MONGODB_URI not configured');
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        }).then((mongoose) => {
            console.log('✅ MongoDB Connected');
            return mongoose;
        }).catch((err) => {
            console.error('❌ MongoDB Error:', err.message);
            cached.promise = null;
            return null;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch {
        cached.promise = null;
        return null;
    }

    return cached.conn;
}

export default dbConnect;
