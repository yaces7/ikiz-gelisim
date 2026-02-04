'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import api from '../lib/api';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function InsightDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<number[]>([50, 50, 50, 50, 50, 50]);
    const [labels, setLabels] = useState<string[]>(['Özerklik', 'Sınırlar', 'İletişim', 'Özgüven', 'Farkındalık', 'Risk Alma']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            api.get('/api/profile/stats')
                .then(data => {
                    if (data?.stats?.radarData) {
                        setStats(data.stats.radarData);
                        setLabels(data.stats.radarLabels);
                    }
                })
                .catch(err => console.error("Dashboard stats error", err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Mevcut Durum',
                data: user ? stats : [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
            },
            {
                label: 'Hedef',
                data: [80, 80, 80, 90, 80, 75], // Hedefler de dinamik olabilir ama şimdilik statik iyi
                backgroundColor: 'rgba(200, 200, 200, 0.05)',
                borderColor: 'rgba(200, 200, 200, 0.3)',
                borderWidth: 1,
                borderDash: [5, 5]
            },
        ],
    };

    // Forced Dark Mode Config for Space Theme
    const gridColor = 'rgba(255, 255, 255, 0.1)';
    const textColor = '#ffffff';

    const options = {
        scales: {
            r: {
                angleLines: { color: gridColor },
                grid: { color: gridColor },
                pointLabels: {
                    font: { size: 11, family: 'Inter', weight: 'bold' },
                    color: textColor,
                },
                ticks: {
                    backdropColor: 'transparent',
                    display: false
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: textColor, font: { family: 'Inter' } }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 h-[500px] flex flex-col bg-slate-900 border border-white/10">
            {/* Dark Glass Background */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl z-0"></div>

            {/* Login Overlay if !user */}
            {!user && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center">
                    <div className="p-3 bg-blue-500/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analiz Kilitli</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        Kişisel gelişim haritanızı görmek için hesabınıza giriş yapın.
                    </p>
                    <Link href="/giris" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors">
                        Giriş Yap
                    </Link>
                </div>
            )}

            <div className="relative z-10 p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">
                        Gelişim Radarı
                    </h2>
                    <span className="px-3 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                        {loading ? 'Yükleniyor...' : 'Canlı Veri'}
                    </span>
                </div>

                <div className="relative flex-1 min-h-0">
                    <Radar data={data} options={options as any} />
                </div>

                <div className="mt-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-yellow-500/20 text-yellow-400 rounded-xl mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm mb-1">Gelişim Fırsatı</h3>
                            <p className="text-xs text-gray-400 mb-2">
                                {user
                                    ? ((stats[0] || 0) < 60
                                        ? '"Özerklik" alanında gelişime açıksın. Sınırlarını koruma egzersizleri yapabilirsin.'
                                        : 'Gelişim haritan dengeli görünüyor. Yeni hedefler belirleme zamanı!')
                                    : 'Giriş yaptığınızda size özel öneriler burada görünecektir.'
                                }
                            </p>
                            {user && (
                                <Link href="/profil" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                    Detaylı Analizi Gör ➜
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
