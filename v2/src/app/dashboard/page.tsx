
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const WEEKS_DATA = [
    { week: 1, title: 'Temeller', icon: '🏠', topics: ['Bireyselleşme Nedir?', 'İkiz Olmanın Benzersizliği'] },
    { week: 2, title: 'Sınır Koyma', icon: '🛡️', topics: ['Fiziksel ve Duygusal Sınırlar', 'Hayır Deme Becerisi'] },
    { week: 3, title: 'Karar Alma', icon: '🎯', topics: ['Bağımsız Düşünme', 'Değerlerini Keşfetme'] },
    { week: 4, title: 'Duygusal Ayrışma', icon: '💚', topics: ['Empati vs Ayrışma', 'Kendin Olmak'] },
    { week: 5, title: 'Sosyal Kimlik', icon: '🌐', topics: ['İlişkilerde Kendi Yerin', 'Yeni Bağlantılar'] },
    { week: 6, title: 'Entegrasyon', icon: '✨', topics: ['Öğrendiklerini Birleştirme', 'Gelecek Planları'] }
];

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/giris');
            return;
        }

        if (user) {
            fetchStats();
        }
    }, [user, isAuthenticated, isLoading, router]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="twin-loader">
                    <div className="ring"></div>
                    <div className="ring"></div>
                </div>
            </div>
        );
    }

    const currentWeek = user?.current_week || 1;

    const radarData = {
        labels: stats?.stats?.radarLabels || ['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık'],
        datasets: [{
            label: 'Gelişim',
            data: stats?.stats?.radarData || [50, 50, 50, 50, 50],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointBackgroundColor: '#fff'
        }]
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255,255,255,0.1)' },
                grid: { color: 'rgba(255,255,255,0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 11 } },
                ticks: { display: false },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Merhaba, {user?.username}! 👋</h1>
                        <p className="text-slate-400">Hafta {currentWeek} • {user?.experiment_group === 'experiment' ? 'Deney Grubu' : 'Kontrol Grubu'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
                            <span className="text-2xl font-bold text-gradient">{stats?.stats?.totalPoints || 0}</span>
                            <span className="text-slate-400 text-sm ml-2">XP</span>
                        </div>
                        <div className="px-4 py-2 bg-slate-800 rounded-xl">
                            <span className="text-lg font-bold text-white">Lv. {user?.level || 1}</span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Progress */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Weekly Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                        >
                            <h3 className="text-xl font-bold text-white mb-6">6 Haftalık Program</h3>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                {WEEKS_DATA.map((week) => {
                                    const isLocked = week.week > currentWeek;
                                    const isCurrent = week.week === currentWeek;
                                    const isCompleted = week.week < currentWeek;

                                    return (
                                        <motion.div
                                            key={week.week}
                                            whileHover={!isLocked ? { scale: 1.05 } : {}}
                                            className={`relative p-4 rounded-2xl text-center transition-all ${isLocked
                                                    ? 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                                                    : isCurrent
                                                        ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/50 cursor-pointer'
                                                        : 'bg-slate-800/50 hover:bg-slate-800 cursor-pointer'
                                                }`}
                                            onClick={() => !isLocked && router.push(`/modul?week=${week.week}`)}
                                        >
                                            {isLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-2xl">🔒</span>
                                                </div>
                                            )}
                                            {isCompleted && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">✓</div>
                                            )}
                                            <div className={`text-3xl mb-2 ${isLocked ? 'opacity-30' : ''}`}>{week.icon}</div>
                                            <p className={`text-xs font-bold ${isLocked ? 'text-slate-600' : 'text-slate-300'}`}>Hafta {week.week}</p>
                                            <p className={`text-xs ${isLocked ? 'text-slate-700' : 'text-slate-500'}`}>{week.title}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { href: `/modul?week=${currentWeek}`, icon: '📚', label: 'Modül', color: 'from-blue-500 to-cyan-500' },
                                { href: '/simulasyon', icon: '🎮', label: 'Simülasyon', color: 'from-purple-500 to-pink-500' },
                                { href: '/gunluk', icon: '📝', label: 'Günlük', color: 'from-emerald-500 to-green-500' },
                                { href: '/testler', icon: '📋', label: 'Testler', color: 'from-orange-500 to-amber-500' }
                            ].map((action, idx) => (
                                <Link
                                    key={idx}
                                    href={action.href}
                                    className="card-interactive text-center py-6"
                                >
                                    <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3`}>
                                        {action.icon}
                                    </div>
                                    <p className="text-sm font-medium text-white">{action.label}</p>
                                </Link>
                            ))}
                        </div>

                        {/* Recent Activities */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Son Aktiviteler</h3>
                            <div className="space-y-3">
                                {stats?.recentActivities?.length > 0 ? (
                                    stats.recentActivities.slice(0, 5).map((act: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <p className="text-sm text-slate-300 flex-1">{act.action}</p>
                                            <span className="text-xs text-slate-500">
                                                {new Date(act.timestamp).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm text-center py-4">Henüz aktivite yok. Modüllerle başla!</p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Stats */}
                    <div className="space-y-6">
                        {/* Radar Chart */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="card"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 text-center">Gelişim Haritası</h3>
                            <div className="h-64">
                                <Radar data={radarData} options={radarOptions} />
                            </div>
                        </motion.div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card text-center">
                                <div className="text-3xl font-black text-gradient">{stats?.stats?.gamesPlayed || 0}</div>
                                <p className="text-xs text-slate-400 uppercase">Oyun</p>
                            </div>
                            <div className="card text-center">
                                <div className="text-3xl font-black text-gradient">{stats?.stats?.testsCompleted || 0}</div>
                                <p className="text-xs text-slate-400 uppercase">Test</p>
                            </div>
                        </div>

                        {/* AI Insight */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🧠</span>
                                <h4 className="font-bold text-white">AI İçgörü</h4>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {stats?.stats?.totalPoints > 100
                                    ? "Harika gidiyorsun! Düzenli katılımın gelişimini hızlandırıyor."
                                    : "Henüz başlangıç aşamasındasın. Modülleri tamamlayarak puanlarını artır!"}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
