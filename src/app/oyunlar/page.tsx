'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const games = [
  {
    id: 'boundary',
    title: 'Sınır Hattı',
    subtitle: 'Özel Alanını Koru',
    description: 'Odanı ve özel eşyalarını koruman gereken durumlarda nasıl tepki vereceğini seç. Sınırlarını korumayı öğren.',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    metric: 'boundary_score'
  },
  {
    id: 'mirror',
    title: 'Aynadaki Fark',
    subtitle: 'Benzersiz Yönlerini Keşfet',
    description: 'İkizinle ortak özellikler arasında kaybolma. Sadece sana ait olan karakteristik özellikleri bul ve yakala.',
    icon: '🪞',
    color: 'from-purple-500 to-pink-500',
    metric: 'individuality_score'
  },
  {
    id: 'social',
    title: 'Sosyal Labirent',
    subtitle: 'Kendi Çevreni Kur',
    description: 'Sosyal ortamlarda ikizin olmadan nasıl hareket edersin? Kendi arkadaş grubunu kurmak için doğru kararları ver.',
    icon: '🧩',
    color: 'from-emerald-500 to-green-500',
    metric: 'social_autonomy'
  },
  {
    id: 'diplomacy',
    title: 'Mutfak Diplomasisi',
    subtitle: 'Aile İletişimi',
    description: 'Ebeveynlerinle isteklerin hakkında konuş. Doğru iletişim dilini kullanarak kendini ifade et.',
    icon: '🗣️',
    color: 'from-orange-500 to-amber-500',
    metric: 'family_sync'
  },
  {
    id: 'future',
    title: 'Gelecek Vizyonu',
    subtitle: '10 Yıl Sonra Sen',
    description: 'Kendi geleceğini inşa et. Kariyer, hobi ve yaşam tarzı kartlarını seçerek özgün bir yol haritası çiz.',
    icon: '🚀',
    color: 'from-indigo-500 to-violet-500',
    metric: 'future_identity'
  }
];

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
            Gelişim Oyunları
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Bireyselleşme yolculuğunu eğlenceli ve interaktif simülasyonlarla pekiştir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color}`} />
              <div className="p-8 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {game.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">{game.subtitle}</h4>
                <p className="text-slate-400 leading-relaxed mb-8 flex-grow">
                  {game.description}
                </p>
                <button
                  onClick={() => setActiveGame(game.id)}
                  className="w-full py-4 rounded-xl font-bold bg-white/5 text-white hover:bg-white hover:text-slate-900 transition-all border border-white/10 group-hover:border-transparent"
                >
                  Oyunu Başlat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Game Modal */}
      <AnimatePresence>
        {activeGame && (
          <GameRunner
            gameId={activeGame}
            onClose={() => setActiveGame(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const SCENARIOS = {
  boundary: [
    { text: 'İkizin odana izinsiz girdi ve günlüğünü okumaya çalışıyor.', options: [{ txt: 'Sessiz kalırım', pt: 0 }, { txt: 'Kızarım ama anlatmam', pt: 50 }, { txt: 'Bunun özelim olduğunu söylerim', pt: 100 }] },
    { text: 'Arkadaşlarınla buluşacaksın, ikizin de gelmek istiyor.', options: [{ txt: 'Mecburen kabul ederim', pt: 0 }, { txt: 'Gelmemesi gerektiğini açıklarım', pt: 100 }] },
    { text: 'İkizin senin en sevdiğin kazağını sormadan giymiş.', options: [{ txt: 'Görmezden gelirim', pt: 0 }, { txt: 'Çıkarmasını isterim', pt: 100 }, { txt: 'Bir dahaki sefere sormasını söylerim', pt: 70 }] },
    { text: 'Ebeveynin ikinizi kıyaslıyor: "Kardeşin gibi çalışkan ol."', options: [{ txt: 'Üzülüp susarım', pt: 0 }, { txt: 'Herkesin farklı olduğunu söylerim', pt: 100 }, { txt: 'Tartışma çıkarırım', pt: 40 }] },
    { text: 'İkizin senin adına bir daveti kabul etmiş.', options: [{ txt: 'Gitmek zorunda hissederim', pt: 0 }, { txt: 'Kararları benim vermem gerektiğini söylerim', pt: 100 }] },
    { text: 'Telefonda konuşurken ikizin seni dinliyor.', options: [{ txt: 'Rahatsız olsam da devam ederim', pt: 20 }, { txt: 'Odayı terk ederim veya uyarırım', pt: 100 }] },
    { text: 'İkinize ortak bir hediye alındı ama sen sevmedin.', options: [{ txt: 'Beğenmiş gibi yaparım', pt: 0 }, { txt: 'Teşekkür edip fikrimi belirtirim', pt: 100 }] },
    { text: 'İkizin saçını seninle aynı modele kestirmek istiyor.', options: [{ txt: 'İzin veririm', pt: 50 }, { txt: 'Rahatsız olacağımı söylerim', pt: 100 }] },
    { text: 'Biri isminizi karıştırınca ikizin düzeltmiyor.', options: [{ txt: 'Ben de düzeltmem', pt: 0 }, { txt: 'Hemen doğrusunu söylerim', pt: 100 }] },
    { text: 'İkizin senin arkadaş grubuna dahil olmaya çalışıyor.', options: [{ txt: 'Herkesle iyi anlaşsın isterim', pt: 40 }, { txt: 'Bazen ayrı takılmak istediğimi belirtirim', pt: 100 }] }
  ],
  mirror: [
    { text: 'Hangi özellik SADECE sana ait?', options: [{ txt: 'Piyano çalmak (İkizin de çalıyor)', pt: 0 }, { txt: 'Yazılım yapmak (İkizin ilgilenmiyor)', pt: 100 }] },
    { text: 'Kıyafet seçimi:', options: [{ txt: 'İkizimle uyumlu giyinmek', pt: 0 }, { txt: 'Kendi tarzımı oluşturmak', pt: 100 }] },
    { text: 'Hangi yemek senin favorin (İkizinden farklı)?', options: [{ txt: 'Mantı (İkizim de sever)', pt: 0 }, { txt: 'Sushi (İkizim sevmez)', pt: 100 }] },
    { text: 'Gelecek hayalin ne?', options: [{ txt: 'İkizimle aynı üniversiteye gitmek', pt: 20 }, { txt: 'Kendi ilgi alanıma göre bir bölüm seçmek', pt: 100 }] },
    { text: 'Müzik zevkin nasıl?', options: [{ txt: 'İkizimin listesini dinlerim', pt: 0 }, { txt: 'Kendi keşfettiğim grupları dinlerim', pt: 100 }] },
    { text: 'Film izlerken:', options: [{ txt: 'Hep ortak karar veririz', pt: 40 }, { txt: 'Bazen yalnız izlemeyi severim', pt: 100 }] },
    { text: 'Sosyal medyada:', options: [{ txt: 'Ortak hesap kullanırız', pt: 0 }, { txt: 'Kendi profilimi yönetirim', pt: 100 }] }
  ],
  social: [
    { text: 'Partiye davetlisin ama ikizin hasta. Ne yaparsın?', options: [{ txt: 'Ben de gitmem', pt: 0 }, { txt: 'Onun için üzülürüm ama giderim', pt: 100 }] },
    { text: 'Yeni bir kursa başlamak istiyorsun, ikizin istemiyor.', options: [{ txt: 'Vazgeçerim', pt: 0 }, { txt: 'Yalnız kayıt olurum', pt: 100 }] },
    { text: 'Arkadaşın sana bir sır verdi ve "ikizine söyleme" dedi.', options: [{ txt: 'İkizime söylerim, bizden sır çıkmaz', pt: 0 }, { txt: 'Sözümü tutarım', pt: 100 }] }
  ],
  diplomacy: [
    { text: 'Anneniz: "Neden kardeşin gibi tıp istemiyorsun?"', options: [{ txt: 'Sessiz kalırım', pt: 0 }, { txt: "Benim ilgi alanım farklı anne", pt: 100 }, { txt: "Siz beni sevmiyorsunuz", pt: 20 }] },
    { text: 'Baba: "Hafta sonu hep beraber pikniğe gidiyoruz." (Planın vardı)', options: [{ txt: 'Planımı iptal ederim', pt: 20 }, { txt: 'Önceden planım olduğunu uygun dille anlatırım', pt: 100 }] }
  ],
  future: [
    { text: '10 yıl sonra nerede yaşıyorsun?', options: [{ txt: 'İkizimle aynı evde', pt: 20 }, { txt: 'Kendi kurduğum yaşam alanında', pt: 100 }] },
    { text: 'Kariyer hedefin:', options: [{ txt: 'Aile mesleğini devam ettirmek (İkizimle)', pt: 40 }, { txt: 'Kendi tutkularımın peşinden gitmek', pt: 100 }] }
  ]
};

function GameRunner({ gameId, onClose }: { gameId: string, onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Pick 5 random scenarios on mount
  const [scenarios] = useState(() => {
    const pool = SCENARIOS[gameId as keyof typeof SCENARIOS] || SCENARIOS.boundary;
    // Simple shuffle and slice
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5); // Take 5 random questions
  });

  const currentStep = scenarios[step];

  const handleOption = (points: number) => {
    const newScore = score + points;
    if (step < scenarios.length - 1) {
      setScore(newScore);
      setStep(step + 1);
    } else {
      setScore(newScore);
      setFinished(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl p-2 z-20">✕</button>

        {!finished ? (
          <div className="p-8 md:p-12 space-y-8">
            <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-widest">
              <span>{activeGameTitle(gameId)}</span>
              <span>Aşama {step + 1} / {scenarios.length}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight min-h-[100px] flex items-center">
              {currentStep?.text}
            </h2>

            <div className="grid gap-4 mt-8">
              {currentStep?.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(opt.pt)}
                  className="p-6 text-left bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-blue-500/50 rounded-xl transition-all font-medium text-lg text-slate-200"
                >
                  {opt.txt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Confetti numberOfPieces={200} recycle={false} />
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-black text-white mb-4">Oyun Tamamlandı!</h2>
            <p className="text-xl text-slate-400 mb-8">
              Toplanan Puan: <span className="text-blue-400 font-bold">{score}</span>
            </p>

            <div className="w-64 h-64 mb-8">
              <Radar
                data={{
                  labels: ['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık'],
                  datasets: [{
                    label: 'Gelişim Analizi',
                    data: [
                      score > 300 ? 90 : 60,
                      gameId === 'boundary' ? (score / 500) * 100 : 70,
                      gameId === 'diplomacy' ? (score / 500) * 100 : 65,
                      85,
                      75
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                  }]
                }}
                options={{
                  scales: {
                    r: {
                      beginAtZero: true,
                      angleLines: { color: 'rgba(255,255,255,0.1)' },
                      grid: { color: 'rgba(255,255,255,0.1)' },
                      pointLabels: { color: '#94a3b8' },
                      ticks: { display: false }
                    }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
            >
              Menüye Dön
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function activeGameTitle(id: string) {
  const g = games.find(g => g.id === id);
  return g ? g.title : 'Oyun';
}