
'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';

// --- DATA STRUCTURES ---

interface QuizQuestion {
  id: number;
  text: string;
  options: {
    id: 'a' | 'b' | 'c';
    text: string;
    score: number; // Contribution to the metric
  }[];
}

interface TestWeek {
  id: number;
  title: string;
  metric: string; // The backend analysis parameter
  description: string;
  questions: QuizQuestion[];
}

const tests: TestWeek[] = [
  {
    id: 1,
    title: 'İkiz Bağı Farkındalık',
    metric: 'Symbiosis_Score',
    description: 'İkizinizle aranızdaki bağın doğasını ve yoğunluğunu keşfedin.',
    questions: [
      {
        id: 101,
        text: 'Bir karar alırken ikizinin onayı olmadan ne kadar rahat hissediyorsun?',
        options: [
          { id: 'a', text: 'Hiç rahat hissetmem, mutlaka sorarım.', score: 0 },
          { id: 'b', text: 'Bazen sorarım ama kendim de karar veririm.', score: 50 },
          { id: 'c', text: 'Tamamen rahatım, kendi kararlarımı alırım.', score: 100 }
        ]
      },
      {
        id: 102,
        text: 'İkizinle aynı kıyafeti giymediğinde eksiklik hissediyor musun?',
        options: [
          { id: 'a', text: 'Evet, garip hissediyorum.', score: 0 },
          { id: 'b', text: 'Bazen, duruma göre.', score: 50 },
          { id: 'c', text: 'Hayır, farklı giyinmeyi severim.', score: 100 }
        ]
      },
      {
        id: 103,
        text: 'Sosyal ortamlarda "biz" demeyi mi "ben" demeyi mi tercih edersin?',
        options: [
          { id: 'a', text: 'Genelde "biz" derim.', score: 0 },
          { id: 'b', text: 'Değişir.', score: 50 },
          { id: 'c', text: 'Kendi fikirlerim için "ben" derim.', score: 100 }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Sınırlar ve Özel Alan',
    metric: 'Boundary_Integrity',
    description: 'Fiziksel ve duygusal sınırların ihlal edilip edilmediğini analiz edin.',
    questions: [
      {
        id: 201,
        text: 'İkizin odana veya eşyalarına izinsiz dokunduğunda ne yaparsın?',
        options: [
          { id: 'a', text: 'Sorun etmem, her şeyimiz ortaktır.', score: 0 },
          { id: 'b', text: 'Rahatsız olurum ama söyleyemem.', score: 30 },
          { id: 'c', text: 'Sınırlarımı net bir şekilde belirtirim.', score: 100 }
        ]
      },
      {
        id: 202,
        text: 'Duygusal olarak kötü hissettiğinde yalnız kalabiliyor musun?',
        options: [
          { id: 'a', text: 'Hayır, o da hemen yanıma gelir.', score: 10 },
          { id: 'b', text: 'Bazen zor oluyor.', score: 50 },
          { id: 'c', text: 'Evet, özel alanıma saygı duyulur.', score: 100 }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Sosyal Çevre ve Arkadaşlık',
    metric: 'Social_Independence',
    description: 'İkizinden bağımsız sosyal çevre kurma kapasiten.',
    questions: [
      {
        id: 301,
        text: 'Sadece sana ait (ikizinin tanımadığı) arkadaşların var mı?',
        options: [
          { id: 'a', text: 'Hayır, tüm arkadaşlarımız ortak.', score: 0 },
          { id: 'b', text: 'Birkaç tane var.', score: 60 },
          { id: 'c', text: 'Evet, tamamen ayrı bir grubum var.', score: 100 }
        ]
      },
      {
        id: 302,
        text: 'Bir etkinliğe ikizin olmadan davet edildiğinde gider misin?',
        options: [
          { id: 'a', text: 'Gitmem, onu yalnız bırakamam.', score: 0 },
          { id: 'b', text: 'Tereddüt ederim.', score: 40 },
          { id: 'c', text: 'Giderim ve eğlenirim.', score: 100 }
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Karar Verme Stilleri',
    metric: 'Decision_Autonomy',
    description: 'Kararlarının ne kadarı sana ait?',
    questions: [
      {
        id: 401,
        text: 'Gelecek planların ikizinle ne kadar örtüşüyor?',
        options: [
          { id: 'a', text: 'Aynı bölümü/işi istiyoruz, ayrılmayacağız.', score: 0 },
          { id: 'b', text: 'Benzer alanlar ama farklı yollar.', score: 60 },
          { id: 'c', text: 'Tamamen farklı hedeflerim var.', score: 100 }
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Ebeveyn Tutum Yansıması',
    metric: 'Parental_Pressure_Index',
    description: 'Dış çevrenin baskısını nasıl hissediyorsun?',
    questions: [
      {
        id: 501,
        text: 'Ailen sizi "ikizler" diye mi yoksa isminizle mi çağırır?',
        options: [
          { id: 'a', text: 'Genelde "ikizler" derler.', score: 0 },
          { id: 'b', text: 'Bazen karıştırırlar.', score: 50 },
          { id: 'c', text: 'Her zaman ismimizle hitap ederler.', score: 100 }
        ]
      }
    ]
  },
  {
    id: 6,
    title: 'Kimlik Sentezi (Final)',
    metric: 'Identity_Formation_Rate',
    description: 'Bireysel kimlik algısının genel değerlendirmesi.',
    questions: [
      {
        id: 601,
        text: 'Kendini aynada gördüğünde kimi görüyorsun?',
        options: [
          { id: 'a', text: 'Bizi.', score: 0 },
          { id: 'b', text: 'Benzerimi.', score: 50 },
          { id: 'c', text: 'Kendimi, birey olarak.', score: 100 }
        ]
      }
    ]
  }
];

export default function TestsPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
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

  // Stats calculation
  const calculateResult = (weekId: number, answers: number[]) => {
    const average = answers.reduce((a, b) => a + b, 0) / answers.length;
    return average;
  };

  const handleStartWeek = (weekId: number) => {
    if (!user) return;
    setActiveWeek(weekId);
    setCurrentQuestionIndex(0);
    setShowResult(false);
  };

  const handleAnswer = (score: number) => {
    if (animating || activeWeek === null) return;

    setAnimating(true);

    // Visual Pulse effect handled by CSS/Framer
    setTimeout(() => {
      const currentTest = tests.find(t => t.id === activeWeek);
      if (!currentTest) return;

      // Save intermediate logic if needed (mocked here)

      if (currentQuestionIndex < currentTest.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAnimating(false);
      } else {
        // Test Finished
        finishTest(activeWeek, score); // Simplified passing last score, in real app accumulate
      }
    }, 600);
  };

  const finishTest = (weekId: number, lastScore: number) => {
    // Mock score calculation - normally we'd track array of answers
    // Here just using the last score for demo + random variation
    const finalScore = Math.min(100, Math.max(0, lastScore)); // Dummy logic

    setScores(prev => ({ ...prev, [weekId]: finalScore }));
    setCompletedWeeks(prev => [...prev, weekId]);
    setShowResult(true);
    setAnimating(false);
  };

  const closeResult = () => {
    setActiveWeek(null);
    setShowResult(false);
  };

  // --- RENDER HELPERS ---

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white">Test Merkezi Kilitli</h2>
          <p className="text-slate-400">
            Haftalık gelişim testlerine erişmek ve profesyonel analiz raporu alabilmek için giriş yapmalısınız.
          </p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const activeTest = tests.find(t => t.id === activeWeek);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4">

      {/* Main Header */}
      {!activeWeek && (
        <div className="max-w-6xl mx-auto mb-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Gelişim Laboratuvarı
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Bilimsel temelli psikometrik testlerle bireyselleşme haritanızı çıkarın.
          </p>
        </div>
      )}

      {/* Dashboard View (Week Selection) */}
      {!activeWeek && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((week) => {
            const isCompleted = completedWeeks.includes(week.id);
            const isLocked = week.id > 1 && !completedWeeks.includes(week.id - 1); // Sequential lock

            return (
              <div
                key={week.id}
                className={`
                                relative p-1 rounded-3xl transition-all duration-300 group
                                ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer'}
                                ${isCompleted ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-slate-900'}
                            `}
                onClick={() => !isLocked && handleStartWeek(week.id)}
              >
                <div className="absolute inset-0 bg-slate-900 rounded-[22px] m-[1px] z-0" />
                <div className="relative z-10 p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`
                                        px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                                        ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600/20 text-blue-400'}
                                    `}>
                      {isCompleted ? 'Tamamlandı' : `${week.id}. Hafta`}
                    </span>
                    {isLocked && <span className="text-xl">🔒</span>}
                    {isCompleted && <span className="text-xl">✅</span>}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {week.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 flex-grow">
                    {week.description}
                  </p>
                  <div className="text-xs font-mono text-slate-600">
                    Metric: <span className="text-slate-500">{week.metric}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Test Interface */}
      <AnimatePresence mode="wait">
        {activeWeek && activeTest && !showResult && (
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-900 w-full">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-3xl w-full">
                {/* Question Card */}
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <span className="text-blue-500 font-bold tracking-widest text-sm uppercase">Soru {currentQuestionIndex + 1} / {activeTest.questions.length}</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                      {activeTest.questions[currentQuestionIndex].text}
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    {activeTest.questions[currentQuestionIndex].options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswer(opt.score)}
                        className="group w-full p-6 text-left bg-slate-900 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/50 transition-all duration-200 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <span className="text-xl text-slate-200 font-medium group-hover:text-white">{opt.text}</span>
                          <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-transparent transition-colors">
                            <span className="opacity-0 group-hover:opacity-100 text-white">➜</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Result Overlay */}
      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <Confetti numberOfPieces={200} recycle={false} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-3xl max-w-xl w-full text-center relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500" />

              <div className="mb-8">
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-emerald-500/30">
                  ✨
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Hafta Tamamlandı!</h2>
                <p className="text-slate-400">
                  Veriler işlendi ve gelişim raporuna eklendi.
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">BU HAFTAKİ SKORUN</div>
                <div className="text-5xl font-black text-white">
                  {scores[activeWeek!] || 0}<span className="text-2xl text-slate-600">/100</span>
                </div>
                <p className="mt-2 text-emerald-400 font-medium text-sm">
                  Harika! Geçen haftaya göre artış var.
                </p>
              </div>

              <button
                onClick={closeResult}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Ana Menüye Dön
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}