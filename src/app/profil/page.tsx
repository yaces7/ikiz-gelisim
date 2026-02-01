
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem('token');
        if (!token) {
            // router.push('/giris'); // Let's avoid redirect loop if feasible, or allow view
            // But for profile, redirect needed.
            // router.push('/giris');
            // Let's just return early.
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setProfileData(json);
                }
            } catch (e) { console.error(e); } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Profil Yükleniyor...</div>;
    }

    // Fallback for null data if API fails or user not logged in
    if (!profileData) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Lütfen Giriş Yapın.</div>;

    const { user: levelInfo, stats, recentActivities } = profileData;

    const radarChartData = {
        labels: stats.radarLabels || ['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık'],
        datasets: [
            {
                label: 'Mevcut Seviye',
                data: stats.radarData || [50, 50, 50, 50, 50],
                backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue-500 with opacity
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#fff',
            },
        ],
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: {
                    color: '#94a3b8', // Slate-400
                    font: { size: 12, weight: 'bold' as const },
                },
                ticks: { display: false, backdropColor: 'transparent' },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
        plugins: {
            legend: { display: false },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-24 px-4 overflow-hidden">

            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 glass p-8 rounded-3xl border border-white/5">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl object-cover">
                                👤
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-xs font-bold">
                            Lv{levelInfo.level}
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{user?.username || 'İkiz Kullanıcı'}</h1>
                        <p className="text-blue-400 font-medium tracking-wide mb-4">{levelInfo.title}</p>

                        {/* XP Bar */}
                        <div className="w-full max-w-md bg-slate-800 h-4 rounded-full overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelInfo.nextLevelProgress}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-right max-w-md">Sonraki seviyeye %{Math.round(100 - levelInfo.nextLevelProgress)} kaldı</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                            <div className="text-2xl font-black text-white">{stats.totalPoints}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Puan</div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                            <div className="text-2xl font-black text-white">{stats.gamesPlayed}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Oyun</div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                            <div className="text-2xl font-black text-white">{stats.testsCompleted}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase">Test</div>
                        </div>
                    </div>
                </div>

                {/* content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Activity & Family */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Family Card (NEW) */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-6 rounded-3xl border border-white/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Aile Bağlantısı</h3>
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20">
                                    AİLE
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-lg">
                                        👯
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">İkiz Kardeşim</div>
                                        <div className="text-xs text-slate-400">Bağlantı Bekleniyor...</div>
                                    </div>
                                    <button className="ml-auto text-xs font-bold text-blue-400 hover:text-white transition">Davet Et</button>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-lg">
                                        👪
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Ebeveynler</div>
                                        <div className="text-xs text-slate-400">Bağlantı Yok</div>
                                    </div>
                                    <button className="ml-auto text-xs font-bold text-blue-400 hover:text-white transition">Bağla</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-6 rounded-3xl border border-white/5"
                        >
                            <h3 className="text-lg font-bold text-white mb-4">Son Aktiviteler</h3>
                            <div className="space-y-3">
                                {recentActivities.map((act: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <p className="text-xs text-slate-300 flex-1 line-clamp-1">{act.action}</p>
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(act.timestamp).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && (
                                    <p className="text-slate-500 text-xs text-center py-4">Henüz aktivite yok.</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats & Radar */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Radar Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center"
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Gelişim Haritası</h3>
                            <div className="w-full h-[300px] md:h-[400px]">
                                <Radar data={radarChartData} options={radarOptions} />
                            </div>
                        </motion.div>

                        {/* Achievements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass p-8 rounded-3xl border border-white/5"
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Rozetler</h3>
                            <div className="flex gap-4 flex-wrap">
                                {stats.totalPoints > 100 && (
                                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500 text-2xl flex items-center justify-center tooltip cursor-help" title="Başlangıç: 100+ Puan">🚀</div>
                                )}
                                {stats.gamesPlayed >= 5 && (
                                    <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500 text-2xl flex items-center justify-center tooltip cursor-help" title="Oyun Ustası: 5+ Oyun">🎮</div>
                                )}
                                {stats.radarData[0] > 70 && (
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 text-2xl flex items-center justify-center tooltip cursor-help" title="Özgür Ruh: Yüksek Özerklik">🌿</div>
                                )}

                                {stats.totalPoints < 50 && <p className="text-xs text-slate-500">Rozet kazanmak için puan topla.</p>}
                            </div>
                        </motion.div>
                    </div>

                </div>

            </div>
        </div>
    );
}
