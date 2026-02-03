
'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { weeklyTests as tests } from '../data/testQuestions';
import api from '../lib/api';

export default function TestsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <TestInterface />
    </Suspense>
  );
}

function TestInterface() {
  const { user } = useAuth();
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [answers, setAnswers] = useState<{ qId: number, score: number }[]>([]);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await api.get('/api/test/history');
        setCompletedWeeks(data.completedWeeks || []);
        // Also restore scores map
        const scoreMap: Record<string, number> = {};
        if (data.history) {
          data.history.forEach((h: any) => {
            scoreMap[h.weekId] = h.score;
          });
        }
        setScores(scoreMap);
      } catch (e) {
        console.error("Failed to load test history", e);
      }
    };
    fetchHistory();
  }, [user]);

  const handleStartWeek = (weekId: number) => {
    if (!user) return;

    // Sequential Lock Check
    if (weekId > 1 && !completedWeeks.includes(weekId - 1)) {
      alert("Önceki haftayı tamamlamadan bu teste başlayamazsınız!");
      return;
    }

    if (completedWeeks.includes(weekId)) {
      // Optional: Allow retake? For now, maybe just show score.
      // alert("Bu testi zaten tamamladınız.");
      // return;
    }

    setActiveWeek(weekId);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
  };

  const handleAnswer = (scoreIndex: number) => {
    if (animating || activeWeek === null) return;

    setAnimating(true);

    // Calculate score (0-100 based on index? Or raw option index?)
    // Let's assume options are ordered [Least Independent -> Most Independent] or vice versa.
    // For simplicity: index 0 = 0pts, index 3 = 100pts
    const points = Math.round((scoreIndex / 3) * 100);

    const currentTest = tests.find(t => t.id === activeWeek);
    if (!currentTest) return;

    const qId = currentTest.questions[currentQuestionIndex].id;
    const newAnswers = [...answers, { qId, score: points }];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < currentTest.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnimating(false);
      } else {
        // Finish Logic
        const totalScore = newAnswers.reduce((sum, item) => sum + item.score, 0);
        const averageScore = Math.round(totalScore / newAnswers.length);
        finishTest(activeWeek, averageScore, newAnswers);
      }
    }, 500);
  };

  const finishTest = async (weekId: number, finalScore: number, answersLog: any[]) => {
    setScores(prev => ({ ...prev, [weekId]: finalScore }));
    setCompletedWeeks(prev => [...prev, weekId]);
    setShowResult(true);
    setAnimating(false);

    try {
      await api.post('/api/test/save', {
        weekId,
        score: finalScore,
        answers: answersLog
      });
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const closeResult = () => {
    setActiveWeek(null);
    setShowResult(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-white">Gelişim Laboratuvarı Kilitli</h2>
          <p className="text-slate-400">Testlere erişmek için giriş yapmalısınız.</p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  // Active Test View
  if (activeWeek !== null) {
    const currentTest = tests.find(t => t.id === activeWeek);
    if (!currentTest) return null;

    if (showResult) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <Confetti numberOfPieces={300} recycle={false} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 p-12 rounded-3xl text-center max-w-lg w-full shadow-2xl"
          >
            <div className="text-6xl mb-6">🧬</div>
            <h2 className="text-3xl font-black text-white mb-2">{currentTest.title} Tamamlandı!</h2>
            <div className="my-8">
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Bireyselleşme Puanın</div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {scores[activeWeek]}
              </div>
            </div>
            <p className="text-slate-400 mb-8 italic">
              "Harika bir ilerleme! Kendini tanıma yolculuğunda bir adımı daha tamamladın."
            </p>
            <button
              onClick={closeResult}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20"
            >
              Laboratuvara Dön
            </button>
          </motion.div>
        </div>
      );
    }

    const question = currentTest.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / currentTest.questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 text-slate-400">
            <span className="font-bold tracking-widest uppercase">{currentTest.title}</span>
            <span>{currentQuestionIndex + 1} / {currentTest.questions.length}</span>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />

              <h2 className="text-2xl md:text-4xl font-bold text-white mb-12 leading-tight">
                {question.text}
              </h2>

              <div className="space-y-4">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-6 text-left bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all group flex items-center justify-between"
                  >
                    <span className="text-lg text-slate-200 font-medium group-hover:text-white transition-colors">{opt}</span>
                    <span className="w-6 h-6 rounded-full border border-slate-600 group-hover:border-blue-400 group-hover:bg-blue-400/20 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Gelişim Laboratuvarı
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            6 haftalık bilimsel gelişim programını tamamla, kendi kimliğini keşfet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test, index) => {
            const isLocked = test.id > 1 && !completedWeeks.includes(test.id - 1);
            const isCompleted = completedWeeks.includes(test.id);
            const score = scores[test.id];

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 border hover:scale-[1.02] transition-all duration-300 ${isLocked
                  ? 'bg-slate-900/50 border-white/5 opacity-50 cursor-not-allowed'
                  : isCompleted
                    ? 'bg-slate-900 border-green-500/30 shadow-green-900/10'
                    : 'bg-slate-900 border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20'
                  }`}
                onClick={() => !isLocked && handleStartWeek(test.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl font-black text-white/10">{test.id}</span>
                  {isCompleted ? (
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                      TAMAMLANDI
                    </div>
                  ) : isLocked ? (
                    <div className="text-2xl">🔒</div>
                  ) : (
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 animate-pulse">
                      AKTİF
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{test.description}</p>

                {isCompleted && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Skorun</div>
                    <div className="text-3xl font-black text-green-400">{score}</div>
                  </div>
                )}

                <button
                  disabled={isLocked}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${isLocked
                    ? 'bg-white/5 text-slate-500'
                    : isCompleted
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                    }`}
                >
                  {isLocked ? 'Önceki Haftayı Tamamla' : isCompleted ? 'Tekrar Çöz' : 'Başla'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}