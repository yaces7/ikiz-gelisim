'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function JournalPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [entry, setEntry] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
    }
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    if (!entry.trim() || !user) return;
    setAnalyzing(true);

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id, // Use Real User ID
          content: entry
        })
      });
      const data = await res.json();

      setTimeout(() => {
        setResult(data.analysis);
        setAnalyzing(false);
        setSaved(true);
      }, 1000); // Animation delay
    } catch (e) {
      console.error(e);
      setAnalyzing(false);
    }
  };

  if (!user) return null; // Or a loading spinner


  return (
    <div className="min-h-screen pt-24 px-4 pb-12 flex flex-col items-center">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
      >
        Dijital Günlük
      </motion.h1>
      <p className="text-gray-500 mb-8 dark:text-gray-400">Duygularını, düşüncelerini ve ikizlinle olan anılarını buraya dök.</p>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Writing Area */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass p-6 rounded-2xl relative"
        >
          <div className="absolute top-4 right-4 text-xs text-gray-400">
            {entry.split(' ').length} words
          </div>
          <textarea
            className="w-full h-80 bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none"
            placeholder="Bugün nasıl hissettin? Özellikle 'ben' ve 'biz' kavramları üzerine düşün..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            disabled={saved}
          />
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={analyzing || !entry.trim()}
              className="absolute bottom-6 right-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <span className="animate-spin text-xl">↻</span>
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <span>Kaydet</span>
                  <span>✉</span>
                </>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bottom-6 right-6 text-green-500 font-bold flex items-center gap-2"
            >
              <span>✓ Kaydedildi</span>
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          <AnimatePresence>
            {saved && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass p-6 rounded-2xl border-l-4 border-purple-500"
              >
                <h3 className="text-xl font-bold mb-4">Yapay Zeka Analizi</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ben Odaklı</p>
                    <p className="text-3xl font-bold text-blue-500">%{Math.round(result.me_ratio * 100)}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Biz Odaklı</p>
                    <p className="text-3xl font-bold text-orange-500">%{Math.round(result.we_ratio * 100)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    "{result.analysis_note === 'High Dependency Risk'
                      ? 'Yazdıklarında "Biz" kavramı oldukça yoğun. Bireysel sınırlarını güçlendirmek için kendi hobilerine daha fazla vakit ayırabilirsin.'
                      : 'Dengeli bir benlik algısı sergiliyorsun. Duygularını ifade etme şeklin oldukça sağlıklı.'}"
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${result.sentiment * 10}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-gray-400">Duygu Durumu Skoru: {result.sentiment}/10</p>
                </div>
              </motion.div>
            )}

            {/* Placeholder / History if needed */}
            {!saved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center"
              >
                <p>Henüz bir analiz yok. Yazını tamamlayıp kaydettiğinde yapay zeka buraya içgörülerini ekleyecek.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}