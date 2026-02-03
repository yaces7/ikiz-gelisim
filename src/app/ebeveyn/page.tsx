
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Ebeveyn Kontrol Paneli</h1>
            <p className="text-slate-400">Çocuklarınızın gelişim sürecini buradan takip edin.</p>
          </div>
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:bg-slate-700 text-sm font-medium transition text-white">
            Rapor İndir (PDF)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-white/10 p-6 rounded-xl border-t-4 border-t-green-500"
          >
            <h3 className="text-slate-400 text-sm font-medium">Genel İlerleme</h3>
            <p className="text-3xl font-bold mt-2 text-white">
              {dashboardData?.averageProgress ? `%${dashboardData.averageProgress}` : '%0'}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4">
              <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${dashboardData?.averageProgress || 0}%` }}></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 border border-white/10 p-6 rounded-xl border-t-4 border-t-blue-500"
          >
            <h3 className="text-slate-400 text-sm font-medium">Tamamlanan Aktiviteler</h3>
            <p className="text-3xl font-bold mt-2 text-white">
              {dashboardData?.totalActivities || 0}
            </p>
            <p className="text-xs text-green-400 mt-2">Aktif katılım</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 border border-white/10 p-6 rounded-xl border-t-4 border-t-purple-500"
          >
            <h3 className="text-slate-400 text-sm font-medium">Sistem Rehberliği</h3>
            <p className="text-lg font-bold mt-2 text-white">
              {dashboardData?.guidanceMode || "Veri Bekleniyor"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Dinamik öneri modu</p>
          </motion.div>
        </div>

        {/* Main Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2 bg-slate-900 border border-white/10 p-6 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Line options={options} data={data} />
          </motion.div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-lg">AI Mikro-Rehberlik</h3>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                {dashboardData?.aiInsight || "Çocuklarınızın aktiviteleri tamamlandıkça burada size özel yapay zeka önerileri belirecektir."}
              </p>
            </div>

            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
              <h3 className="font-bold text-white mb-4">Son Aktiviteler</h3>
              <ul className="space-y-4">
                {dashboardData?.recentActivities?.length > 0 ? (
                  dashboardData.recentActivities.map((act: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-400">
                      <span className={`w-2 h-2 rounded-full ${act.type === 'journal' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                      <span className="flex-1 truncate">{act.description}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(act.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">Henüz aktivite yok.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}