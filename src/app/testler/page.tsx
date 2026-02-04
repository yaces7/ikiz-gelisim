'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import { allTests } from '../data/testQuestions';
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

  // Use active_week from user context (default to 1)
  const activeWeek = user?.active_week || 1;

  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [answers, setAnswers] = useState<{ qId: number, score: number }[]>([]);

  // Filter tests for the active week
  const weekTests = allTests.filter(t => t.week === activeWeek).sort((a, b) => a.order - b.order);

  // Fetch History on Load
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const data = await api.get('/api/test/history');
        // Parse history to find completed WEEKLY tests
        const completed: string[] = [];
        const scoreMap: Record<string, number> = {};

        if (data.scores) {
          data.scores.forEach((s: any) => {
            if (s.sub_dimensions && s.sub_dimensions.testId) {
              const tId = s.sub_dimensions.testId;
              if (!completed.includes(tId)) completed.push(tId);
              scoreMap[tId] = s.total_score;
            }
          });
        }
        setCompletedTests(completed);
        setScores(scoreMap);
      } catch (e) {
        console.error("Failed to load test history", e);
      }
    };
    fetchHistory();
  }, [user]);

  const handleStartTest = (testId: string) => {
    if (!user) return;
    setActiveTestId(testId);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswer = (scoreIndex: number) => {
    if (animating || !activeTestId) return;

    setAnimating(true);

    // Scoring: 0 to 100 based on option choice. 
    // Assuming 4 options: 0->0, 1->33, 2->66, 3->100
    const points = Math.round((scoreIndex / 3) * 100);

    const currentTest = weekTests.find(t => t.id === activeTestId);
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
        const totalScore = Math.round(newAnswers.reduce((sum, item) => sum + item.score, 0) / newAnswers.length);
        finishTest(activeTestId, totalScore, newAnswers);
      }
    }, 500);
  };

  const finishTest = async (testId: string, finalScore: number, answersLog: any[]) => {
    setScores(prev => ({ ...prev, [testId]: finalScore }));
    setCompletedTests(prev => [...prev, testId]);
    setShowResult(true);
    setAnimating(false);

    // Fix layout issue: Scroll to top to ensure result is visible
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    try {
      await api.post('/api/test/save', {
        test_type: 'WEEKLY',
        total_score: finalScore,
        week_number: activeWeek,
        sub_dimensions: { testId, answers: answersLog }
      });
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const closeResult = () => {
    setActiveTestId(null);
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
  if (activeTestId) {
    const currentTest = weekTests.find(t => t.id === activeTestId);
    if (!currentTest) return null;

    if (showResult) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          {/* Confetti container fixed to viewport */}
          <div className="fixed inset-0 pointer-events-none">
            <Confetti numberOfPieces={300} recycle={false} />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-3xl text-center max-w-lg w-full shadow-2xl relative z-10"
          >
            <div className="text-6xl mb-6">🧬</div>
            <h2 className="text-3xl font-black text-white mb-2">{currentTest.title} Tamamlandı!</h2>
            <div className="my-8">
              <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Bireyselleşme Puanın</div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {scores[activeTestId]}
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
    if (!question) return null;

    const progress = ((currentQuestionIndex) / currentTest.questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 text-slate-400">
            <span className="font-bold tracking-widest uppercase text-xs md:text-sm">{currentTest.title}</span>
            <span className="text-xs md:text-sm">{currentQuestionIndex + 1} / {currentTest.questions.length}</span>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />

              <h2 className="text-xl md:text-3xl font-bold text-white mb-8 md:mb-12 leading-tight">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-4 md:p-6 text-left bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-blue-500/50 rounded-2xl transition-all group flex items-center justify-between"
                  >
                    <span className="text-sm md:text-lg text-slate-200 font-medium group-hover:text-white transition-colors">{opt}</span>
                    <span className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-slate-600 group-hover:border-blue-400 group-hover:bg-blue-400/20 transition-all flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <button onClick={() => setActiveTestId(null)} className="mt-8 text-slate-500 hover:text-white text-sm">
            ← Listeye Dön
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View for Active Week
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
            Hafta {activeWeek}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Gelişim Laboratuvarı
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Bu haftanın özel testlerini tamamlayarak gelişimini takip et.
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {weekTests.length > 0 ? weekTests.map((test, index) => {
            const isCompleted = completedTests.includes(test.id);
            const score = scores[test.id];

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 border hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[300px] ${isCompleted
                    ? 'bg-slate-900 border-green-500/30 shadow-green-900/10'
                    : 'bg-slate-900 border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20'
                  }`}
                onClick={() => handleStartTest(test.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-5xl font-black text-white/10">0{test.order}</span>
                    {isCompleted ? (
                      <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                        TAMAMLANDI
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 animate-pulse">
                        HAZIR
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{test.description}</p>
                </div>

                {isCompleted && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Skorun</div>
                    <div className="text-3xl font-black text-green-400">{score}</div>
                  </div>
                )}

                <button
                  className={`w-full py-3 rounded-xl font-bold transition-all ${isCompleted
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                    }`}
                >
                  {isCompleted ? 'Tekrar Çöz' : 'Başla'}
                </button>
              </motion.div>
            );
          }) : (
            <div className="col-span-3 text-center py-20">
              <p className="text-slate-500">Bu hafta için henüz test eklenmedi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}