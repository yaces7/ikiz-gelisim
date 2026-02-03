
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<any>(null);
    const [journalInsights, setJournalInsights] = useState<any>(null);
    const [wheelTasks, setWheelTasks] = useState<any[]>([]);
    const [character, setCharacter] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'tasks' | 'character'>('overview');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // Profil verileri
            const json = await api.get('/api/profile/stats');
            setProfileData(json);
            setWheelTasks(json.wheelTasks || []);
            setCharacter(json.character || null);

            // Günlük içgörüleri
            const insightsData = await api.get('/api/journal/insights');
            setJournalInsights(insightsData);
        } catch (e: any) {
            console.error(e);
            setErrorMsg('Veri alınamadı');
        } finally {
            setLoading(false);
        }
    };

    const completeTask = async (taskIndex: number) => {
        const token = localStorage.getItem('token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
        try {
            await fetch(`${API_URL}/api/profile/complete-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ taskIndex })
            });

            // Lokal güncelle
            setWheelTasks(prev => prev.map((t, i) =>
                i === taskIndex ? { ...t, completed: true, completedAt: new Date() } : t
            ));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-white font-bold">Profil Yükleniyor...</div>
            </div>
        );
    }

    if (errorMsg || !profileData) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 text-center">
                <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md">
                    <div className="text-5xl mb-4">👤</div>
                    <h2 className="text-2xl font-bold mb-4">Profil</h2>
                    <p className="text-slate-400 mb-6">{errorMsg || 'Giriş yapmalısınız.'}</p>
                    <button
                        onClick={() => router.push('/giris')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition"
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    const { user: levelInfo, stats, recentActivities } = profileData;

    const radarChartData = {
        labels: stats.radarLabels || ['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık'],
        datasets: [{
            label: 'Gelişim',
            data: stats.radarData || [50, 50, 50, 50, 50],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
            pointBackgroundColor: '#fff',
        }],
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 11 } },
                ticks: { display: false },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
        plugins: { legend: { display: false } },
        maintainAspectRatio: false,
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-20 px-4">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-8">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl">
                                    {character?.appearance?.emoji || '👤'}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-xs font-black text-white">
                                {levelInfo.level}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-white mb-1">
                                {character?.name || user?.username || 'İkiz Kullanıcı'}
                            </h1>
                            <p className="text-indigo-400 font-medium mb-4">{levelInfo.title}</p>

                            {/* XP Progress */}
                            <div className="w-full max-w-md">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Seviye {levelInfo.level}</span>
                                    <span>{stats.totalPoints} XP</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelInfo.nextLevelProgress}%` }}
                                        transition={{ duration: 1 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Puan', value: stats.totalPoints, icon: '⭐' },
                                { label: 'Oyun', value: stats.gamesPlayed, icon: '🎮' },
                                { label: 'Test', value: stats.testsCompleted, icon: '📋' }
                            ].map((stat, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 text-center">
                                    <div className="text-lg mb-1">{stat.icon}</div>
                                    <div className="text-xl font-black text-white">{stat.value}</div>
                                    <div className="text-[10px] text-slate-500 uppercase">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 p-1">
                    {[
                        { id: 'overview', label: 'Genel', icon: '📊' },
                        { id: 'journal', label: 'Günlük', icon: '📝' },
                        { id: 'tasks', label: 'Görevler', icon: '🎯' },
                        { id: 'character', label: 'Karakter', icon: '🦸' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-initial min-w-[120px] px-4 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Radar Chart */}
                            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 text-center">Gelişim Haritası</h3>
                                <div className="h-[300px]">
                                    <Radar data={radarChartData} options={radarOptions as any} />
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Son Aktiviteler</h3>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                    {recentActivities?.length > 0 ? (
                                        recentActivities.map((act: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                <p className="text-xs text-slate-300 flex-1 line-clamp-1">{act.action}</p>
                                                <span className="text-[10px] text-slate-500">
                                                    {new Date(act.timestamp).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm text-center py-8">Henüz aktivite yok.</p>
                                    )}
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Rozetler</h3>
                                <div className="flex gap-4 flex-wrap">
                                    {stats.totalPoints >= 50 && (
                                        <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 text-2xl flex items-center justify-center" title="Başlangıç">🚀</div>
                                    )}
                                    {stats.gamesPlayed >= 3 && (
                                        <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 text-2xl flex items-center justify-center" title="Oyun Ustası">🎮</div>
                                    )}
                                    {stats.testsCompleted >= 1 && (
                                        <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 text-2xl flex items-center justify-center" title="Test Tamamlayıcı">📋</div>
                                    )}
                                    {journalInsights?.totalEntries >= 3 && (
                                        <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-500 text-2xl flex items-center justify-center" title="Günlük Yazarı">✍️</div>
                                    )}
                                    {(stats.radarData?.[0] || 50) >= 70 && (
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 text-2xl flex items-center justify-center" title="Özgür Ruh">🌿</div>
                                    )}
                                    {stats.totalPoints < 50 && <p className="text-slate-500 text-sm">Rozet kazanmak için aktivitelere katıl.</p>}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* JOURNAL TAB */}
                    {activeTab === 'journal' && (
                        <motion.div
                            key="journal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>📝</span> Bu Hafta Günlük Özeti
                            </h3>

                            {journalInsights && journalInsights.totalEntries > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Mood Distribution */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-slate-400 mb-4">Duygu Dağılımı</h4>
                                        <div className="space-y-2">
                                            {Object.entries(journalInsights.moodDistribution || {}).map(([mood, count]: [string, any]) => (
                                                <div key={mood} className="flex items-center gap-2">
                                                    <span className="text-xl w-8">{mood}</span>
                                                    <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                            style={{ width: `${(count / journalInsights.totalEntries) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-slate-400 text-sm w-6">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                            <div className="text-3xl font-black text-purple-400">{journalInsights.totalEntries}</div>
                                            <div className="text-xs text-slate-500">Yazı</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                            <div className="text-3xl font-black text-blue-400">{journalInsights.avgMeRatio || 50}%</div>
                                            <div className="text-xs text-slate-500">Ben Oranı</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                                            <div className="text-3xl font-black text-green-400">{journalInsights.avgSentiment || 50}</div>
                                            <div className="text-xs text-slate-500">Duygu Skoru</div>
                                        </div>
                                    </div>

                                    {/* Themes */}
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-slate-400 mb-3">En Çok Konuşulan Temalar</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(journalInsights.topThemes || []).map((theme: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-bold">
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Summary */}
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                                        <h4 className="text-sm font-bold text-purple-400 mb-2">🧠 AI Özeti</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {journalInsights.summary}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">📝</div>
                                    <p className="text-slate-400 mb-4">Henüz yeterli günlük verisi yok.</p>
                                    <button
                                        onClick={() => router.push('/gunluk')}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500"
                                    >
                                        Günlük Yaz
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <motion.div
                            key="tasks"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>🎯</span> Çarkıfelek Görevleri
                            </h3>

                            {wheelTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {wheelTasks.map((task, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${task.completed
                                                ? 'bg-green-500/10 border-green-500/30'
                                                : 'bg-slate-800/50 border-white/5 hover:border-indigo-500/30'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${task.completed ? 'bg-green-500' : 'bg-slate-700'
                                                }`}>
                                                {task.completed ? '✓' : '🎯'}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${task.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                                                    {task.task}
                                                </p>
                                                {task.completedAt && (
                                                    <p className="text-xs text-slate-500">
                                                        Tamamlandı: {new Date(task.completedAt).toLocaleDateString('tr-TR')}
                                                    </p>
                                                )}
                                            </div>
                                            {!task.completed && (
                                                <button
                                                    onClick={() => completeTask(idx)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500"
                                                >
                                                    Tamamla
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">🎡</div>
                                    <p className="text-slate-400 mb-4">Henüz çarkıfelek görevi yok.</p>
                                    <button
                                        onClick={() => router.push('/carkifelek')}
                                        className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500"
                                    >
                                        Çarkı Çevir
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* CHARACTER TAB */}
                    {activeTab === 'character' && (
                        <motion.div
                            key="character"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span>🦸</span> Karakterim
                            </h3>

                            {character ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/30">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-6xl mb-4 shadow-2xl">
                                            {character.appearance?.emoji || '👤'}
                                        </div>
                                        <h4 className="text-2xl font-black text-white">{character.name}</h4>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4">
                                        {character.values?.length > 0 && (
                                            <div className="bg-slate-800/50 rounded-xl p-4">
                                                <h4 className="text-sm font-bold text-slate-400 mb-2">Değerlerim</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.values.map((v: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {character.goals?.length > 0 && (
                                            <div className="bg-slate-800/50 rounded-xl p-4">
                                                <h4 className="text-sm font-bold text-slate-400 mb-2">Hedeflerim</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {character.goals.map((g: string, i: number) => (
                                                        <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-4">🦸</div>
                                    <p className="text-slate-400 mb-4">Henüz karakter oluşturmadın.</p>
                                    <button
                                        onClick={() => router.push('/karakter-oyunu')}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500"
                                    >
                                        Karakter Oluştur
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
