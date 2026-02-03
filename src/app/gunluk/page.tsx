
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

// Duygu ikonları
const MOOD_OPTIONS = [
    { icon: '😊', label: 'Mutlu', color: 'from-green-500 to-emerald-500' },
    { icon: '😌', label: 'Sakin', color: 'from-blue-500 to-cyan-500' },
    { icon: '😐', label: 'Nötr', color: 'from-slate-500 to-slate-600' },
    { icon: '😔', label: 'Üzgün', color: 'from-indigo-500 to-purple-500' },
    { icon: '😤', label: 'Sinirli', color: 'from-red-500 to-orange-500' },
    { icon: '😰', label: 'Kaygılı', color: 'from-yellow-500 to-amber-500' },
];

// Yönlendirici sorular (haftaya göre)
const GUIDED_QUESTIONS: Record<number, string[]> = {
    1: [
        'Bugün kendimi nasıl tanımlarsın?',
        'İkizimden farklı olduğum bir özellik nedir?',
        'Bugün kendi başıma bir karar verdim mi?'
    ],
    2: [
        'Bugün birine "hayır" dediğim bir durum oldu mu?',
        'Kendi sınırlarımı koruyabildim mi?',
        'Birisi benim alanıma girdiğinde ne hissettim?'
    ],
    3: [
        'Bugün aldığım en önemli karar neydi?',
        'Bu kararı alırken kimin etkisinde kaldım?',
        'Kendi başıma karar vermek nasıl hissettirdi?'
    ],
    4: [
        'Bugün hangi duyguları hissettim?',
        'İkizimin duygularını kendi duygularımdan ayırabildiğim bir an oldu mu?',
        'Empati ve sınır arasında nasıl denge kurdum?'
    ],
    5: [
        'Bugün sosyal ortamda nasıl hissettim?',
        'İkizimden bağımsız bir arkadaşlık ilişkim var mı?',
        'Topluluk içinde kendimi nasıl ifade ettim?'
    ],
    6: [
        'Bu hafta en çok ne öğrendim?',
        'Gelecekte nasıl bir birey olmak istiyorum?',
        'İkizimle ilişkim nasıl değişti?'
    ]
};

// Geçmiş günlükler için tip
interface PastEntry {
    _id: string;
    date: string;
    mood: string;
    preview: string;
    sentiment: string;
    themes: string[];
}

export default function JournalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
            <JournalContent />
        </Suspense>
    );
}

function JournalContent() {
    const { user } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'write' | 'history' | 'insights'>('write');
    const [entry, setEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // Geçmiş ve içgörüler
    const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);
    const [weeklyInsights, setWeeklyInsights] = useState<any>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const currentWeek = user?.current_week || 1;
    const questions = GUIDED_QUESTIONS[currentWeek] || GUIDED_QUESTIONS[1];

    useEffect(() => {
        if (questions.length > 0 && !selectedQuestion) {
            setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)]);
        }
    }, [questions]);

    useEffect(() => {
        if (user && activeTab === 'history') {
            fetchHistory();
        }
        if (user && activeTab === 'insights') {
            fetchInsights();
        }
    }, [user, activeTab]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/journal/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPastEntries(data.entries || []);
            }
        } catch (e) {
            console.error('History fetch error:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchInsights = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/journal/insights', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWeeklyInsights(data);
            }
        } catch (e) {
            console.error('Insights fetch error:', e);
        }
    };

    const analyzeEntry = async () => {
        if (!entry.trim() || entry.length < 20) {
            setError('Lütfen analiz için en az 20 karakterlik bir şeyler yazın.');
            return;
        }
        if (!selectedMood) {
            setError('Lütfen bir duygu durumu seçin.');
            return;
        }

        setAnalyzing(true);
        setError('');
        setAnalysis(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/journal/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: entry,
                    mood: selectedMood.label,
                    moodIcon: selectedMood.icon,
                    guidedQuestion: selectedQuestion,
                    week: currentWeek
                })
            });

            if (!res.ok) throw new Error('Analiz başarısız oldu.');

            const data = await res.json();
            setAnalysis(data);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setAnalyzing(false);
        }
    };

    const resetForm = () => {
        setEntry('');
        setSelectedMood(null);
        setAnalysis(null);
        setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)]);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold text-white">Günlük Kilitli</h2>
                    <p className="text-slate-400">
                        Duygu analizi ve gelişim takibi yapabilmek için giriş yapmalısınız.
                    </p>
                    <button
                        onClick={() => router.push('/giris')}
                        className="px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition"
                    >
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4">
            {showConfetti && <Confetti numberOfPieces={150} recycle={false} />}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Duygu Günlüğü
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Hafta {currentWeek} • Duygularını keşfet, kendini tanı
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2">
                    {[
                        { id: 'write', label: 'Yaz', icon: '✏️' },
                        { id: 'history', label: 'Geçmiş', icon: '📚' },
                        { id: 'insights', label: 'İçgörüler', icon: '📊' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* WRITE TAB */}
                    {activeTab === 'write' && (
                        <motion.div
                            key="write"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {!analysis ? (
                                <>
                                    {/* Mood Selector */}
                                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Bugün Nasıl Hissediyorsun?</h3>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {MOOD_OPTIONS.map((mood) => (
                                                <button
                                                    key={mood.label}
                                                    onClick={() => setSelectedMood(mood)}
                                                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${selectedMood?.label === mood.label
                                                            ? `bg-gradient-to-br ${mood.color} text-white scale-105 shadow-lg`
                                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <span className="text-3xl">{mood.icon}</span>
                                                    <span className="text-xs font-medium">{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Writing Area */}
                                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                                        {/* Guided Question */}
                                        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">💡 Yönlendirici Soru</span>
                                                <button
                                                    onClick={() => setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)])}
                                                    className="text-xs text-purple-400 hover:text-purple-300"
                                                >
                                                    🔄 Değiştir
                                                </button>
                                            </div>
                                            <p className="text-white font-medium">{selectedQuestion}</p>
                                        </div>

                                        <textarea
                                            value={entry}
                                            onChange={(e) => setEntry(e.target.value)}
                                            placeholder="Sevgili günlük, bugün..."
                                            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                                        />

                                        <div className="flex justify-between items-center mt-3">
                                            <span className={`text-xs ${entry.length < 20 ? 'text-red-400' : 'text-slate-500'}`}>
                                                {entry.length} karakter (Min: 20)
                                            </span>
                                            {error && <span className="text-xs text-red-400 font-bold">{error}</span>}
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={analyzeEntry}
                                                disabled={analyzing || entry.length < 20 || !selectedMood}
                                                className={`
                                                    px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all
                                                    ${analyzing || entry.length < 20 || !selectedMood
                                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/30'
                                                    }
                                                `}
                                            >
                                                {analyzing ? (
                                                    <>
                                                        <span className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
                                                        Analiz Ediliyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>🧠</span> Analiz Et ve Kaydet
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // ANALYSIS RESULT
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-blue-500" />

                                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                        <span className="text-3xl">✨</span> Analiz Raporu
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Sol */}
                                        <div className="space-y-4">
                                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Duygu Durumu</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-4xl">{selectedMood?.icon}</span>
                                                    <div>
                                                        <p className="text-xl font-medium text-white">{analysis.sentiment}</p>
                                                        <p className="text-sm text-slate-400">Skor: {analysis.sentimentScore}/100</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ben/Biz Oranı */}
                                            <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Ben / Biz Oranı</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-blue-400">Ben</span>
                                                        <span className="text-blue-400 font-bold">{Math.round((analysis.me_ratio || 0) * 100)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                                            style={{ width: `${(analysis.me_ratio || 0) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {(analysis.me_ratio || 0) > 0.6
                                                            ? '👍 Bireysel odak yüksek - harika!'
                                                            : (analysis.me_ratio || 0) < 0.3
                                                                ? '💭 İkiz odağı yüksek'
                                                                : '⚖️ Dengeli bir bakış açısı'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Temalar */}
                                            {analysis.themes && (
                                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Temalar</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {analysis.themes.map((t: string, i: number) => (
                                                            <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-bold">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sağ */}
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 rounded-xl h-full">
                                                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">🧠 AI Yorumu</h3>
                                                <p className="text-slate-300 leading-relaxed italic">
                                                    "{analysis.feedback}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <p className="text-green-400 font-bold text-sm flex items-center gap-2">
                                            <span>✓</span> Günlüğüne başarıyla kaydedildi (+10 XP)
                                        </p>
                                        <div className="flex gap-3">
                                            <button onClick={resetForm} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700">
                                                Yeni Yazı
                                            </button>
                                            <button onClick={() => setActiveTab('insights')} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500">
                                                İçgörüleri Gör
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span>📚</span> Geçmiş Günlükler
                                </h3>

                                {loadingHistory ? (
                                    <div className="flex justify-center py-12">
                                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : pastEntries.length > 0 ? (
                                    <div className="space-y-3">
                                        {pastEntries.map((entry) => (
                                            <div key={entry._id} className="bg-slate-950/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{entry.mood}</span>
                                                        <span className="text-sm text-slate-400">
                                                            {new Date(entry.date).toLocaleDateString('tr-TR', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-lg ${entry.sentiment === 'Pozitif 😊' ? 'bg-green-500/20 text-green-400' :
                                                            entry.sentiment === 'Negatif 😔' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-slate-700 text-slate-400'
                                                        }`}>
                                                        {entry.sentiment}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 text-sm line-clamp-2">{entry.preview}</p>
                                                {entry.themes && (
                                                    <div className="flex gap-1 mt-2">
                                                        {entry.themes.map((t, i) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <div className="text-4xl mb-2">📝</div>
                                        <p>Henüz günlük yazmamışsın.</p>
                                        <button onClick={() => setActiveTab('write')} className="mt-4 text-purple-400 hover:text-purple-300">
                                            İlk günlüğünü yaz →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* INSIGHTS TAB */}
                    {activeTab === 'insights' && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span>📊</span> Hafta {currentWeek} Özeti
                                </h3>

                                {weeklyInsights ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Duygu Dağılımı */}
                                        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-slate-400 mb-4">Duygu Dağılımı</h4>
                                            <div className="space-y-2">
                                                {Object.entries(weeklyInsights.moodDistribution || {}).map(([mood, count]: [string, any]) => (
                                                    <div key={mood} className="flex items-center gap-2">
                                                        <span className="text-xl">{mood}</span>
                                                        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                                style={{ width: `${(count / (weeklyInsights.totalEntries || 1)) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-400 text-sm">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ana Temalar */}
                                        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-slate-400 mb-4">En Çok Konuşulan Temalar</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(weeklyInsights.topThemes || []).map((theme: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-bold">
                                                        {theme}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Haftalık Özet */}
                                        <div className="md:col-span-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                                            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3">🧠 Haftalık AI Özeti</h4>
                                            <p className="text-slate-300 leading-relaxed">
                                                {weeklyInsights.summary || 'Bu hafta için yeterli veri yok. Daha fazla günlük yazarak haftalık özetini oluşturabilirsin!'}
                                            </p>
                                        </div>

                                        {/* İstatistikler */}
                                        <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 text-center">
                                                <div className="text-3xl font-black text-purple-400">{weeklyInsights.totalEntries || 0}</div>
                                                <div className="text-xs text-slate-500">Toplam Yazı</div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 text-center">
                                                <div className="text-3xl font-black text-blue-400">{weeklyInsights.avgMeRatio || 50}%</div>
                                                <div className="text-xs text-slate-500">Ortalama Ben Oranı</div>
                                            </div>
                                            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 text-center">
                                                <div className="text-3xl font-black text-green-400">{weeklyInsights.avgSentiment || 50}</div>
                                                <div className="text-xs text-slate-500">Ortalama Duygu Skoru</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p>Henüz yeterli veri yok.</p>
                                        <p className="text-sm">En az 3 günlük yazısı gerekli.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
