
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 flex-grow flex items-center">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              6 Haftalık Bilimsel Program
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="text-white">İkiz olarak doğdun,</span>
              <br />
              <span className="text-gradient">Birey olarak büyü.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Bireyselleşme yolculuğunda sana eşlik edecek dijital platform.
              <br />
              <span className="text-slate-300">Keşfet, oyunlaştır, dönüş.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Panele Git →
                </Link>
              ) : (
                <>
                  <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
                    Yolculuğa Başla →
                  </Link>
                  <Link href="/giris" className="btn-secondary text-lg px-8 py-4">
                    Giriş Yap
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                <span>Bilimsel Temelli</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>KVKK Uyumlu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <span>Gamifiye Edilmiş</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-center text-white mb-16"
          >
            Nasıl Çalışır?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📋',
                title: '1. Testleri Çöz',
                description: 'Bireyselleşme sürecini ölçen BSÖ ve aile tutum testlerini tamamla.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '🎮',
                title: '2. Modülleri Keşfet',
                description: '6 haftalık interaktif program ile sınır koyma, karar alma becerilerini geliştir.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: '📈',
                title: '3. Gelişimini İzle',
                description: 'Radar grafikleri ve AI destekli içgörülerle sürecini takip et.',
                color: 'from-emerald-500 to-green-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-interactive text-center space-y-4"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6', label: 'Haftalık Program' },
              { value: '20+', label: 'Senaryo' },
              { value: '3x', label: 'Test Ölçümü' },
              { value: '∞', label: 'Günlük Notları' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-4xl md:text-5xl font-black text-gradient mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 İkiz Gelişim Platformu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
