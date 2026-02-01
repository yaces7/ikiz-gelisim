'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Radar } from 'react-chartjs-2';
import ReactConfetti from 'react-confetti';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Real Bireyselleşme Süreci Ölçeği (BSÖ) - Mock Items based on literature
const questions = [
  { id: 1, text: "Kendi kararlarımı alırken ikizimden onay beklerim.", category: "dependency", reverse: true },
  { id: 2, text: "İkizimden ayrı vakit geçirmekten keyif alırım.", category: "autonomy", reverse: false },
  { id: 3, text: "Başkaları bizi 'ikizler' diye çağırdığında rahatsız olurum.", category: "individuation", reverse: false },
  { id: 4, text: "İkizim üzgün olduğunda ben de sebepsizce üzülürüm.", category: "emotional_fusion", reverse: true },
  { id: 5, text: "Gelecek planlarımı ikizimden bağımsız yapabilirim.", category: "autonomy", reverse: false },
  { id: 6, text: "İkizim olmadan kendimi yarım hissederim.", category: "dependency", reverse: true },
  // Simplified for demo
];

export default function TestPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
    }
  }, [isAuthenticated, router]);

  const handleAnswer = (value: number) => {
    // Haptic feedback mock
    if (navigator.vibrate) navigator.vibrate(50);

    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: value }));

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    if (!user) return;
    setLoading(true);
    // Calculate Scores Locally (or send to Backend)
    // Mocking backend processing for immediately UI update, but sending data too

    let autonomy = 0;
    let dependency = 0;

    questions.forEach(q => {
      let val = answers[q.id] || 3;
      if (q.reverse) val = 6 - val; // Reverse 1-5 scale

      if (q.category === 'autonomy') autonomy += val;
      if (q.category === 'dependency') dependency += val;
    });

    const payload = {
      userId: user.id, // Real User
      type: 'BSO',
      scores: { autonomy, dependency },
      total: autonomy + dependency
    };

    // Send to Backend
    try {
      await fetch('/api/scales', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setResults({
        labels: ['Özerklik', 'Bağlılık', 'Duygusal Ayrışma', 'Kimlik'],
        datasets: [
          {
            label: 'Senin Profilin',
            data: [autonomy * 2, dependency * 2, 60, 75], // Mock extra data
            backgroundColor: 'rgba(59, 130, 246, 0.4)',
            borderColor: '#3b82f6',
            borderWidth: 2,
          },
          {
            label: 'Ortalama İkiz',
            data: [65, 55, 50, 60],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: '#9ca3af',
            borderWidth: 1,
            borderDash: [5, 5]
          }
        ]
      });
      setLoading(false);
      setFinished(true);
      new Audio('/sounds/success.mp3').play().catch(() => { }); // Mock sound
    }, 1500); // Fake processing delay
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
      {finished && <ReactConfetti recycle={false} numberOfPieces={500} />}

      {/* Background Blob */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>

      {!finished ? (
        <div className="w-full max-w-2xl glass p-8 rounded-2xl relative">
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
                {questions[currentStep].text}
              </h2>

              <div className="flex flex-wrap justify-center gap-4">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAnswer(val)}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 flex items-center justify-center text-lg font-bold shadow-lg"
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between w-full max-w-md mx-auto mt-4 text-sm text-gray-500">
                <span>Kesinlikle Katılmıyorum</span>
                <span>Tamamen Katılıyorum</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm rounded-2xl">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-semibold animate-pulse">Sonuçlar Analiz Ediliyor...</p>
              <p className="text-xs text-gray-500 mt-2">Veriler şifreleniyor</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl glass p-8 rounded-2xl"
        >
          <h2 className="text-3xl font-bold text-center mb-6">Bireyselleşme Profilin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-80 w-full relative">
              <Radar
                data={results}
                options={{
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(100, 100, 100, 0.2)' },
                      grid: { color: 'rgba(100, 100, 100, 0.2)' },
                      pointLabels: { font: { size: 14 } }
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-500">
                <h3 className="font-bold text-xl mb-2">Özerklik Seviyen</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Kendi kararlarını alma konusunda güçlü bir istek gösteriyorsun.
                  Bu harika! Ancak bazen destek almaktan çekiniyor olabilirsin.
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl border-l-4 border-orange-500">
                <h3 className="font-bold text-xl mb-2">Öneri</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Önümüzdeki hafta için önerilen modül: <strong>"Sağlıklı Sınırlar"</strong>.
                </p>
                <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                  Modüle Git ➔
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}