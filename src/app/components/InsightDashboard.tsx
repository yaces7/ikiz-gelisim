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

    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.2)', // White transparent
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                pointLabels: {
                    font: {
                        size: 14,
                        family: 'Inter',
                    },
                    color: '#ffffff', // White labels
                },
                ticks: {
                    backdropColor: 'transparent',
                    color: '#ffffff',
                    display: false // Hide numbers on axis for cleaner look
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgba(128, 128, 128, 0.8)'
                }
            }
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-6 bg-white/10 glass rounded-2xl mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Gelişim Radarı (Insight Dashboard)</h2>
            <div className="relative h-80 w-full">
                <Radar data={data} options={options} />
            </div>
        </div>
    );
}
