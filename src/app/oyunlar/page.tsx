
'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import dynamic from 'next/dynamic';

const ReflexGame = dynamic(() => import('../components/games/ReflexGame'), { ssr: false });
const ChatGame = dynamic(() => import('../components/games/ChatGame'), { ssr: false });
const ChoiceEngine = dynamic(() => import('../components/ChoiceEngine'), { ssr: false });

// --- GAME CONFIG ---
const GAMES_DATA: Record<string, { title: string, subtitle: string, instruction: string, icon: string, color: string, type: 'swipe' | 'reflex' | 'chat' | 'choice' }> = {
  boundary: {
    title: 'Sınır Hattı',
    subtitle: 'Özel Alan Savunması',
    instruction: 'Kartları sola veya sağa kaydırarak sınır koyma pratiği yap.',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    type: 'swipe'
  },
  mirror: {
    title: 'Aynadaki Fark',
    subtitle: 'Kim Sen, Kim O?',
    instruction: 'Ekranda beliren kelimelerden sadece SENİN olanlara tıkla!',
    icon: '🪞',
    color: 'from-purple-500 to-pink-500',
    type: 'reflex'
  },
  social: {
    title: 'Sosyal Labirent',
    subtitle: 'Doğru Seçim',
    instruction: 'Farklı sosyal senaryolarda en uygun tepkiyi ver.',
    icon: '🧩',
    color: 'from-emerald-500 to-green-500',
    type: 'choice'
  },
  diplomacy: {
    title: 'Mutfak Diplomasisi',
    subtitle: 'Aile İletişimi',
    instruction: 'Aile üyeleriyle mesajlaşırken doğru cevapları seç.',
    icon: '🗣️',
    color: 'from-orange-500 to-amber-500',
    type: 'chat'
  },
  future: {
    title: 'Gelecek Vizyonu',
    subtitle: 'Kariyer ve Hedefler',
    instruction: 'Gelecek planları için kararlar ver.',
    icon: '🚀',
    color: 'from-indigo-500 to-violet-500',
    type: 'swipe'
  }
};

// --- SWIPE GAME SCENARIOS (Rich Content) ---
const SWIPE_SCENARIOS = {
  boundary: [
    { id: 1, text: 'İkizin izinsiz odana girdi ve eşyalarını karıştırıyor.', leftLabel: '🛑 Dur De', rightLabel: '🤷 Görmezden Gel', leftEffect: { pt: 25, feedback: 'Sınır koydun! ✓' }, rightEffect: { pt: -10, feedback: 'Sınır ihlali...' } },
    { id: 2, text: 'Günlüğünü okumak istiyor. "Sadece bir göz atayım" diyor.', leftLabel: '🚫 Özel!', rightLabel: '📖 Tamam', leftEffect: { pt: 30, feedback: 'Mahremiyetini korudun!' }, rightEffect: { pt: -20, feedback: 'Özel alanın ihlal edildi.' } },
    { id: 3, text: 'Telefon şifreni soruyor, "Aramızda sır mı var?" diyor.', leftLabel: '🔐 Hayır', rightLabel: '🔓 Söyle', leftEffect: { pt: 25, feedback: 'Dijital sınırlarını korudun!' }, rightEffect: { pt: -15, feedback: 'Özel bilgi paylaştın.' } },
    { id: 4, text: 'Arkadaşlarınla buluşmaya "Ben de geleyim" diyor.', leftLabel: '👤 Tek Gideceğim', rightLabel: '👥 Gel', leftEffect: { pt: 20, feedback: 'Kendi sosyal alanını korudun!' }, rightEffect: { pt: 5, feedback: 'Paylaşıma açıksın.' } },
    { id: 5, text: 'Anne "Her şeyi ikizinle paylaşın" diyor. Sen farklı düşünüyorsun.', leftLabel: '🗣️ Açıkla', rightLabel: '🤐 Sus', leftEffect: { pt: 30, feedback: 'Fikrini ifade ettin!' }, rightEffect: { pt: -5, feedback: 'Sessiz kaldın.' } },
    { id: 6, text: 'İkizin kendi arkadaşlarına senden bahsetmeni istiyor.', leftLabel: '⏰ Sonra', rightLabel: '✅ Şimdi', leftEffect: { pt: 15, feedback: 'Kendi zamanlamanı seçtin.' }, rightEffect: { pt: 5, feedback: 'Yardımsever oldun.' } },
    { id: 7, text: 'Aynı okula mı farklı okula mı gitmelisiniz tartışması var.', leftLabel: '🏫 Farklı', rightLabel: '🏫 Aynı', leftEffect: { pt: 25, feedback: 'Bağımsızlık!' }, rightEffect: { pt: 0, feedback: 'Beraber olmayı seçtin.' } },
    { id: 8, text: 'Baba "Neden her şeyi ayrı yapıyorsunuz?" diye soruyor.', leftLabel: '💬 Açıkla', rightLabel: '😶 Geç', leftEffect: { pt: 20, feedback: 'İletişim kurdun!' }, rightEffect: { pt: -10, feedback: 'Fırsat kaçtı.' } },
    { id: 9, text: 'İkizin senin için karar veriyor: "Biz bunu sevmeyiz."', leftLabel: '🙋 Ben Severim!', rightLabel: '🙄 Neyse', leftEffect: { pt: 30, feedback: 'Kendi sesini çıkardın!' }, rightEffect: { pt: -15, feedback: 'Kimliğin belirsizleşti.' } },
    { id: 10, text: 'Öğretmen sizi ayırt edemiyor ve hep beraber değerlendiriyor.', leftLabel: '✋ Düzelt', rightLabel: '🤷 Olsun', leftEffect: { pt: 20, feedback: 'Bireysel kimliğini savundun!' }, rightEffect: { pt: -5, feedback: 'Durumu kabul ettin.' } },
    { id: 11, text: 'Doğum günü pastası tek mi iki ayrı mı olsun?', leftLabel: '🎂 Ayrı', rightLabel: '🎂 Tek', leftEffect: { pt: 15, feedback: 'Bireysel kutlama!' }, rightEffect: { pt: 5, feedback: 'Paylaşım.' } },
    { id: 12, text: 'İkizin sınav stresi yaşıyor, sen de aynı anda mı çalışmalısın?', leftLabel: '📚 Kendi Tempon', rightLabel: '📚 Beraber', leftEffect: { pt: 20, feedback: 'Kendi ritmin!' }, rightEffect: { pt: 5, feedback: 'Destek oldun.' } },
    { id: 13, text: 'Aile fotoğraflarında hep yan yana durmanız isteniyor.', leftLabel: '📷 Farklı Pozlar', rightLabel: '📷 Yan Yana', leftEffect: { pt: 15, feedback: 'Çeşitlilik!' }, rightEffect: { pt: 0, feedback: 'Gelenek.' } },
    { id: 14, text: 'İkizin hobi seçimine karışıyor: "Bu sana göre değil."', leftLabel: '🎨 Ben Karar Veririm', rightLabel: '😔 Vazgeç', leftEffect: { pt: 30, feedback: 'Özerklik!' }, rightEffect: { pt: -20, feedback: 'Kendi isteklerinden vazgeçtin.' } },
    { id: 15, text: 'Sınıfta "İkizler her şeyi aynı yapar" deniyor.', leftLabel: '❌ Hayır!', rightLabel: '😅 Eh...', leftEffect: { pt: 20, feedback: 'Kalıpyargıyı kırdın!' }, rightEffect: { pt: -10, feedback: 'Kalıpyargı güçlendi.' } },
    { id: 16, text: 'Farklı üniversite şehirleri düşünüyorsun, aile endişeli.', leftLabel: '🗺️ Keşfet', rightLabel: '🏠 Yakın Kal', leftEffect: { pt: 25, feedback: 'Cesaret!' }, rightEffect: { pt: 5, feedback: 'Güvenli seçim.' } },
    { id: 17, text: 'İkizin senin yerine konuşuyor toplantıda.', leftLabel: '🗣️ Sözü Al', rightLabel: '🤫 Bırak', leftEffect: { pt: 25, feedback: 'Kendi sesin!' }, rightEffect: { pt: -15, feedback: 'Pasif kaldın.' } },
    { id: 18, text: 'Aynı kıyafetleri giymek istemiyor musun?', leftLabel: '👕 Farklı Stil', rightLabel: '👕 Aynı', leftEffect: { pt: 15, feedback: 'Bireysel ifade!' }, rightEffect: { pt: 0, feedback: 'Uyum.' } },
    { id: 19, text: 'İkizin senden habersiz plan yapıp seni dahil etti.', leftLabel: '⚠️ Bildir', rightLabel: '🆗 Katıl', leftEffect: { pt: 20, feedback: 'Sınır belirledin!' }, rightEffect: { pt: -5, feedback: 'Durumu kabul ettin.' } },
    { id: 20, text: 'Kendi hayallerini mi yoksa "biz"in hayallerini mi takip edeceksin?', leftLabel: '⭐ Kendi', rightLabel: '👥 Bizim', leftEffect: { pt: 35, feedback: 'Bireyselleşme yolunda!' }, rightEffect: { pt: 0, feedback: 'Kolektif kimlik.' } }
  ],
  future: [
    { id: 1, text: 'Farklı bir şehirde üniversite okumak ister misin?', leftLabel: '✈️ Evet!', rightLabel: '🏠 Hayır', leftEffect: { pt: 25, feedback: 'Keşif ruhu!' }, rightEffect: { pt: 5, feedback: 'Güvenli bölge.' } },
    { id: 2, text: 'İkizinle aynı bölümü mü seçmelisiniz?', leftLabel: '📚 Farklı', rightLabel: '📚 Aynı', leftEffect: { pt: 30, feedback: 'Kendi yolun!' }, rightEffect: { pt: 0, feedback: 'Beraber.' } },
    { id: 3, text: 'Yeni bir hobi başlamak istiyorsun ama kimse desteklemiyor.', leftLabel: '🎯 Başla', rightLabel: '😔 Vazgeç', leftEffect: { pt: 25, feedback: 'Cesaret!' }, rightEffect: { pt: -15, feedback: 'Fırsat kaçtı.' } },
    { id: 4, text: 'Staj için yurtdışına gitme fırsatı var.', leftLabel: '🌍 Git', rightLabel: '🏠 Kal', leftEffect: { pt: 30, feedback: 'Deneyim!' }, rightEffect: { pt: 5, feedback: 'Konfor.' } },
    { id: 5, text: 'Kariyerinde risk mi almalısın yoksa güvenli yol mu?', leftLabel: '🎲 Risk', rightLabel: '🛡️ Güvenli', leftEffect: { pt: 20, feedback: 'Girişimci!' }, rightEffect: { pt: 10, feedback: 'Temkinli.' } },
    { id: 6, text: 'Kendi işini mi kurmalısın yoksa çalışan mı olmalısın?', leftLabel: '🚀 Girişimci', rightLabel: '💼 Çalışan', leftEffect: { pt: 25, feedback: 'Bağımsızlık!' }, rightEffect: { pt: 10, feedback: 'Stabilite.' } },
    { id: 7, text: 'Tutkunu mu takip etmelisin yoksa para getiren işi mi?', leftLabel: '❤️ Tutku', rightLabel: '💰 Para', leftEffect: { pt: 20, feedback: 'Anlam!' }, rightEffect: { pt: 15, feedback: 'Pratik.' } },
    { id: 8, text: 'Yeni insanlarla tanışmak için etkinliğe katıl.', leftLabel: '🤝 Katıl', rightLabel: '🏠 Evde Kal', leftEffect: { pt: 20, feedback: 'Sosyal gelişim!' }, rightEffect: { pt: -5, feedback: 'Fırsat kaçtı.' } },
    { id: 9, text: 'Liderlik pozisyonu teklif ediliyor.', leftLabel: '👑 Kabul', rightLabel: '🙅 Reddet', leftEffect: { pt: 25, feedback: 'Büyüme!' }, rightEffect: { pt: 0, feedback: 'Konfor alanı.' } },
    { id: 10, text: 'Yeni bir dil öğrenmek için zaman ayır.', leftLabel: '📖 Öğren', rightLabel: '⏰ Sonra', leftEffect: { pt: 20, feedback: 'Gelişim!' }, rightEffect: { pt: -5, feedback: 'Erteleme.' } },
    { id: 11, text: 'Hayalindeki meslek aile beklentilerinden farklı.', leftLabel: '⭐ Hayal', rightLabel: '👨‍👩‍👧 Aile', leftEffect: { pt: 30, feedback: 'Özerklik!' }, rightEffect: { pt: 5, feedback: 'Uyum.' } },
    { id: 12, text: 'Mentor aramak için adım at.', leftLabel: '🔍 Ara', rightLabel: '⏳ Bekle', leftEffect: { pt: 20, feedback: 'Proaktif!' }, rightEffect: { pt: -5, feedback: 'Pasif.' } },
    { id: 13, text: 'Konfor alanından çık ve yeni beceri öğren.', leftLabel: '📈 Öğren', rightLabel: '😌 Rahat', leftEffect: { pt: 25, feedback: 'Büyüme!' }, rightEffect: { pt: 0, feedback: 'Konfor.' } },
    { id: 14, text: 'Ekip çalışması mı bireysel çalışma mı?', leftLabel: '👤 Bireysel', rightLabel: '👥 Ekip', leftEffect: { pt: 15, feedback: 'Bağımsızlık!' }, rightEffect: { pt: 15, feedback: 'İşbirliği!' } },
    { id: 15, text: 'Hatalarından ders çıkarmak için zaman ayır.', leftLabel: '📝 Analiz Et', rightLabel: '⏭️ Geç', leftEffect: { pt: 20, feedback: 'Öğrenme!' }, rightEffect: { pt: -10, feedback: 'Fırsat kaçtı.' } },
    { id: 16, text: 'Yeni fikirleri denemekten korkma.', leftLabel: '💡 Dene', rightLabel: '🛑 Kork', leftEffect: { pt: 25, feedback: 'İnovasyon!' }, rightEffect: { pt: -10, feedback: 'Durgunluk.' } },
    { id: 17, text: 'Networking etkinliğine katıl.', leftLabel: '🤝 Git', rightLabel: '📱 Dijital', leftEffect: { pt: 20, feedback: 'Bağlantılar!' }, rightEffect: { pt: 10, feedback: 'Online.' } },
    { id: 18, text: 'Portfolio hazırlamaya başla.', leftLabel: '📁 Başla', rightLabel: '⏰ Sonra', leftEffect: { pt: 20, feedback: 'Hazırlık!' }, rightEffect: { pt: -5, feedback: 'Erteleme.' } },
    { id: 19, text: 'Geri bildirim al ve kendini geliştir.', leftLabel: '👂 Dinle', rightLabel: '🙉 Reddet', leftEffect: { pt: 25, feedback: 'Gelişim!' }, rightEffect: { pt: -15, feedback: 'Kapandın.' } },
    { id: 20, text: 'Uzun vadeli hedef mi kısa vadeli kazanç mı?', leftLabel: '🎯 Uzun Vade', rightLabel: '💵 Kısa Vade', leftEffect: { pt: 25, feedback: 'Stratejik!' }, rightEffect: { pt: 10, feedback: 'Anlık.' } }
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
          <p className="text-slate-400">Oyunlara erişmek için giriş yapmalısınız.</p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Oyun Alanı</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Bireyselleşme yolculuğunu oyunlaştır. Her oyun seni geliştirir.</p>
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
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">{game.subtitle}</h4>
                <p className="text-slate-400 leading-relaxed mb-8 flex-grow text-sm">{game.instruction}</p>
                <button
                  onClick={() => setActiveGame(key)}
                  className={`w-full py-4 rounded-xl font-bold bg-gradient-to-r ${game.color} text-white hover:opacity-90 transition-all shadow-lg`}
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
            <button onClick={() => setActiveGame(null)} className="absolute top-4 right-4 text-white font-bold z-50 p-4 text-xl">✕ KAPAT</button>
            <ChoiceEngine />
          </div>
        )}
        {(activeGame === 'boundary' || activeGame === 'future') && (
          <SwipeGameRunner
            gameId={activeGame}
            onClose={() => setActiveGame(null)}
            scenarios={SWIPE_SCENARIOS[activeGame as keyof typeof SWIPE_SCENARIOS]}
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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 100], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) completeSwipe('right');
    else if (info.offset.x < -100) completeSwipe('left');
  };

  const completeSwipe = (dir: 'left' | 'right') => {
    const current = scenarios[index];
    const effect = dir === 'left' ? current.leftEffect : current.rightEffect;
    const newScore = score + effect.pt;
    setScore(newScore);
    setFeedback(effect.feedback);

    setTimeout(() => {
      setFeedback(null);
      if (index < scenarios.length - 1) {
        setIndex(prev => prev + 1);
        x.set(0);
      } else {
        setFinished(true);
        onSave(newScore);
      }
    }, 800);
  };

  const gameTitle = gameId === 'boundary' ? 'Sınır Hattı' : 'Gelecek Vizyonu';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-md relative flex flex-col items-center justify-center h-[650px]">
        <button onClick={onClose} className="absolute top-0 right-0 text-slate-500 hover:text-white p-4 z-50 font-bold text-xl">✕</button>

        {!finished ? (
          <>
            <div className="absolute top-4 w-full text-center z-10">
              <h2 className="text-2xl font-bold text-white mb-1">{gameTitle}</h2>
              <p className="text-slate-400 text-sm mb-3">Soru {index + 1} / {scenarios.length}</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" initial={{ width: 0 }} animate={{ width: `${((index) / scenarios.length) * 100}%` }} />
              </div>
              <p className="text-blue-400 font-bold mt-2">Puan: {score}</p>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                  <div className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xl shadow-2xl">{feedback}</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative w-full h-[400px] mt-20">
              {index < scenarios.length - 1 && <div className="absolute inset-0 bg-slate-800/50 rounded-3xl transform scale-95 translate-y-4" />}
              <motion.div
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl cursor-grab active:cursor-grabbing"
              >
                {/* Swipe Indicators */}
                <motion.div style={{ opacity: leftOpacity }} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 font-bold text-lg">🛑</motion.div>
                <motion.div style={{ opacity: rightOpacity }} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 font-bold text-lg">✅</motion.div>

                <h3 className="text-xl font-bold text-white leading-relaxed px-4">{scenarios[index].text}</h3>

                <div className="absolute bottom-6 w-full px-6 flex justify-between text-xs font-bold">
                  <span className="text-red-400 bg-red-500/20 px-3 py-2 rounded-lg">← {scenarios[index].leftLabel}</span>
                  <span className="text-green-400 bg-green-500/20 px-3 py-2 rounded-lg">{scenarios[index].rightLabel} →</span>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center p-8 bg-slate-900 border border-white/10 rounded-3xl w-full">
            <Confetti numberOfPieces={200} recycle={false} />
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-black text-white mb-2">Tamamlandı!</h2>
            <p className="text-slate-400 mb-6">{scenarios.length} sorunun tamamını bitirdin.</p>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">{score} Puan</div>
            <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition">Menüye Dön</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}