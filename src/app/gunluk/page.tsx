
'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';

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
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
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

    const analyzeEntry = async () => {
        if (!entry.trim() || entry.length < 20) {
            setError('Lütfen analiz için en az 20 karakterlik bir şeyler yazın.');
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
                body: JSON.stringify({ content: entry })
            });

            if (!res.ok) throw new Error('Analiz başarısız oldu.');

            const data = await res.json();
            setAnalysis(data);
            setEntry(''); // Clear entry or keep it? Maybe keep it or show success.
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Duygu Günlüğü
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Bugün nasıl hissediyorsun? İkizinle veya kendinle ilgili neler yaşadın?
                        Yapay zeka asistanın senin için analiz etsin.
                    </p>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    {/* Input Area */}
                    <div className="mb-6">
                        <textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder="Sevgili günlük, bugün..."
                            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className={`text-xs ${entry.length < 20 ? 'text-red-400' : 'text-slate-500'}`}>
                                {entry.length} karakter (Min: 20)
                            </span>
                            {error && <span className="text-xs text-red-400 font-bold">{error}</span>}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={analyzeEntry}
                            disabled={analyzing}
                            className={`
                                px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all
                                ${analyzing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-500 hover:scale-105 shadow-lg shadow-purple-500/20'}
                            `}
                        >
                            {analyzing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
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

                {/* Analysis Result */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                        >
                            <Confetti numberOfPieces={100} recycle={false} run={true} />

                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-400 to-blue-500" />

                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="text-3xl">✨</span> Analiz Raporu
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Duygu Durumu</h3>
                                        <p className="text-xl font-medium text-white">
                                            {analysis.sentiment || 'Nötr'}
                                        </p>
                                    </div>

                                    {/* Themes */}
                                    {analysis.themes && (
                                        <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Tespit Edilen Temalar</h3>
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

                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 h-full">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Yapay Zeka Yorumu</h3>
                                        <p className="text-slate-300 leading-relaxed italic">
                                            "{analysis.feedback}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 text-center">
                                <p className="text-green-400 font-bold text-sm">
                                    ✓ Günlüğüne başarıyla kaydedildi.
                                </p>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
