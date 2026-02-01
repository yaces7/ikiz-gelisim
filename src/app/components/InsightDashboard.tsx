'use client';

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
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function InsightDashboard() {
    const { theme } = useTheme();

    const data = {
        labels: ['Özerklik', 'Bağlılık', 'Sosyal Yetkinlik', 'Özgüven', 'Risk Alma', 'Empati'],
        datasets: [
            {
                label: 'Mevcut Durum',
                data: [65, 59, 90, 81, 56, 55],
                backgroundColor: theme === 'individual' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                borderColor: theme === 'individual' ? 'rgba(59, 130, 246, 1)' : 'rgba(249, 115, 22, 1)',
                borderWidth: 2,
            },
            {
                label: 'Hedef',
                data: [80, 70, 85, 90, 70, 80],
                backgroundColor: 'rgba(200, 200, 200, 0.1)',
                borderColor: 'rgba(200, 200, 200, 0.5)',
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
                    font: { size: 12, family: 'Inter', weight: 'bold' },
                    color: textColor,
                },
                ticks: {
                    backdropColor: 'transparent',
                    display: false
                }
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
        <div className="w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500">
            {/* Dark Glass Background */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl z-0 border border-white/10"></div>

            <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">
                        Gelişim Radarı
                    </h2>
                    <span className="px-3 py-1 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                        Haftalık Analiz
                    </span>
                </div>

                <div className="relative h-72 w-full mb-8">
                    <Radar data={data} options={options as any} />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-1">Gelişim Fırsatı</h3>
                            <p className="text-sm text-gray-300 mb-3">
                                "Risk Alma" puanın hedefin biraz altında. Yeni bir hobi denemek özgüvenini artırabilir.
                            </p>
                            <button className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                Önerilen Aktiviteyi Gör ➜
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
