
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

  const labels = dashboardData?.chartLabels || ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const data = {
    labels,
    datasets: dashboardData?.datasets || [
      {
        label: 'Veri Bekleniyor',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#64748b', stepSize: 20 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
      x: { ticks: { color: '#64748b' }, grid: { display: false } }
    }
  };

  const handleDownloadReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-12 selection:bg-blue-500/30">
      <style jsx global>{`
        @media print {
          nav, button, .no-print { display: none !important; }
          .min-h-screen { background: white !important; padding: 0 !important; color: black !important; }
          .bg-slate-900\/50, .bg-slate-900, .bg-white\/5 { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
          .text-white { color: #0f172a !important; }
          .text-slate-400, .text-slate-500 { color: #64748b !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
          h1, h2, h3 { color: #1e293b !important; }
          canvas { max-height: 250px !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8 print:space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Ebeveyn Paneli</h1>
            <p className="text-slate-400 font-medium">İkizlerinizin bireyselleşme yolculuğunda yanındayız.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${dashboardData?.urgency === 'Önemli' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}>
              {dashboardData?.guidanceMode || "AI Aktif"}
            </div>
            <button
              onClick={handleDownloadReport}
              className="px-6 py-2.5 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              RAPOR İNDİR
            </button>
          </div>
        </div>

        {/* Comparison Insight Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[40px] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 group-hover:opacity-20 transition-opacity">🤖</div>
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.4em]">HAFTALIK KARŞILAŞTIRMALI ANALİZ</h3>
            </div>
            <p className="text-white text-xl md:text-2xl font-bold leading-relaxed mb-6">
              {dashboardData?.aiInsight || "Veriler derinlemesine analiz ediliyor..."}
            </p>
            <div className="flex flex-wrap gap-3">
              {dashboardData?.observations?.map((obs: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300">
                  ✨ {obs}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dashboardData?.children?.map((child: any, idx: number) => {
            const aiChildInfo = dashboardData?.childInsights?.find((c: any) => c.name === child.name);
            return (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 md:p-10 backdrop-blur-xl relative group overflow-hidden"
              >
                {/* Visual Evidence / Metrics */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all"></div>

                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border border-white/10 group-hover:scale-105 transition-transform">
                      {child.character?.appearance?.emoji || '👤'}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white mb-1">{child.name}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded uppercase tracking-tighter">LEVEL {Math.floor(child.points / 500) + 1}</span>
                        <span className="text-slate-500 text-xs font-bold">{child.points} Toplam Puan</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-blue-500">%{child.progress}</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">İNDİVİDUASYON</div>
                  </div>
                </div>

                {/* Factors Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">GELİŞİM VERİLERİ (KANIT)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-2xl font-black text-white">{child.metrics?.tests || 0}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Psikolojik Test</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-2xl font-black text-white">{child.metrics?.games || 0}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Gelişim Oyunu</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-2xl font-black text-white">{child.metrics?.journals || 0}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Günlük Analizi</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-2xl font-black text-white">{(child.journals?.length || 0)}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Duygu Verisi</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">FAKTÖR ANALİZİ</h4>
                    {[
                      { label: 'Sınır Koyma Gücü', value: child.factors?.boundaries || 50, color: 'from-blue-600 to-indigo-600' },
                      { label: 'Sosyal Ayrışma', value: child.factors?.social || 50, color: 'from-purple-600 to-pink-600' },
                      { label: 'Öz Farkındalık', value: child.factors?.selfAwareness || 50, color: 'from-green-600 to-teal-600' }
                    ].map(f => (
                      <div key={f.label} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-300">{f.label}</span>
                          <span className="text-white">%{f.value}</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${f.value}%` }}
                            className={`h-full bg-gradient-to-r ${f.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Specialist Feedback */}
                <div className="relative group/insight">
                  <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover/insight:bg-blue-500/10 transition-all"></div>
                  <div className="relative bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">🧠</span>
                      <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest italic">AI Uzman Analizi</h4>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">
                      {aiChildInfo?.analysis || "Detaylı analiz için daha fazla etkileşim gerekiyor."}
                    </p>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Aksiyon Önerisi</p>
                      <p className="text-white text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                        🚀 {aiChildInfo?.actionableAdvice || "Gelişim devam ediyor."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts & Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
          <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-10 rounded-[40px] backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-2xl font-black text-white">Gelişim Projeksiyonu</h3>
                <p className="text-slate-500 text-sm font-medium">Haftalık individüasyon eğrisi.</p>
              </div>
              <div className="flex gap-4">
                {dashboardData?.datasets?.map((ds: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: ds.borderColor, color: ds.borderColor }}></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">{ds.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[350px]">
              <Line options={options} data={data} />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[40px] backdrop-blur-xl flex flex-col print:mt-8">
            <h3 className="text-2xl font-black text-white mb-8">Etkinlik Kanıtı</h3>
            <div className="flex-1 space-y-8 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
              {dashboardData?.recentActivities?.map((act: any, idx: number) => (
                <div key={idx} className="relative pl-8 border-l-2 border-white/10 pb-2">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-slate-900"></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {new Date(act.timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm font-bold text-slate-200 leading-tight bg-white/5 p-3 rounded-2xl border border-white/5">
                    {act.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Blockchain Kanıtlı Veri Sistemi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}