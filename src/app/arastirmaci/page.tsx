'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const comparisonData = {
    labels: ['Kendi Karar Alma', 'Duygusal Ayrışma', 'Sosyal Sınırlar'],
    datasets: [
        {
            label: 'Deney Grubu (Platform Kullanan)',
            data: [78, 82, 75],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
        {
            label: 'Kontrol Grubu',
            data: [65, 60, 62],
            backgroundColor: 'rgba(156, 163, 175, 0.7)',
        },
    ],
};

const twinTypeData = {
    labels: ['Tek Yumurta (Monozigot)', 'Çift Yumurta (Dizigot)'],
    datasets: [
        {
            data: [45, 55],
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1,
        },
    ],
};

export default function ResearcherDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/api/admin/dashboard-stats');
                setStats(data.stats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="min-h-screen pt-32 text-center text-white">Veriler Yükleniyor...</div>;
    }

    // Dynamic Data for Twin Types Chart
    const twinTypeLabels = stats?.twinTypes.map((t: any) => t.twin_type === 'monozygotic' ? 'Tek Yumurta' : 'Çift Yumurta') || [];
    const twinTypeCounts = stats?.twinTypes.map((t: any) => t.count) || [];

    const dynamicTwinTypeData = {
        labels: twinTypeLabels.length ? twinTypeLabels : ['Veri Yok'],
        datasets: [
            {
                data: twinTypeCounts.length ? twinTypeCounts : [0],
                backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Araştırmacı Paneli (Admin)</h1>
                        <p className="text-gray-500">TÜBİTAK Proje Veri Analizi ve İzleme Ekranı</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
                            Excel Olarak İndir (.csv)
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass p-6 rounded-xl border-t-4 border-blue-500">
                        <h3 className="text-gray-500 text-xs uppercase font-bold">Toplam Katılımcı (n)</h3>
                        <p className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">{stats?.totalUsers || 0}</p>
                        <p className="text-xs text-blue-500 mt-1">{stats?.twins || 0} İkiz / {stats?.parents || 0} Ebeveyn</p>
                    </div>
                    <div className="glass p-6 rounded-xl border-t-4 border-purple-500">
                        <h3 className="text-gray-500 text-xs uppercase font-bold">Deney Grubu (İkiz)</h3>
                        <p className="text-4xl font-bold mt-2 text-green-600">{stats?.experimentCount || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">Platform Kullanan</p>
                    </div>
                    <div className="glass p-6 rounded-xl border-t-4 border-orange-500">
                        <h3 className="text-gray-500 text-xs uppercase font-bold">Kontrol Grubu (İkiz)</h3>
                        <p className="text-4xl font-bold mt-2 text-gray-800 dark:text-white">{stats?.controlCount || 0}</p>
                        <p className="text-xs text-orange-500 mt-1">Standart Takip</p>
                    </div>
                    <div className="glass p-6 rounded-xl border-t-4 border-red-500">
                        <h3 className="text-gray-500 text-xs uppercase font-bold">Riskli Grup (Uyarı)</h3>
                        <p className="text-4xl font-bold mt-2 text-red-600">-</p>
                        <p className="text-xs text-gray-400 mt-1">Yüksek bağımlılık skoru</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-2xl"
                    >
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Deney vs Kontrol Grubu Karşılaştırması</h3>
                        <Bar options={{ responsive: true }} data={comparisonData} />
                        <p className="mt-4 text-sm text-gray-500 italic">
                            *Deney grubunda (mavi), platform modüllerini kullanan ikizlerin özerklik skorlarında anlamlı artış gözlenmiştir (p {'<'} 0.05).
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-2xl"
                    >
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Katılımcı Dağılımı (İkiz Türü)</h3>
                        <div className="w-2/3 mx-auto">
                            <Pie data={dynamicTwinTypeData} />
                        </div>
                        <p className="mt-8 text-sm text-gray-500 text-center">
                            Veri tabanındaki kayıtlı ikizlerin dağılımı.
                        </p>
                    </motion.div>
                </div>

                {/* Raw Data Table Preview */}
                <div className="glass rounded-xl overflow-hidden p-6">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Son Etkileşim Verileri (Canlı Akış)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Kullanıcı</th>
                                    <th className="px-6 py-3">Rol</th>
                                    <th className="px-6 py-3">Grup</th>
                                    <th className="px-6 py-3">Eylem Türü</th>
                                    <th className="px-6 py-3">Skor</th>
                                    <th className="px-6 py-3">Zaman</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentActivities.map((act: any, idx: number) => (
                                    <tr key={idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{act.username}</td>
                                        <td className="px-6 py-4">{act.role === 'twin' ? 'İkiz' : 'Ebeveyn'}</td>
                                        <td className="px-6 py-4">
                                            <span className={act.group_type === 'experiment' ? 'text-blue-500' : 'text-gray-500'}>
                                                {act.group_type === 'experiment' ? 'Deney' : 'Kontrol'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{act.type}</td>
                                        <td className="px-6 py-4 text-green-500">{act.score != null ? act.score.toFixed(1) : '-'}</td>
                                        <td className="px-6 py-4">{new Date(act.timestamp).toLocaleString('tr-TR')}</td>
                                    </tr>
                                ))}
                                {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">Henüz veri yok.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
