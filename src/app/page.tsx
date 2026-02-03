
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { weeksContent } from './data/topicContent';
import { useAuth } from './context/AuthContext';
import Link from 'next/link';

// Dynamic imports with specific loading behavior
const ParticleBackground = dynamic(() => import('./components/ParticleBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-slate-950 -z-50" />
});
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">

      {/* 1. BACKGROUND LAYERS */}
      {/* Fixed gradient fallback */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-950 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Particles Layer */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <ParticleBackground />
      </div>

      {/* 2. SCROLLABLE SKELETON */}
      <div className="relative" style={{ zIndex: 10 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

          {/* HERO SECTION */}
          <section className="min-h-[80vh] md:min-h-[90vh] flex flex-col items-center justify-center text-center pt-24 md:pt-20">

            <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-700">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white drop-shadow-2xl">
                İKİZ<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  GELİŞİM
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-3xl text-slate-300 font-light leading-relaxed px-4">
                Yapay zeka destekli, kişiselleştirilmiş <br className="hidden md:block" />
                <span className="font-semibold text-white">bireyselleşme ve gelişim platformu</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-6">
                <a
                  href="#modules"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
                >
                  Keşfetmeye Başla
                </a>
                <Link href="/kayit" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white rounded-xl font-bold text-lg transition-all hover:bg-slate-800/50 flex items-center justify-center">
                  Kayıt Ol
                </Link>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-6 md:bottom-10 animate-bounce text-slate-500 hidden sm:block">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* MAIN MODULES GRID */}
          <div id="modules" className="py-12 md:py-20 scroll-mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              <div className="bg-slate-900/50 backdrop-blur-sm p-1 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-colors">
                <ChoiceEngine />
              </div>
              <div className="bg-slate-900/50 backdrop-blur-sm p-1 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-colors">
                <InsightDashboard />
              </div>
            </div>
          </div>

          {/* WEEKLY PROGRAM (TOPICS) */}
          <section className="py-12 md:py-20">
            <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                6 Haftalık Program
              </h2>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                Adım adım ilerleyen, bilimsel temelli gelişim modülleri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {weeksContent.map((week) => {
                const isLocked = user ? (week.week > progressionWeek) : (week.week > 1);

                return (
                  <div
                    key={week.id}
                    onClick={() => !isLocked && setSelectedTopicId(week.id)}
                    className={`
                      group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300
                      ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/30'}
                    `}
                  >
                    {/* Image Header */}
                    <div className="relative h-48 w-full">
                      <Image
                        src={topicImages[week.id] || topicImages['kimlik-gelisimi']}
                        alt={topicAlts[week.id] || "Modül Görseli"}
                        fill
                        className={`object-cover transition-transform duration-700 ${!isLocked && 'group-hover:scale-110'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />

                      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Hafta {week.week}</span>
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm z-10 transition-opacity">
                          <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <span className="mt-2 text-sm font-medium text-slate-300">KİLİTLİ MODÜL</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {week.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                        {week.description}
                      </p>

                      {!isLocked && (
                        <div className="mt-4 flex items-center text-blue-400 text-sm font-semibold">
                          Detayları İncele
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* MODAL (AnimatePresence ensures proper entry/exit animations) */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ zIndex: 100 }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopicId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 rounded-3xl border border-white/10 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTopicId(null)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Hero Image */}
              <div className="relative h-64 md:h-80 w-full shrink-0">
                <Image
                  src={topicImages[selectedTopic.id]}
                  alt={topicAlts[selectedTopic.id]}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-6 left-6 md:left-10 right-6">
                  <span className="inline-block px-3 py-1 bg-blue-600 rounded-md text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Hafta {selectedTopic.week}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {selectedTopic.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-10">
                <div className="prose prose-lg prose-invert max-w-none">
                  {selectedTopic.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-slate-300 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setSelectedTopicId(null)}
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Tamamla ve Kapat
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple helper component for consistent buttons
function LinkButton({ href, children, variant = 'primary' }: { href: string, children: React.ReactNode, variant?: 'primary' | 'outline' }) {
  const baseClass = "px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25",
    outline: "bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white hover:bg-slate-800/50"
  };

  return (
    <a href={href} className={`${baseClass} ${variants[variant]}`}>
      {children}
    </a>
  );
}
