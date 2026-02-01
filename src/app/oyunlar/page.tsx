
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
import dynamic from 'next/dynamic';

// Import Games Dynamically
const ReflexGame = dynamic(() => import('../components/games/ReflexGame'), { ssr: false });
const ChatGame = dynamic(() => import('../components/games/ChatGame'), { ssr: false });
const ChoiceEngine = dynamic(() => import('../components/ChoiceEngine'), { ssr: false });

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- GAME CONFIG ---
const GAMES_DATA: Record<string, { title: string, subtitle: string, instruction: string, icon: string, color: string, type: 'swipe' | 'reflex' | 'chat' | 'choice' }> = {
  boundary: {
    title: 'Sınır Hattı',
    subtitle: 'Özel Alan Savunması',
    instruction: 'Kartı SOLA çekerek "Hayır/Dur" de, SAĞA çekerek "Kabul Et/İzin Ver".',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    type: 'swipe'
  },
  mirror: {
    title: 'Aynadaki Fark',
    subtitle: 'Refleks Oyunu',
    instruction: 'Ekranda beliren kelimelerden sadece SENİN olanlara tıkla! İkizine ait olanlardan kaçın.',
    icon: '🪞',
    color: 'from-purple-500 to-pink-500',
    type: 'reflex'
  },
  social: {
    title: 'Sosyal Labirent',
    subtitle: 'Seçim Simülasyonu',
    instruction: 'Farklı sosyal senaryolarda en doğru kararı ver.',
    icon: '🧩',
    color: 'from-emerald-500 to-green-500',
    type: 'choice'
  },
  diplomacy: {
    title: 'Mutfak Diplomasisi',
    subtitle: 'İletişim Oyunu',
    instruction: 'Ailenle veya ikizinle mesajlaşırken doğru cevapları seç.',
    icon: '🗣️',
    color: 'from-orange-500 to-amber-500',
    type: 'chat'
  },
  future: {
    title: 'Gelecek Vizyonu',
    subtitle: 'Yol Ayrımı',
    instruction: 'Kariyer ve gelecek planları için kartları kaydır.',
    icon: '🚀',
    color: 'from-indigo-500 to-violet-500',
    type: 'swipe'
  }
};

// --- SWIPE GAME DATA (Only for 'boundary' & 'future') ---
const SWIPE_SCENARIOS = {
  boundary: [
    { id: 1, text: 'İkizin odana izinsiz girdi.', leftLabel: 'Çıkmasını Söyle', rightLabel: 'Görmezden Gel', leftEffect: { pt: 20, feedback: 'Sınır.' }, rightEffect: { pt: -10, feedback: 'İhlal.' } },
    { id: 2, text: 'Günlüğünü okumak istiyor.', leftLabel: 'Hayır!', rightLabel: 'Okusun', leftEffect: { pt: 30, feedback: 'Özel.' }, rightEffect: { pt: -20, feedback: 'Hata.' } },
    // ... more generated scenarios
    ...Array.from({ length: 18 }).map((_, i) => ({
      id: 10 + i,
      text: `Sınır İhlali #${i + 1}: Özel eşyalarını karıştırıyor.`,
      leftLabel: 'Uyar',
      rightLabel: 'İzin Ver',
      leftEffect: { pt: 10, feedback: 'Koruma.' },
      rightEffect: { pt: -5, feedback: 'Taviz.' }
    }))
  ],
  future: [
    { id: 1, text: 'Farklı şehirde üniversite?', leftLabel: 'Evet!', rightLabel: 'Korkuyorum', leftEffect: { pt: 20, feedback: 'Cesaret.' }, rightEffect: { pt: 5, feedback: 'Güvenli.' } },
    ...Array.from({ length: 19 }).map((_, i) => ({
      id: 10 + i,
      text: `Gelecek Kararı #${i + 1}: Kendi yolunu çizmek üzeresin.`,
      leftLabel: 'Devam Et',
      rightLabel: 'Dur',
      leftEffect: { pt: 15, feedback: 'İlerleme.' },
      rightEffect: { pt: 0, feedback: 'Duraksama.' }
    }))
  ]
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

  const saveScore = async (gameId: string, score: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/game/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ gameId, score, maxScore: 100 })
        });
      }
    } catch (e) { console.error(e); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-white">Oyun Bölgesi Kilitli</h2>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 py-12 px-4 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Oyun Alanı</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Bireyselleşme yolculuğunu oyunlaştır.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(GAMES_DATA).map(([key, game], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl transition-all flex flex-col"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color}`} />
              <div className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6 shadow-lg">
                  {game.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">{game.subtitle}</h4>
                <p className="text-slate-400 leading-relaxed mb-8 flex-grow text-sm">{game.instruction}</p>
                <button
                  onClick={() => setActiveGame(key)}
                  className="w-full py-4 rounded-xl font-bold bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all border border-white/10"
                >
                  Oyna
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeGame === 'mirror' && (
          <ReflexGame onClose={() => setActiveGame(null)} onSave={(s) => saveScore('mirror', s)} />
        )}
        {activeGame === 'diplomacy' && (
          <ChatGame onClose={() => setActiveGame(null)} onSave={(s) => saveScore('diplomacy', s)} />
        )}
        {activeGame === 'social' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 text-white font-bold z-50 p-4">KAPAT</button>
            <ChoiceEngine />
          </div>
        )}
        {(activeGame === 'boundary' || activeGame === 'future') && (
          <SwipeGameRunner
            gameId={activeGame}
            onClose={() => setActiveGame(null)}
            scenarios={SWIPE_SCENARIOS[activeGame as keyof typeof SWIPE_SCENARIOS] || SWIPE_SCENARIOS.boundary}
            onSave={(s) => saveScore(activeGame, s)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeGameRunner({ gameId, onClose, scenarios, onSave }: { gameId: string, onClose: () => void, scenarios: any[], onSave: (s: number) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const background = useTransform(x, [-200, 0, 200], ["rgba(239, 68, 68, 0.2)", "rgba(15, 23, 42, 1)", "rgba(34, 197, 94, 0.2)"]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) completeSwipe('right');
    else if (info.offset.x < -100) completeSwipe('left');
  };

  const completeSwipe = (dir: 'left' | 'right') => {
    const current = scenarios[index];
    const effect = dir === 'left' ? current.leftEffect : current.rightEffect;
    setScore(prev => prev + effect.pt);
    setFeedback(effect.feedback);

    setTimeout(() => {
      setFeedback(null);
      if (index < scenarios.length - 1) {
        setIndex(prev => prev + 1);
        x.set(0);
      } else {
        setFinished(true);
        onSave(score + effect.pt);
      }
    }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-md relative flex flex-col items-center justify-center h-[600px]">
        <button onClick={onClose} className="absolute top-0 right-0 text-slate-500 hover:text-white p-4 z-50 font-bold">ÇIKIŞ</button>

        {!finished ? (
          <>
            <div className="absolute top-4 w-full text-center z-10">
              <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-widest">{gameId === 'boundary' ? 'Sınır Hattı' : 'Gelecek'}</h2>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${((index) / scenarios.length) * 100}%` }} />
              </div>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-2xl shadow-2xl">{feedback}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative w-full h-[400px]">
              {index < scenarios.length - 1 && <div className="absolute inset-0 bg-slate-800 rounded-3xl transform scale-95 translate-y-4 opacity-50" />}
              <motion.div
                style={{ x, rotate, background }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
              >
                <div className="text-6xl mb-6">🃏</div>
                <h3 className="text-2xl font-bold text-white selection:bg-none select-none">{scenarios[index].text}</h3>
                <div className="absolute bottom-8 w-full px-8 flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span className="text-red-400">← {scenarios[index].leftLabel}</span>
                  <span className="text-green-400">{scenarios[index].rightLabel} →</span>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center p-8 bg-slate-900 border border-white/10 rounded-3xl w-full">
            <Confetti numberOfPieces={200} recycle={false} />
            <h2 className="text-3xl font-black text-white mb-4">Tamamlandı!</h2>
            <div className="text-6xl font-black text-blue-400 mb-6">{score}</div>
            <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl">Menüye Dön</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}