
'use client';

import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ParentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/giris');
        return;
      }

      try {
        const data = await api.get('/api/parent/dashboard');
        setDashboardData(data.data);
      } catch (err: any) {
        setError(err.message || 'Veri alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Veriler Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Hata</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-800 rounded-lg text-white font-bold"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const labels = dashboardData?.chartLabels || ['1. Hafta', '2. Hafta', '3. Hafta'];
  const data = {
    labels,
    datasets: dashboardData?.datasets || [
      {
        label: 'Veri Bekleniyor',
        data: [0, 0, 0],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#94a3b8' } },
      title: { display: true, text: 'Çocuklarınızın Haftalık Gelişim Eğrisi', color: '#e2e8f0' },
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Ebeveyn Paneli</h1>
            <p className="text-slate-400 font-medium">İkizlerinizin bireyselleşme yolculuğunda yanındayız.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold uppercase tracking-widest">
              {dashboardData?.guidanceMode || "AI Aktif"}
            </div>
            <button className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </button>
          </div>
        </div>

        {/* Comparison Insight Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[32px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-20 group-hover:scale-110 transition-transform">💡</div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] mb-3">AI Karşılaştırmalı Analiz</h3>
            <p className="text-white text-xl md:text-2xl font-bold leading-snug">
              {dashboardData?.aiInsight || "Veriler analiz ediliyor..."}
            </p>
          </div>
        </motion.div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardData?.children?.map((child: any, idx: number) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-xl border border-white/5">
                    {child.character?.appearance?.emoji || '👤'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{child.name}</h2>
                    <p className="text-slate-500 text-sm font-bold">Gelişim Puanı: {child.points} XP</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-500">%{child.progress}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">İlerleme</div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Gelişim Faktörleri</h4>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Sınır Koyma', value: child.factors?.boundaries || 50, color: 'bg-blue-500' },
                    { label: 'Sosyal Özgürlük', value: child.factors?.social || 50, color: 'bg-purple-500' },
                    { label: 'Öz Farkındalık', value: child.factors?.selfAwareness || 50, color: 'bg-green-500' }
                  ].map(f => (
                    <div key={f.label} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">{f.label}</span>
                        <span className="text-slate-500">%{f.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.value}%` }}
                          className={`h-full ${f.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Child Specific Insight */}
              <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Önerilen Yaklaşım</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {child.aiInsight}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white">Zaman Çizelgesi</h3>
              <div className="flex gap-2">
                {dashboardData?.datasets?.map((ds: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ds.borderColor }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{ds.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[300px]">
              <Line options={options} data={data} />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[32px] flex flex-col">
            <h3 className="text-xl font-black text-white mb-6">Akış</h3>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {dashboardData?.recentActivities?.map((act: any, idx: number) => (
                <div key={idx} className="relative pl-6 border-l-2 border-white/5 pb-2">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mb-1">
                    {new Date(act.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm font-bold text-slate-300 leading-tight">{act.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}