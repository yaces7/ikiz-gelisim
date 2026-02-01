
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Mock Data Types - in real app, fetch from API
type UserStats = {
    independenceScore: number; // 0-100
    completedTests: number;
    completedScenarios: number;
    weeklyStreak: number;
    lastActivity: string;
};

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
            <ProfileContent />
        </Suspense>
    );
}

function ProfileContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/giris');
            return;
        }

        // Simulate fetching data from MongoDB
        // In reality: fetch('/api/user/stats')
        setStats({
            independenceScore: 65,
            completedTests: 2,
            completedScenarios: 3,
            weeklyStreak: 4,
            lastActivity: 'Bugün, 14:30'
        });
    }, [user, router]);

    if (!user || !stats) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-slate-800 z-10">
                        {user.fullName?.[0].toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="text-4xl font-black text-white mb-2">{user.fullName}</h1>
                        <p className="text-slate-400 text-lg mb-4">@{user.username}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <span className="px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold border border-green-500/20">
                                Çevrimiçi
                            </span>
                            <span className="px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20">
                                Hafta 2: Sınırlar
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="z-10">
                        <button
                            onClick={logout}
                            className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
                        >
                            Oturumu Kapat
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Bireyselleşme Skoru"
                        value={`%${stats.independenceScore}`}
                        icon="🧬"
                        color="text-purple-400"
                        bg="bg-purple-900/20"
                    />
                    <StatCard
                        title="Tamamlanan Testler"
                        value={stats.completedTests}
                        icon="📝"
                        color="text-blue-400"
                        bg="bg-blue-900/20"
                    />
                    <StatCard
                        title="Çözülen Senaryolar"
                        value={stats.completedScenarios}
                        icon="🎬"
                        color="text-emerald-400"
                        bg="bg-emerald-900/20"
                    />
                    <StatCard
                        title="Haftalık Seri"
                        value={`${stats.weeklyStreak} Gün`}
                        icon="🔥"
                        color="text-orange-400"
                        bg="bg-orange-900/20"
                    />
                </div>

                {/* Content Tabs / Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Detailed Progress - Placeholder for real chart */}
                    <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Gelişim Grafiği</h2>
                        <div className="h-64 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-center text-slate-500 italic">
                            Grafik Verisi Yükleniyor... (Kütüphane Bağlantısı Bekleniyor)
                        </div>
                        <p className="mt-4 text-slate-400 text-sm">
                            * Bu grafik 6 haftalık süreçteki duygusal ve sosyal gelişimini takip eder.
                        </p>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Son Aktiviteler</h2>
                        <ul className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <li key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                                        🎯
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Çarkıfelek Döndürüldü</h4>
                                        <p className="text-xs text-slate-400">Bugün</p>
                                    </div>
                                </li>
                            ))}
                            <li className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                                    📝
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Karakter Oluşturuldu</h4>
                                    <p className="text-xs text-slate-400">Dün</p>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors border border-white/10 rounded-xl hover:bg-white/5">
                            Tüm Geçmişi Gör
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, bg }: { title: string, value: string | number, icon: string, color: string, bg: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border border-white/5 shadow-lg ${bg} backdrop-blur-sm`}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-4xl">{icon}</span>
                <span className={`text-3xl font-black ${color}`}>{value}</span>
            </div>
            <h3 className="text-slate-300 font-bold text-sm tracking-wide uppercase opacity-80">{title}</h3>
        </motion.div>
    );
}
