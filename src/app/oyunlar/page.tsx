
'use client';

import { useState, Suspense, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// --- GAME DATA DEFINITIONS (SWIPE CARDS) ---
// Each card represents a scenario.
// Left Swipe: Reaction A (usually Reject/Differ/Self)
// Right Swipe: Reaction B (usually Accept/Same/Social)
// Scoring logic is simplified for demo: We track "Balance" or specific trait points.

type GameScenario = {
  id: number;
  text: string;
  leftLabel: string;
  rightLabel: string;
  leftEffect: { pt: number, feedback: string }; // pt can be added to score
  rightEffect: { pt: number, feedback: string };
};

const GAMES_DATA: Record<string, { title: string, subtitle: string, instruction: string, icon: string, color: string, scenarios: GameScenario[] }> = {
  boundary: {
    title: 'Sınır Hattı',
    subtitle: 'Özel Alan Savunması',
    instruction: 'Kartı SOLA çekerek "Hayır/Dur" de, SAĞA çekerek "Kabul Et/İzin Ver". Sınırlarını koru!',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    scenarios: [
      { id: 1, text: 'İkizin odana izinsiz girdi.', leftLabel: 'Çıkmasını Söyle', rightLabel: 'Görmezden Gel', leftEffect: { pt: 20, feedback: 'Sınır çizdin!' }, rightEffect: { pt: -10, feedback: 'Alan ihlali!' } },
      { id: 2, text: 'Günlüğünü okumak istiyor.', leftLabel: 'Hayır!', rightLabel: 'Okusun', leftEffect: { pt: 30, feedback: 'Özelin korundu.' }, rightEffect: { pt: -20, feedback: 'Mahremiyet kaybı.' } },
      { id: 3, text: 'Kıyafetini sormadan giymiş.', leftLabel: 'Geri İste', rightLabel: 'Boşver', leftEffect: { pt: 20, feedback: 'Eşyana sahip çıktın.' }, rightEffect: { pt: 0, feedback: 'Pasif kaldın.' } },
      { id: 4, text: 'Sen ders çalışırken müzik açtı.', leftLabel: 'Kapatmasını İste', rightLabel: 'Kulaklık Tak', leftEffect: { pt: 20, feedback: 'İhtiyacını belirttin.' }, rightEffect: { pt: 10, feedback: 'Uyum sağladın.' } },
      { id: 5, text: 'Arkadaşlarınla buluşmana gelmek istiyor.', leftLabel: 'Bugün Yalnızım De', rightLabel: 'Gelsin', leftEffect: { pt: 30, feedback: 'Bireysel sosyalleşme.' }, rightEffect: { pt: 5, feedback: 'Yapışık ikiz riski.' } },
      { id: 6, text: 'Senin adına karar veriyor.', leftLabel: 'İtiraz Et', rightLabel: 'Onayla', leftEffect: { pt: 25, feedback: 'Kendi sesini duydun.' }, rightEffect: { pt: -15, feedback: 'Kimlik zayıflığı.' } },
      // Add more placeholders to reach ~20 conceptually
      ...Array.from({ length: 14 }).map((_, i) => ({
        id: 10 + i,
        text: `Rastgele Senaryo #${i + 1}: Sınır ihlali durumu yaşanıyor.`,
        leftLabel: 'Sınır Koy',
        rightLabel: 'Taviz Ver',
        leftEffect: { pt: 10, feedback: 'Sınır korundu.' },
        rightEffect: { pt: -5, feedback: 'Taviz verildi.' }
      }))
    ]
  },
  mirror: {
    title: 'Aynadaki Fark',
    subtitle: 'Benzersizlik Ayrımı',
    instruction: 'SOLA: "Bu Benim!", SAĞA: "Bu İkizim/Ortak". Özgün yönlerini sahiplen.',
    icon: '🪞',
    color: 'from-purple-500 to-pink-500',
    scenarios: [
      { id: 1, text: 'Resim Yapmak (Senin Hobin)', leftLabel: 'Benim', rightLabel: 'Onun/Ortak', leftEffect: { pt: 20, feedback: 'Doğru!' }, rightEffect: { pt: -10, feedback: 'Yanlış.' } },
      { id: 2, text: 'Aynı Kıyafeti Giymek', leftLabel: 'Benim Tarzım', rightLabel: 'Ortak', leftEffect: { pt: -10, feedback: 'Kopyalanma.' }, rightEffect: { pt: 20, feedback: 'Farkındalık.' } },
      { id: 3, text: 'Matematik Yeteneği (İkizinin)', leftLabel: 'Benim', rightLabel: 'Onun', leftEffect: { pt: -10, feedback: 'O ikizin!' }, rightEffect: { pt: 20, feedback: 'Ayrışma başarılı.' } },
      ...Array.from({ length: 17 }).map((_, i) => ({
        id: 10 + i,
        text: `Özellik #${i + 1}: ${i % 2 === 0 ? 'Sana Özgü Bir Yetenek' : 'İkizine Ait Bir Özellik'}`,
        leftLabel: 'Benim',
        rightLabel: 'Onun',
        leftEffect: { pt: i % 2 === 0 ? 20 : -10, feedback: i % 2 === 0 ? 'Güzel!' : 'Yanlış.' },
        rightEffect: { pt: i % 2 === 0 ? -10 : 20, feedback: i % 2 === 0 ? 'Fırsatı kaçırdın.' : 'Doğru tespit.' }
      }))
    ]
  },
  social: {
    title: 'Sosyal Labirent',
    subtitle: 'Sosyal Özerklik',
    instruction: 'SOLA: "Bireysel Hareket", SAĞA: "İkizinle Beraber". Dengeli olmaya çalış.',
    icon: '🧩',
    color: 'from-emerald-500 to-green-500',
    scenarios: [
      { id: 1, text: 'Partiye davetlisin, ikizin hasta.', leftLabel: 'Git', rightLabel: 'Kal', leftEffect: { pt: 20, feedback: 'Bağımsız sosyallik.' }, rightEffect: { pt: 5, feedback: 'Fedakarlık.' } },
      ...Array.from({ length: 19 }).map((_, i) => ({
        id: 10 + i,
        text: `Sosyal Durum #${i + 1}: Farklı bir çevreye girme şansı.`,
        leftLabel: 'Katıl',
        rightLabel: 'İkizimle Kal',
        leftEffect: { pt: 20, feedback: 'Yeni çevre.' },
        rightEffect: { pt: 5, feedback: 'Güvenli alan.' }
      }))
    ]
  },
  diplomacy: {
    title: 'Mutfak Diplomasisi',
    subtitle: 'İletişim Stratejisi',
    instruction: 'SOLA: "Net Ol", SAĞA: "Uyumlu Ol". Duruma göre en akıllıca hamleyi yap.',
    icon: '🗣️',
    color: 'from-orange-500 to-amber-500',
    scenarios: Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      text: `Ebeveyn İletişimi #${i + 1}: Bir istekte bulunuyorsun.`,
      leftLabel: 'Israr Et',
      rightLabel: 'İkna Et',
      leftEffect: { pt: 10, feedback: 'Kararlılık.' },
      rightEffect: { pt: 15, feedback: 'Diplomasi.' }
    }))
  },
  future: {
    title: 'Gelecek Vizyonu',
    subtitle: 'Yol Ayrımı',
    instruction: 'SOLA: "Kendi Yolum", SAĞA: "Aile/İkiz Yolu". Geleceğini inşa et.',
    icon: '🚀',
    color: 'from-indigo-500 to-violet-500',
    scenarios: Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      text: `Kariyer Seçimi #${i + 1}: Önüne bir fırsat çıktı.`,
      leftLabel: 'Değerlendir',
      rightLabel: 'Danış',
      leftEffect: { pt: 20, feedback: 'Özerk karar.' },
      rightEffect: { pt: 10, feedback: 'İşbirliği.' }
    }))
  }
};


export default function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <GamesContent />
    </Suspense>
  );
}

function GamesContent() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white">Oyun Bölgesi Kilitli</h2>
          <p className="text-slate-400">
            Gelişim oyunlarına erişmek ve skorlarını kaydetmek için giriş yapmalısınız.
          </p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Oyun Alanı
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Kartları kaydır, kararlarını ver, bireyselleşme puanını yükselt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(GAMES_DATA).map(([key, game], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color}`} />
              <div className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {game.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">{game.subtitle}</h4>
                <p className="text-slate-400 leading-relaxed mb-8 flex-grow text-sm">
                  {game.instruction}
                </p>
                <button
                  onClick={() => setActiveGame(key)}
                  className="w-full py-4 rounded-xl font-bold bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all border border-white/10 group-hover:border-transparent"
                >
                  Oyna
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeGame && (
          <SwipeGameRunner
            gameId={activeGame}
            onClose={() => setActiveGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeGameRunner({ gameId, onClose }: { gameId: string, onClose: () => void }) {
  const game = GAMES_DATA[gameId];
  // Shuffle scenarios and take 20
  const [scenarios] = useState(() => [...game.scenarios].sort(() => 0.5 - Math.random()).slice(0, 20));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Card Motion
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const background = useTransform(
    x,
    [-200, 0, 200],
    ["rgba(239, 68, 68, 0.2)", "rgba(15, 23, 42, 1)", "rgba(34, 197, 94, 0.2)"]
  );

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      completeSwipe('right');
    } else if (info.offset.x < -threshold) {
      completeSwipe('left');
    }
  };

  const completeSwipe = (dir: 'left' | 'right') => {
    const current = scenarios[index];
    const effect = dir === 'left' ? current.leftEffect : current.rightEffect;

    setScore(prev => prev + effect.pt);
    setFeedback(effect.feedback);

    // Timeout to show feedback then next card
    setTimeout(() => {
      setFeedback(null);
      if (index < scenarios.length - 1) {
        setIndex(prev => prev + 1);
        x.set(0);
      } else {
        setFinished(true);
      }
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
    >
      <div className="w-full max-w-md h-[600px] relative flex flex-col items-center justify-center">
        <button onClick={onClose} className="absolute top-0 right-0 text-slate-500 hover:text-white p-4 z-50 text-xl font-bold">ÇIKIŞ</button>

        {!finished ? (
          <>
            <div className="absolute top-4 w-full text-center z-10">
              <h2 className="text-2xl font-bold text-white mb-1">{game.title}</h2>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((index) / scenarios.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className="px-6 py-3 bg-white text-slate-900 font-black text-2xl rounded-xl shadow-2xl">
                    {feedback}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card Stack Effect */}
            <div className="relative w-full h-[400px]">
              {/* Next Card Preview (Underneath) */}
              {index < scenarios.length - 1 && (
                <div className="absolute inset-0 bg-slate-800 border border-white/5 rounded-3xl p-8 transform scale-95 translate-y-4 opacity-50 flex items-center justify-center text-center">
                  <p className="text-slate-500">Sonraki Senaryo...</p>
                </div>
              )}

              {/* Active Card */}
              <motion.div
                style={{ x, rotate, background }}
                drag={feedback ? false : "x"} // Disable drag during feedback
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
              >
                <div className="text-6xl mb-6">{game.icon}</div>
                <h3 className="text-2xl font-bold text-white leading-snug select-none">
                  {scenarios[index].text}
                </h3>

                <div className="absolute bottom-8 w-full px-8 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest select-none">
                  <span className="text-red-400">← {scenarios[index].leftLabel}</span>
                  <span className="text-green-400">{scenarios[index].rightLabel} →</span>
                </div>
              </motion.div>
            </div>

            <p className="mt-8 text-slate-500 text-sm animate-pulse">
              Kartı sağa veya sola sürükle
            </p>
          </>
        ) : (
          <div className="text-center p-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full">
            <Confetti numberOfPieces={200} recycle={false} />
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-white mb-2">Oyun Bitti!</h2>
            <p className="text-slate-400 mb-6">Mükemmel bir iş çıkardın.</p>

            <div className="flex justify-center gap-8 mb-8 text-center">
              <div>
                <div className="text-4xl font-black text-blue-400">{score}</div>
                <div className="text-xs uppercase text-slate-500 font-bold">Toplam Puan</div>
              </div>
              <div>
                <div className="text-4xl font-black text-purple-400">{scenarios.length}</div>
                <div className="text-xs uppercase text-slate-500 font-bold">Kart Çözüldü</div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="w-full h-48 mb-6 flex justify-center">
              <Radar
                data={{
                  labels: ['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık'],
                  datasets: [{
                    label: 'Performans',
                    data: [80, 85, 70, 90, 75],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff'
                  }]
                }}
                options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      angleLines: { color: 'rgba(255,255,255,0.1)' },
                      grid: { color: 'rgba(255,255,255,0.1)' },
                      pointLabels: { display: false },
                      ticks: { display: false }
                    }
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }}
              />
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Menüye Dön
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}