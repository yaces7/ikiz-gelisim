
'use client';

import { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { weeksContent } from './data/topicContent';
import { useAuth } from './context/AuthContext';

// Dynamic imports for heavy components
const ParticleBackground = dynamic(() => import('./components/ParticleBackground'), { ssr: false });
const ChoiceEngine = dynamic(() => import('./components/ChoiceEngine'), { ssr: false });
const InsightDashboard = dynamic(() => import('./components/InsightDashboard'), { ssr: false });

const topicImages: Record<string, string> = {
  'kimlik-gelisimi': '/images/identy.jpg',
  'sosyal-iliskiler': '/images/social.jpg',
  'duygusal-gelisim': '/images/emotional.jpg',
  'akademik-gelisim': '/images/academic.jpg',
  'catisma-cozumu': '/images/emotional.jpg',
  'gelecek-planlamasi': '/images/identy.jpg'
};

const topicAlts: Record<string, string> = {
  'kimlik-gelisimi': 'İkizlerin bireysel kimlik gelişimini gösteren fotoğraf',
  'sosyal-iliskiler': 'İkizlerin sosyal etkileşimlerini gösteren fotoğraf',
  'duygusal-gelisim': 'İkizlerin duygusal gelişimini temsil eden fotoğraf',
  'akademik-gelisim': 'İkizlerin akademik çalışmalarını gösteren fotoğraf',
  'catisma-cozumu': 'Kardeşler arası çatışma çözümü',
  'gelecek-planlamasi': 'Gelecek planlaması yapan gençler'
};

export default function Home() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [progressionWeek, setProgressionWeek] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetch('/api/progression/check', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setProgressionWeek(data.week);
        })
        .catch(err => console.error("Progression fetch error", err));
    }
  }, [user]);

  const selectedTopic = weeksContent.find(w => w.id === selectedTopicId);

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* 3D Background */}
      {/* 3D Background */}
      <div className="fixed inset-0 -z-10">
        <ParticleBackground />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-12 space-y-32">

        {/* Massive Hero Section */}
        <section className="text-center space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[100px] rounded-full -z-10 animate-pulse"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              İKİZ<br />GELİŞİM
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl md:text-3xl font-light text-gray-200 max-w-4xl mx-auto leading-relaxed"
          >
            Bilimsel veri, yapay zeka ve <span className="font-bold text-blue-400">bireyselleşme yolculuğu</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-6 mt-12"
          >
            <a href="#modules" className="px-8 py-4 bg-white text-black rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Keşfetmeye Başla
            </a>
            <a href="/kayit" className="px-8 py-4 bg-transparent border-2 border-gray-400 text-white rounded-full text-lg font-bold hover:bg-white/10 transition-colors">
              Araştırmaya Katıl
            </a>
          </motion.div>
        </section>

        {/* Modules Grid */}
        <div id="modules" className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Choice Engine Module */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <ChoiceEngine />
          </motion.div>

          {/* Insight Dashboard Module */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <InsightDashboard />
          </motion.div>
        </div>

        {/* Topics Section (6-Week Scheduler) */}
        <section>
          <h2 className="text-4xl font-bold text-center mb-12">6 Haftalık Gelişim Programı</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeksContent.map((week, index) => {
              // Lock logic: If no user, lock everything > Week 1. If user, lock > progressionWeek.
              const isLocked = user ? (week.week > progressionWeek) : (week.week > 1);

              return (
                <motion.div
                  key={week.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`glass rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer relative group ${isLocked ? 'grayscale opacity-70' : ''}`}
                  onClick={() => !isLocked && setSelectedTopicId(week.id)}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/50 backdrop-blur-[2px]">
                      <svg className="w-16 h-16 text-white/80 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-white font-bold tracking-wider">KİLİTLİ</span>
                      {!user && <span className="text-gray-300 text-xs mt-1">Giriş Yapmalısınız</span>}
                    </div>
                  )}

                  <div className="relative h-48">
                    <Image
                      src={topicImages[week.id] || topicImages['kimlik-gelisimi']}
                      alt={topicAlts[week.id] || "Görsel"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      HAFTA {week.week}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{week.title}</h3>
                    <p className="text-sm opacity-80 line-clamp-3">
                      {week.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modal View */}
      {selectedTopic && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTopicId(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTopicId(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative h-72 mb-8 rounded-xl overflow-hidden">
              <Image
                src={topicImages[selectedTopic.id]}
                alt={topicAlts[selectedTopic.id]}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400">
              {selectedTopic.title}
            </h2>
            <div className="prose prose-lg dark:prose-invert">
              {selectedTopic.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

