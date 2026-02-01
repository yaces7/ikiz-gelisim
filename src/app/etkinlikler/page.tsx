'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const activities = [
  {
    id: 1,
    title: 'Psikodrama Atölyesi',
    description: 'İkizinizle aranızdaki rolleri değiştirerek empati yeteneğinizi geliştirin.',
    icon: '🎭',
    duration: '45 dk',
    difficulty: 'Orta',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 2,
    title: 'Sanat Terapisi',
    description: 'Bireysel duygularınızı renkler ve şekillerle ifade ederek sınırlarınızı çizin.',
    icon: '🎨',
    duration: '30 dk',
    difficulty: 'Kolay',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 3,
    title: 'Ortak Alan Tasarımı',
    description: 'Odanızı veya yaşam alanınızı sınırları koruyarak nasıl paylaşacağınızı planlayın.',
    icon: '📐',
    duration: '60 dk',
    difficulty: 'Zor',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    title: 'Bireysel Kaçış Planı',
    description: 'Kendinize ait, ikizinizden bağımsız geçireceğiniz kaliteli bir gün planlayın.',
    icon: '🗺️',
    duration: '20 dk',
    difficulty: 'Kolay',
    color: 'from-emerald-500 to-teal-500'
  }
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold text-white">Etkinlik Merkezi Kilitli</h2>
          <p className="text-slate-400">
            Özel gelişim etkinliklerine erişmek için giriş yapmalısınız.
          </p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Etkinlik Merkezi
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Psikososyal gelişiminizi destekleyecek interaktif atölyeler ve görevler.
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((act, index) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 relative"
            >
              {/* Gradient Border Top */}
              <div className={`h-2 w-full bg-gradient-to-r ${act.color}`} />

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-4xl">{act.icon}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white/5 rounded-lg text-slate-400 border border-white/5">
                    {act.duration}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-black/20 ${act.difficulty === 'Kolay' ? 'text-green-400' :
                    act.difficulty === 'Orta' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                    {act.difficulty}
                  </span>
                  <button className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                    Başla &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Section - Featured or Workshop */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold border border-purple-500/20">
                HAFTANIN ÖNE ÇIKAN ETKİNLİĞİ
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                İkiz Uyumu ve Bireysellik Dengesi
              </h2>
              <p className="text-slate-400 text-lg">
                Bu haftaki özel atölyemizde, uzman psikologlar eşliğinde "Biz" olmadan "Ben" olabilmenin yollarını keşfediyoruz.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25">
                  Atölyeye Katıl
                </button>
                <button className="px-8 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-xl transition-all">
                  Detaylı Bilgi
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden group cursor-pointer">
              <span className="text-5xl group-hover:scale-110 transition-transform">🎥</span>
              <div className="absolute bottom-4 left-4 text-white font-bold text-sm">Tanıtım Videosunu İzle</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}