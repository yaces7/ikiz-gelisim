
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ReflexGameProps {
    onClose: () => void;
    onSave: (score: number) => void;
}

export default function ReflexGame({ onClose, onSave }: ReflexGameProps) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [targets, setTargets] = useState<{ id: number, x: number, y: number, type: 'me' | 'twin' }[]>([]);
    const [gameActive, setGameActive] = useState(true);

    useEffect(() => {
        if (!gameActive) return;

        // Timer
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameActive(false);
                    onSave(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Target Spawner
        const spawner = setInterval(() => {
            const id = Date.now();
            const type = Math.random() > 0.4 ? 'me' : 'twin'; // 60% chance of 'me' to be clickable
            const x = Math.random() * 80 + 10; // 10% - 90% width
            const y = Math.random() * 60 + 20; // 20% - 80% height

            setTargets(prev => [...prev, { id, x, y, type }]);

            // Despawn after 2 seconds
            setTimeout(() => {
                setTargets(prev => prev.filter(t => t.id !== id));
            }, 2000);
        }, 600);

        return () => { clearInterval(timer); clearInterval(spawner); };
    }, [gameActive, score]); // score dependency to simplistic save call, but better to save only at end.

    const handleHit = (id: number, type: 'me' | 'twin') => {
        if (type === 'me') {
            setScore(prev => prev + 10);
            // Play sound?
        } else {
            setScore(prev => Math.max(0, prev - 10)); // Penalty
        }
        setTargets(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="w-full max-w-4xl h-[80vh] relative border-4 border-slate-700 bg-slate-900 rounded-3xl overflow-hidden cursor-crosshair">

                {/* HUD */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-slate-800/80 backdrop-blur-md z-10 border-b border-white/10">
                    <div className="text-3xl font-black text-white">SKOR: <span className="text-blue-400">{score}</span></div>
                    <div className="text-xl font-bold text-white uppercase tracking-widest bg-red-500/20 px-4 py-2 rounded-lg border border-red-500/50">
                        {gameActive ? `Süre: ${timeLeft}s` : 'Oyun Bitti'}
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold">Çıkış</button>
                </div>

                {/* Game Area */}
                <div className="relative w-full h-full">
                    {!gameActive ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80">
                            <Confetti numberOfPieces={200} recycle={false} />
                            <h2 className="text-5xl font-black text-white mb-4">Süre Doldu!</h2>
                            <p className="text-2xl text-slate-400 mb-8">Toplam Skor: {score}</p>
                            <button onClick={onClose} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xl transition shadow-lg shadow-blue-500/30">
                                Menüye Dön
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {targets.map(t => (
                                <motion.button
                                    key={t.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => handleHit(t.id, t.type)}
                                    className={`absolute w-24 h-24 rounded-full flex items-center justify-center font-bold text-white shadow-2xl border-4 transform transition-transform active:scale-90
                                        ${t.type === 'me'
                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-400 border-white hover:shadow-blue-500/50'
                                            : 'bg-gradient-to-br from-red-500 to-pink-500 border-red-200 hover:shadow-red-500/50'
                                        }
                                    `}
                                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                                >
                                    {t.type === 'me' ? 'BEN' : 'İKİZİM'}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Instructions */}
                    {gameActive && timeLeft > 25 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 text-lg animate-pulse font-bold bg-black/50 px-4 py-2 rounded-xl">
                            "BEN" yazanlara tıkla, "İKİZİM" yazanlardan kaçın!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
