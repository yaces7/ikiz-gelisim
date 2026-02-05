'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function ActivityTracker() {
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Send a heartbeat every 60 seconds
        const interval = setInterval(async () => {
            try {
                await api.post('/api/progression/heartbeat', {});
            } catch (e) {
                // Silently fail to not disturb user experience
                console.debug('Heartbeat failed');
            }
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    return null; // This component doesn't render anything
}
