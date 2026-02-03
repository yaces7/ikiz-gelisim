
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import api from '../lib/api';

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
    1: ['Bugün kendimi nasıl tanımlarsın?', 'İkizimden farklı olduğum bir özellik nedir?', 'Bugün kendi başıma bir karar verdim mi?'],
    2: ['Bugün birine "hayır" dediğim bir durum oldu mu?', 'Kendi sınırlarımı koruyabildim mi?', 'Birisi benim alanıma girdiğinde ne hissettim?'],
    3: ['Bugün aldığım en önemli karar neydi?', 'Bu kararı alırken kimin etkisinde kaldım?', 'Kendi başıma karar vermek nasıl hissettirdi?'],
    4: ['Bugün hangi duyguları hissettim?', 'İkizimin duygularını kendi duygularımdan ayırabildiğim bir an oldu mu?', 'Empati ve sınır arasında nasıl denge kurdum?'],
    5: ['Bugün sosyal ortamda nasıl hissettim?', 'İkizimden bağımsız bir arkadaşlık ilişkim var mı?', 'Topluluk içinde kendimi nasıl ifade ettim?'],
    6: ['Bu hafta en çok ne öğrendim?', 'Gelecekte nasıl bir birey olmak istiyorum?', 'İkizimle ilişkim nasıl değişti?']
};


interface PastEntry {
    _id: string;
    date: string;
    mood: string;
    moodLabel?: string;
    preview: string;
    summary?: string;
    sentiment: string;
    sentimentScore?: number;
    themes: string[];
    insights?: string[];
    meRatio?: number;
    week?: number;
    analyzedBy?: string;
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

    const [entry, setEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    // Geçmiş
    const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<PastEntry | null>(null);

    const currentWeek = user?.current_week || 1;
    const questions = GUIDED_QUESTIONS[currentWeek] || GUIDED_QUESTIONS[1];

    useEffect(() => {
        if (questions.length > 0 && !selectedQuestion) {
            setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)]);
        }
    }, [questions]);

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await api.get('/api/journal/history');
            setPastEntries(data.entries || []);
        } catch (e) {
            console.error('History fetch error:', e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const analyzeEntry = async () => {
        if (!entry.trim() || entry.length < 20) {
            setError('Lütfen en az 20 karakter yazın.');
            return;
        }
        if (!selectedMood) {
            setError('Lütfen bir duygu seçin.');
            return;
        }

        setAnalyzing(true);
        setError('');
        setAnalysis(null);

        try {
            const data = await api.post('/api/journal/analyze', {
                content: entry,
                mood: selectedMood.label,
                moodIcon: selectedMood.icon,
                guidedQuestion: selectedQuestion,
                week: currentWeek
            });

            setAnalysis(data);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            fetchHistory(); // Refresh history
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
                    <p className="text-slate-400">Giriş yaparak günlük tutmaya başla.</p>
                    <button onClick={() => router.push('/giris')} className="px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-20 px-4">
            {showConfetti && <Confetti numberOfPieces={150} recycle={false} />}

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Duygu Günlüğü
                    </h1>
                    <p className="text-lg text-slate-400 mt-2">Hafta {currentWeek} • Duygularını keşfet, kendini tanı</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* SOL - YAZMA ALANI */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {!analysis ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Mood Selector */}
                                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Bugün Nasıl Hissediyorsun?</h3>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {MOOD_OPTIONS.map((mood) => (
                                                <button
                                                    key={mood.label}
                                                    onClick={() => setSelectedMood(mood)}
                                                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${selectedMood?.label === mood.label
                                                        ? `bg-gradient-to-br ${mood.color} text-white scale-105 shadow-lg`
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{mood.icon}</span>
                                                    <span className="text-[10px] font-medium">{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Writing Area */}
                                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                                        {/* Guided Question */}
                                        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-purple-400 uppercase">💡 Yönlendirici Soru</span>
                                                <button onClick={() => setSelectedQuestion(questions[Math.floor(Math.random() * questions.length)])} className="text-xs text-purple-400 hover:text-purple-300">
                                                    🔄 Değiştir
                                                </button>
                                            </div>
                                            <p className="text-white text-sm">{selectedQuestion}</p>
                                        </div>

                                        <textarea
                                            value={entry}
                                            onChange={(e) => setEntry(e.target.value)}
                                            placeholder="Sevgili günlük, bugün..."
                                            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 resize-none"
                                        />

                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-xs ${entry.length < 20 ? 'text-red-400' : 'text-slate-500'}`}>
                                                {entry.length} / 20+ karakter
                                            </span>
                                            {error && <span className="text-xs text-red-400">{error}</span>}
                                        </div>

                                        <button
                                            onClick={analyzeEntry}
                                            disabled={analyzing || entry.length < 20 || !selectedMood}
                                            className={`w-full mt-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${analyzing || entry.length < 20 || !selectedMood
                                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 shadow-lg'
                                                }`}
                                        >
                                            {analyzing ? (
                                                <><span className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span> Analiz Ediliyor...</>
                                            ) : (
                                                <><span>🧠</span> Analiz Et ve Kaydet</>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                // ANALYSIS RESULT
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-blue-500" />

                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <span>✨</span> Analiz Raporu
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Duygu</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{selectedMood?.icon}</span>
                                                <div>
                                                    <p className="text-lg font-bold text-white">{analysis.sentiment}</p>
                                                    <p className="text-xs text-slate-400">Skor: {analysis.sentimentScore}/100</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ben / Biz Oranı</h4>
                                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${(analysis.me_ratio || 0) * 100}%` }} />
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {Math.round((analysis.me_ratio || 0) * 100)}% bireysel odak
                                            </p>
                                        </div>

                                        <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Temalar</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {(analysis.themes || []).map((t: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">{t}</span>
                                                ))}
                                            </div>
                                        </div>


                                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4 rounded-xl">
                                            <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">🧠 AI Yorumu</h4>
                                            <p className="text-slate-300 text-sm italic">"{analysis.feedback}"</p>
                                        </div>

                                        {/* AI Özet */}
                                        {analysis.summary && (
                                            <div className="md:col-span-2 bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">📝 Özet</h4>
                                                <p className="text-slate-300 text-sm">{analysis.summary}</p>
                                            </div>
                                        )}

                                        {/* İçgörüler */}
                                        {analysis.insights && analysis.insights.length > 0 && (
                                            <div className="md:col-span-2 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                                                <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">💡 İçgörüler</h4>
                                                <ul className="space-y-1">
                                                    {analysis.insights.map((insight: string, i: number) => (
                                                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                                            <span className="text-blue-400">•</span> {insight}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <p className="text-green-400 text-sm font-bold">✓ Kaydedildi (+10 XP)</p>
                                            {analysis.analyzedBy && (
                                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                                                    {analysis.analyzedBy === 'AI' ? '🤖 AI Analizi' : '📊 Sistem Analizi'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={resetForm} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-700">
                                                Yeni Yazı
                                            </button>
                                            <button onClick={() => router.push('/profil')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-500">
                                                Haftalık Özet
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SAĞ - GEÇMİŞ GÜNLÜKLER */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>📚</span> Geçmiş Günlükler
                                </h3>
                                <span className="text-xs text-slate-500">{pastEntries.length} yazı</span>
                            </div>

                            {loadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : pastEntries.length > 0 ? (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                                    {pastEntries.map((entry) => (
                                        <motion.div
                                            key={entry._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => setSelectedEntry(entry)}
                                            className="p-3 bg-slate-800/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-purple-500/30 transition-all group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl flex-shrink-0">{entry.mood}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(entry.date).toLocaleDateString('tr-TR', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${entry.sentiment === 'Pozitif' ? 'bg-green-500/20 text-green-400' :
                                                            entry.sentiment === 'Negatif' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-slate-700 text-slate-400'
                                                            }`}>
                                                            {entry.sentiment}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                                                        {entry.preview}
                                                    </p>
                                                    {entry.themes && entry.themes.length > 0 && (
                                                        <div className="flex gap-1 mt-2 flex-wrap">
                                                            {entry.themes.slice(0, 2).map((t, i) => (
                                                                <span key={i} className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2">📝</div>
                                    <p className="text-slate-500 text-sm">Henüz günlük yazısı yok.</p>
                                    <p className="text-slate-600 text-xs mt-1">İlk günlüğünü yaz!</p>
                                </div>
                            )}

                            {/* Quick Stats */}
                            {pastEntries.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-purple-400">{pastEntries.length}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Toplam</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-green-400">
                                            {pastEntries.filter(e => e.sentiment === 'Pozitif').length}
                                        </div>
                                        <div className="text-[9px] text-slate-500 uppercase">Pozitif</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-blue-400">
                                            {[...new Set(pastEntries.flatMap(e => e.themes || []))].length}
                                        </div>
                                        <div className="text-[9px] text-slate-500 uppercase">Tema</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entry Detail Modal */}
            <AnimatePresence>
                {selectedEntry && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedEntry(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative"
                        >
                            <button
                                onClick={() => setSelectedEntry(null)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl">{selectedEntry.mood}</span>
                                <div>
                                    <p className="text-white font-bold">
                                        {new Date(selectedEntry.date).toLocaleDateString('tr-TR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <p className={`text-sm ${selectedEntry.sentiment === 'Pozitif' ? 'text-green-400' :
                                        selectedEntry.sentiment === 'Negatif' ? 'text-red-400' :
                                            'text-slate-400'
                                        }`}>
                                        {selectedEntry.sentiment}
                                    </p>
                                </div>
                            </div>

                            <p className="text-slate-300 leading-relaxed mb-4">
                                {selectedEntry.preview}
                            </p>

                            {selectedEntry.themes && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedEntry.themes.map((t, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
