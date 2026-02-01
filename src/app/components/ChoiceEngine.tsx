'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { io } from 'socket.io-client';
import { encryptData } from '../lib/security';

const socket = io(); // Connects to the same host/port automatically

const scenarios = [
    {
        id: 1,
        title: 'Hafta Sonu İkilemi',
        stage: 'Senaryo 1 / 5',
        description: 'Arkadaşlarınla uzun zamandır planladığın sinema etkinliği var. Tam çıkmak üzereyken ikizin "Kendimi çok yalnız hissediyorum, lütfen gitme" diyor.',
        options: [
            { id: 'a', text: 'Planımı iptal eder, onunla kalırım.', icon: '🫂', independenceEffect: -10, feedback: 'Fedakarca ama kendi sınırlarını ihlal ettin.' },
            { id: 'b', text: '"Seni seviyorum ama bu plana sadık kalmalıyım" derim.', icon: '🛡️', independenceEffect: +15, feedback: 'Harika bir sınır koyma örneği!' },
            { id: 'c', text: 'Arkadaşlarımı eve çağırırım.', icon: '🏠', independenceEffect: +5, feedback: 'Orta yol, ama bireysel alanını feda ettin.' }
        ]
    }
];

export default function ChoiceEngine() {
    const [activeScenario, setActiveScenario] = useState(scenarios[0]);
    const [showResult, setShowResult] = useState(false);
    const [independenceScore, setIndependenceScore] = useState(50);
    const [lastChoice, setLastChoice] = useState<any>(null);
    const [focusMode, setFocusMode] = useState(false);
    const [leveledUp, setLeveledUp] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    // Typewriter Effect
    useEffect(() => {
        if (!showResult && textIndex < activeScenario.description.length) {
            const timeout = setTimeout(() => {
                setTextIndex(prev => prev + 1);
            }, 30);
            return () => clearTimeout(timeout);
        }
    }, [textIndex, showResult, activeScenario.description]);

    const handleChoice = (option: any) => {
        setFocusMode(true);
        const encryptedPayload = encryptData({
            choiceId: option.id,
            timestamp: Date.now(),
            scoreDelta: option.independenceEffect
        });
        socket.emit('child_action', { encryptedData: encryptedPayload });

        setTimeout(() => {
            setLastChoice(option);
            const newScore = Math.min(100, Math.max(0, independenceScore + option.independenceEffect));
            setIndependenceScore(newScore);

            if (newScore > 60 && independenceScore <= 60) setLeveledUp(true);

            setShowResult(true);
            setFocusMode(false);
            setTextIndex(0); // Reset for next time
        }, 1200);
    };

    const reset = () => {
        setShowResult(false);
        setLastChoice(null);
        setLeveledUp(false);
        setTextIndex(0);
    };

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
                            <span className="text-xs text-gray-400">Mevcut Skor:</span>
                            <span className={`font-mono font-bold ${independenceScore > 50 ? 'text-green-400' : 'text-orange-400'}`}>{independenceScore}</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black mb-6 text-white leading-tight">
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
                                                <span className="text-xs text-gray-400 group-hover:text-blue-200/70">Seçmek için tıkla</span>
                                            </div>
                                            <div className="absolute right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
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
                                    <h3 className="text-2xl font-bold text-white">Seçimin Analiz Edildi</h3>
                                    <p className="text-lg text-gray-300">"{lastChoice.feedback}"</p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-gray-400">Bireyselleşme Seviyesi</span>
                                        <span className="text-3xl font-black text-blue-400">{independenceScore}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: `${independenceScore - lastChoice.independenceEffect}%` }}
                                            animate={{ width: `${independenceScore}%` }}
                                            transition={{ type: "spring", stiffness: 50, damping: 10 }}
                                            className="h-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                                        <span>Bağımlı</span>
                                        <span>Dengeli</span>
                                        <span>Özerk</span>
                                    </div>
                                </div>

                                <button
                                    onClick={reset}
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
