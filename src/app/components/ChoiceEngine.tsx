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
        title: 'Hafta Sonu Planı',
        description: 'Arkadaşlarınla sinemaya gitmek istiyorsun ama ikiz kardeşin evde kalıp seninle oyun oynamak istiyor. Ne yaparsın?',
        options: [
            { id: 'a', text: 'Kardeşimle kalırım, onu üzmek istemem.', independenceEffect: -5 },
            { id: 'b', text: 'Arkadaşlarımla giderim, bu benim planım.', independenceEffect: +10 },
            { id: 'c', text: 'Kardeşimi de davet ederim.', independenceEffect: +2 }
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

    useEffect(() => {
        // Client-side window size for confetti
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    const handleChoice = (option: any) => {
        // 1. Activate Focus Mode (Visual)
        setFocusMode(true);

        // 2. Encryption Layer (Security)
        const encryptedPayload = encryptData({
            choiceId: option.id,
            timestamp: Date.now(),
            scoreDelta: option.independenceEffect
        });

        // 3. Socket Event (Backend Intelligence)
        socket.emit('child_action', { encryptedData: encryptedPayload });

        // 4. Update State (Gamification)
        setTimeout(() => {
            setLastChoice(option);
            const newScore = Math.min(100, Math.max(0, independenceScore + option.independenceEffect));
            setIndependenceScore(newScore);

            if (newScore > 60 && independenceScore <= 60) {
                setLeveledUp(true); // Trigger Level UP event
            }

            setShowResult(true);
            setFocusMode(false);
        }, 1500); // Artificial delay to show "Focus Effect"
    };

    const reset = () => {
        setShowResult(false);
        setLastChoice(null);
        setLeveledUp(false);
    };

    return (
        <>
            {/* Global Effects */}
            {leveledUp && <ReactConfetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />}

            {/* Focus Mode Overlay */}
            <AnimatePresence>
                {focusMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-40 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className={`relative w-full max-w-2xl mx-auto p-8 rounded-2xl overflow-hidden mt-8 transition-all duration-500 ${focusMode ? 'z-50 scale-105 bg-white shadow-[0_0_50px_rgba(59,130,246,0.5)]' : 'bg-white/10 glass'}`}>
                <h2 className="text-2xl font-bold mb-4 text-center">Simülasyon Modu: The Choice Engine</h2>

                <AnimatePresence mode="wait">
                    {!showResult ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold">{activeScenario.title}</p>
                            <p className="text-md text-gray-600 dark:text-gray-300">{activeScenario.description}</p>

                            <div className="grid gap-4">
                                {activeScenario.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleChoice(opt)}
                                        className="p-4 text-left border rounded-xl hover:bg-blue-500 hover:text-white dark:border-gray-700 transition-all duration-300 flex justify-between items-center group active:scale-95"
                                    >
                                        <span>{opt.text}</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">➜</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <h3 className="text-xl font-bold text-green-600">Seçiminiz Kaydedildi</h3>

                            {leveledUp && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1.5, rotate: 0 }}
                                    className="text-yellow-500 font-black text-2xl"
                                >
                                    LEVEL UP! 🌟
                                </motion.div>
                            )}

                            <p className="text-lg italic">"{lastChoice.text}"</p>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-semibold">Bağımsızlık Skoru</span>
                                <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
                                    <motion.div
                                        initial={{ width: `${independenceScore - lastChoice.independenceEffect}%` }}
                                        animate={{ width: `${independenceScore}%` }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        className={`h-full absolute top-0 left-0 ${independenceScore > 50 ? 'bg-gradient-to-r from-blue-400 to-green-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                                    />
                                </div>
                                <span className="font-bold text-2xl">{independenceScore}%</span>
                            </div>

                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                <p>🔒 Verileriniz AES-256 ile şifrelenerek Zeka Katmanına iletildi.</p>
                            </div>

                            <button
                                onClick={reset}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Yeni Senaryo
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
