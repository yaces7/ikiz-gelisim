
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { io } from 'socket.io-client';
import { encryptData } from '../lib/security';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { scenarios } from '../data/scenarios';
import api from '../lib/api';

let socket: any;

export default function ChoiceEngine() {
    const { user } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [independenceScore, setIndependenceScore] = useState(50);
    const [lastChoice, setLastChoice] = useState<any>(null);
    const [focusMode, setFocusMode] = useState(false);
    const [leveledUp, setLeveledUp] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [textIndex, setTextIndex] = useState(0);

    const activeScenario = scenarios[currentIndex];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ikiz-gelisim.onrender.com';
        socket = io(BACKEND_URL, {
            path: "/socket.io/",
            reconnectionAttempts: 5,
            transports: ['websocket', 'polling']
        });
        return () => { if (socket) socket.disconnect(); }
    }, []);

    // Typewriter Effect
    useEffect(() => {
        if (!showResult && !completed && activeScenario && textIndex < activeScenario.description.length) {
            const timeout = setTimeout(() => {
                setTextIndex(prev => prev + 1);
            }, 20); // Faster typing
            return () => clearTimeout(timeout);
        }
    }, [textIndex, showResult, activeScenario, completed]);

    const handleChoice = async (option: any) => {
        if (!user) return;

        setFocusMode(true);

        // Save to Database (Simulation Interaction)
        try {
            await api.post('/api/game/save', {
                scenarioId: activeScenario.id,
                choiceWeight: option.weight,
                autonomy: option.autonomy,
                dependency: option.dependency
            });
        } catch (err) {
            console.error('Save failed', err);
        } setTimeout(() => {
            setLastChoice(option);
            const newScore = Math.min(100, Math.max(0, independenceScore + option.independenceEffect));
            setIndependenceScore(newScore);

            if (newScore > 60 && independenceScore <= 60) setLeveledUp(true);

            setShowResult(true);
            setFocusMode(false);
            setTextIndex(0);
        }, 800);
    };

    const nextScenario = () => {
        setShowResult(false);
        setLastChoice(null);
        setLeveledUp(false);
        setTextIndex(0);

        if (currentIndex < scenarios.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    if (!user) {
        return (
            <div className="relative w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl h-[400px] flex items-center justify-center bg-slate-900 border border-white/10">
                <div className="text-center p-8 space-y-4">
                    <div className="inline-block p-4 bg-yellow-500/10 rounded-full mb-2">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Giriş Yapmalısınız</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">
                        Simülasyonları kullanmak ve ilerlemenizi kaydetmek için lütfen giriş yapın.
                    </p>
                    <Link href="/giris" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="relative w-full max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-emerald-500/30 p-12 text-center animate-in zoom-in duration-500">
                <ReactConfetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />
                <h2 className="text-4xl font-black text-white mb-4">Tebrikler! 🎉</h2>
                <p className="text-xl text-slate-300 mb-8">Tüm simülasyon senaryolarını tamamladın.</p>
                <div className="text-6xl font-black text-blue-400 mb-4">{independenceScore}</div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">BİREYSELLEŞME SKORU</p>
                <button
                    onClick={() => { setCurrentIndex(0); setCompleted(false); setIndependenceScore(50); }}
                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                    Tekrar Oyna
                </button>
            </div>
        );
    }

    return (
        <>
            {leveledUp && <ReactConfetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />}

            <AnimatePresence>
                {focusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className={`relative w-full max-w-3xl mx-auto rounded-3xl overflow-hidden transition-all duration-700 shadow-2xl ${focusMode ? 'z-50 scale-105 ring-4 ring-blue-500/50' : 'hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'}`}>
                {/* Dark Glass Background */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl z-0 border border-white/10"></div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-12 text-white">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <span className="text-sm font-bold tracking-widest text-blue-400 uppercase">{activeScenario.stage}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Skor:</span>
                            <span className={`font-mono font-bold ${independenceScore > 50 ? 'text-green-400' : 'text-orange-400'}`}>{independenceScore}</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-6 text-white leading-tight min-h-[4rem]">
                        {activeScenario.title}
                    </h2>

                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key="question"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="min-h-[80px]">
                                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium">
                                        {activeScenario.description.slice(0, textIndex)}
                                        <span className="animate-pulse text-blue-400">|</span>
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-1">
                                    {activeScenario.options.map((opt, idx) => (
                                        <motion.button
                                            key={opt.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleChoice(opt)}
                                            className="group relative flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
                                        >
                                            <span className="text-4xl">{opt.icon}</span>
                                            <div>
                                                <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                                    {opt.text}
                                                </h4>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 py-4"
                            >
                                <div className="inline-block p-4 rounded-full bg-green-500/20 text-green-400 mb-2">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Analiz Sonucu</h3>
                                    <p className="text-lg text-gray-300">"{lastChoice.feedback}"</p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-gray-400">Bireyselleşme Seviyesi</span>
                                        <span className="text-3xl font-black text-blue-400">{independenceScore}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: `${Math.max(0, Math.min(100, independenceScore - lastChoice.independenceEffect))}%` }}
                                            animate={{ width: `${Math.max(0, Math.min(100, independenceScore))}%` }}
                                            transition={{ type: "spring", stiffness: 50, damping: 10 }}
                                            className="h-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={nextScenario}
                                    className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl hover:bg-gray-100"
                                >
                                    Sonraki Senaryo
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
