
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'twin' | 'parent' | 'researcher' | 'admin';
    level: number;
    total_xp: number;
    current_week: number;
    experiment_group: 'experiment' | 'control' | 'unassigned';
    consent_given: boolean;
    family_id?: string;
    twin_partner_id?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updated = { ...user, ...updates };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
