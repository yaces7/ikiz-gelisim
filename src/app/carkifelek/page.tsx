
'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import api from '../lib/api';

const weeklyActivities: Record<number, { name: string, color: string, icon: string, desc: string }[]> = {
  1: [
    { name: 'Ayna Karşısında', color: '#6366f1', icon: '🪞', desc: 'Aynada kendine bak ve sadece sana ait olan 3 fiziksel özelliği sesli söyle.' },
    { name: 'Kıyafet Seçimi', color: '#ec4899', icon: '👕', desc: 'Bugün kimseye sormadan, tamamen kendi istediğin kombini oluştur.' },
    { name: 'Hobini Keşfet', color: '#8b5cf6', icon: '🎨', desc: 'Daha önce denemediğin bir sanat dalını 15 dakika araştır.' },
    { name: 'Bağımsız Karar', color: '#10b981', icon: '⚖️', desc: 'Gün içinde en az bir küçük kararı ikizine danışmadan tek başına al.' },
  ],
  2: [
    { name: 'Özel Köşe', color: '#f59e0b', icon: '🏠', desc: 'Odanın bir kısmını sadece kendi eşyalarınla düzenle.' },
    { name: 'Hayır Diyebilmek', color: '#3b82f6', icon: '🛡️', desc: 'Bugün sınırlarını ihlal eden birine nazikçe ama net bir hayır de.' },
    { name: 'Farklı Arkadaş', color: '#14b8a6', icon: '👥', desc: 'İkizinin tanımadığı veya pek konuşmadığı bir arkadaşına mesaj at.' },
    { name: 'Mahremiyet', color: '#f43f5e', icon: '🔐', desc: 'Günlüğüne sadece senin bildiğin bir sırrını yaz.' },
  ],
  3: [
    { name: 'Duygu Dedektifi', color: '#6366f1', icon: '🕵️', desc: 'Hissettiğin bir duygunun ikizinden mi geçtiğini yoksa senin mi olduğunu bul.' },
    { name: 'Kendi Başına', color: '#ec4899', icon: '🚶', desc: 'İkizin olmadan 15 dakikalık bir yürüyüşe çık.' },
    { name: 'Müzik Tercihi', color: '#8b5cf6', icon: '🎧', desc: 'İkizinin pek sevmediği ama senin sevdiğin bir albümü dinle.' },
    { name: 'Duygusal Sınır', color: '#10b981', icon: '🧱', desc: 'İkizin üzgünken onun duygusuna boğulmadan ona destek ol.' },
  ],
  4: [
    { name: 'Kendi Tempon', color: '#f59e0b', icon: '⏳', desc: 'Bugün ders çalışırken kendi odaklanma süreni belirle ve uygula.' },
    { name: 'Akademik İlgi', color: '#3b82f6', icon: '📚', desc: 'Sadece senin ilgi duyduğun bir bilimsel konuyu araştır.' },
    { name: 'Yeni Strateji', color: '#14b8a6', icon: '💡', desc: 'Zorlandığın bir problem için ikizine sormadan yeni bir çözüm dene.' },
    { name: 'Okuma Saati', color: '#f43f5e', icon: '📖', desc: 'Bireysel gelişim üzerine bir makale veya kitap oku.' },
  ],
  5: [
    { name: 'Ben Dili', color: '#6366f1', icon: '💬', desc: 'Tartışma anında "Sen böylesin" yerine "Ben şöyle hissediyorum" de.' },
    { name: 'Adil Paylaşım', color: '#ec4899', icon: '⚖️', desc: 'Ortak bir eşya için önceden yazılı bir kullanım kuralı koy.' },
    { name: 'Liderlik', color: '#8b5cf6', icon: '👑', desc: 'Grup içinde bir fikri ilk sen ortaya at ve savun.' },
    { name: 'Uzlaşma', color: '#10b981', icon: '🤝', desc: 'Farklı fikirde olduğunuz bir konuda ortak çözüm değil, orta yol bul.' },
  ],
  6: [
    { name: 'Gelecek Hayali', color: '#f59e0b', icon: '🚀', desc: '5 yıl sonra ikizinden ayrı bir şehirde olduğun başarılı bir anı hayal et.' },
    { name: 'Kariyer Planı', color: '#3b82f6', icon: '💼', desc: 'Hayalindeki mesleğin bir günlük iş rutinini araştır.' },
    { name: 'Vizyon Tahtası', color: '#14b8a6', icon: '🖼️', desc: 'Kendi hayallerini temsil eden 3 görsel bul ve telefonuna kaydet.' },
    { name: 'Özerklik Sözü', color: '#f43f5e', icon: '📜', desc: 'Kendine, her zaman kendi kararlarına güveneceğine dair bir not yaz.' },
  ]
};

export default function WheelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <WheelContent />
    </Suspense>
  );
}

function WheelContent() {
  const { user } = useAuth();
  const currentWeek = user?.active_week || 1;
  const currentActivities = weeklyActivities[currentWeek] || weeklyActivities[1];

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<typeof currentActivities[0] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Added: Save Function
  const saveActivity = async () => {
    if (!selectedActivity) return;

    const activityToSave = selectedActivity; // capture closure
    setSelectedActivity(null); // Close modal immediately for UX

    try {
      await api.post('/api/profile/complete-task', {
        taskIndex: currentActivities.indexOf(activityToSave),
        taskContent: activityToSave.name
      });
      alert("Görev kabul edildi ve profiline kaydedildi! Başarılar.");
    } catch (e) {
      console.error("Activity Save Failed", e);
    }
  };

  const spinWheel = () => {
    if (spinning) return;

    setSelectedActivity(null);
    setShowConfetti(false);
    setSpinning(true);

    const randomOffset = Math.random() * 360;
    const newRotation = rotation + 1440 + randomOffset; // 4 full spins + offset
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const normalizedRotation = newRotation % 360;
      const segmentSize = 360 / currentActivities.length;
      const index = Math.floor((360 - normalizedRotation) / segmentSize) % currentActivities.length;

      setSelectedActivity(currentActivities[index]);
      setShowConfetti(true);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {showConfetti && <Confetti numberOfPieces={200} recycle={false} colors={['#6366f1', '#ec4899', '#10b981']} />}

      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Günlük Odak Çarkı
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Bugünün gelişim hedefini belirlemek için çarkı çevir. <br />
            {!user && <span className="text-yellow-500/80 text-sm">(Sonuçları kaydetmek için giriş yapmalısın)</span>}
          </p>
        </div>

        <div className="relative flex flex-col items-center gap-10">
          <div className="relative group">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
              <div className="w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center border-4 border-slate-900">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-blue-600 translate-y-1" />
              </div>
            </div>

            <div className="relative p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
              <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.15, 0, 0.2, 1] }}
                className="w-[320px] h-[320px] md:w-[450px] md:h-[450px] rounded-full relative overflow-hidden"
                style={{
                  boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
                  background: `conic-gradient(${currentActivities.map((item, i) =>
                    `${item.color} ${i * (100 / currentActivities.length)}% ${(i + 1) * (100 / currentActivities.length)}%`
                  ).join(', ')})`
                }}
              >
                {currentActivities.map((item, i) => {
                  const angle = (360 / currentActivities.length) * i + (360 / currentActivities.length / 2);
                  return (
                    <div
                      key={i}
                      className="absolute top-0 left-0 w-full h-full flex flex-col items-center pt-8 md:pt-12 pointer-events-none"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <span
                        className="text-2xl md:text-3xl filter drop-shadow-md transform -rotate-90"
                        style={{ transform: `rotate(${-angle}deg)` }}
                      >
                        {item.icon}
                      </span>
                      <span
                        className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mt-2 px-1 text-center max-w-[80px]"
                        style={{ transform: `rotate(${-angle}deg)`, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {item.name}
                      </span>
                    </div>
                  )
                })}

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-2xl z-20">
                  <span className="text-2xl">🎯</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 z-20">
            <button
              onClick={spinWheel}
              disabled={spinning}
              className={`
                px-10 py-4 rounded-2xl font-bold text-xl transition-all transform
                ${spinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95'
                }
              `}
            >
              {spinning ? 'Belirleniyor...' : 'Görevi Belirle'}
            </button>

            {!user && (
              <Link href="/giris" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Giriş yap
              </Link>
            )}
          </div>

        </div>

        <AnimatePresence>
          {selectedActivity && !spinning && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedActivity(null)}
            >
              <div
                className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute top-0 left-0 w-full h-2"
                  style={{ backgroundColor: selectedActivity.color }}
                />

                <div className="text-center space-y-6">
                  <div
                    className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-6xl shadow-xl mb-4"
                    style={{ backgroundColor: `${selectedActivity.color}20`, border: `2px solid ${selectedActivity.color}` }}
                  >
                    {selectedActivity.icon}
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedActivity.name}</h2>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedActivity.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={saveActivity}
                      className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Kabul Et
                    </button>
                    {!user && (
                      <p className="mt-4 text-xs text-slate-500">
                        (Bu aktiviteyi profilinize kaydetmek için giriş yapmalısınız)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}