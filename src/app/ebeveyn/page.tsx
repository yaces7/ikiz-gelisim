'use client';

import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    // Auth Protection
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }
    if (user?.role !== 'parent' && user?.role !== 'admin') {
      router.push('/'); // Redirect twins back home
      return;
    }

    // Fetch Real Data
    const fetchData = async () => {
      try {
        const res = await fetch('/api/parent/dashboard', {
          method: 'POST',
          body: JSON.stringify({ userId: user?.id })
        });
        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, router]);

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-white">Veriler Yükleniyor...</div>;
  }

  // Fallback/Default Data if API returns empty
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
      legend: { position: 'top' as const },
      title: { display: true, text: 'Çocuklarınızın Haftalık Gelişim Eğrisi' },
    },
    scales: { y: { min: 0, max: 100 } }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ebeveyn Kontrol Paneli</h1>
            <p className="text-gray-500">Çocuklarınızın gelişim sürecini buradan takip edin.</p>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium transition dark:bg-gray-800 dark:border-gray-700">
            Rapor İndir (PDF)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl border-t-4 border-green-500"
          >
            <h3 className="text-gray-500 text-sm font-medium">Genel İlerleme</h3>
            <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
              {dashboardData?.averageProgress ? `%${dashboardData.averageProgress}` : '-'}
            </p>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-4">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${dashboardData?.averageProgress || 0}%` }}></div>
            </div>
          </motion.div>

          {/* ... Other stats could be dynamic too but keeping static structure for now ... */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl border-t-4 border-blue-500"
          >
            <h3 className="text-gray-500 text-sm font-medium">Tamamlanan Aktiviteler</h3>
            <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">
              {dashboardData?.totalActivities || 0}
            </p>
            <p className="text-xs text-green-500 mt-2">Aktif katılım</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl border-t-4 border-purple-500"
          >
            <h3 className="text-gray-500 text-sm font-medium">Sistem Rehberliği</h3>
            <p className="text-lg font-bold mt-2 text-gray-800 dark:text-white">
              {dashboardData?.guidanceMode || "Veri Bekleniyor"}
            </p>
            <p className="text-xs text-gray-400 mt-2">Dinamik öneri modu</p>
          </motion.div>
        </div>

        {/* Main Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Line options={options} data={data} />
          </motion.div>

          {/* AI Insights Sidebar - Dynamic */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <h3 className="font-bold text-lg">AI Mikro-Rehberlik</h3>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                {dashboardData?.aiInsight || "Çocuklarınızın aktiviteleri tamamlandıkça burada size özel yapay zeka önerileri belirecektir."}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">Son Aktiviteler</h3>
              <ul className="space-y-4">
                {dashboardData?.recentActivities?.map((act: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${act.type === 'journal' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    {act.description}
                    <span className="ml-auto text-xs text-gray-400">{new Date(act.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </li>
                )) || <li className="text-sm text-gray-500">Henüz aktivite yok.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}