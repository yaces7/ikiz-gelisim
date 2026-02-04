'use client';

import { motion } from 'framer-motion';

export default function ArchitecturePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-12 text-center">
                    Sistem Teknik Mimarisi
                </h1>

                {/* DIAGRAM CONTAINER */}
                <div className="relative py-20 overflow-hidden">

                    {/* Connecting Lines (SVG Layer) */}
                    <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-30">
                        {/* Vercel to Browser */}
                        <path d="M600 150 L600 250" stroke="white" strokeWidth="2" strokeDasharray="5,5" />

                        {/* Vercel to Backend */}
                        <path d="M600 350 L600 450" stroke="#3b82f6" strokeWidth="4" />

                        {/* Backend to DB */}
                        <path d="M600 550 L400 650" stroke="#22c55e" strokeWidth="2" />

                        {/* Backend to AI */}
                        <path d="M600 550 L800 650" stroke="#a855f7" strokeWidth="2" />
                    </svg>

                    <div className="flex flex-col items-center gap-16 relative z-10">

                        {/* USER / BROWSER */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-slate-800 p-6 rounded-2xl border border-blue-500/30 text-center w-64 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                        >
                            <div className="text-4xl mb-2">🌍</div>
                            <h3 className="text-xl font-bold text-blue-400">Kullanıcı (Browser)</h3>
                            <p className="text-xs text-slate-400 mt-2">Chrome, Safari, Firefox</p>
                        </motion.div>

                        {/* FRONTEND */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-black p-8 rounded-2xl border border-white/20 text-center w-80 relative"
                        >
                            <div className="absolute -top-3 -right-3 bg-white text-black text-xs font-bold px-2 py-1 rounded">Next.js 14</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Frontend (Vercel)</h3>
                            <ul className="text-left text-sm text-slate-400 space-y-1 list-disc pl-4">
                                <li>Server Side Rendering</li>
                                <li>Choice Engine (React State)</li>
                                <li>API İstemcisi</li>
                            </ul>
                        </motion.div>

                        {/* BACKEND NODE */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-slate-900 p-8 rounded-2xl border-2 border-indigo-500 text-center w-96 relative shadow-[0_0_50px_rgba(99,102,241,0.15)]"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                API GATEWAY
                            </div>
                            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Backend (Render)</h3>

                            <div className="grid grid-cols-2 gap-4 text-xs text-left">
                                <div className="bg-slate-800 p-2 rounded">
                                    <span className="text-green-400 font-bold block">CORS Middleware</span>
                                    Güvenlik duvarlarını aşan manuel header injection.
                                </div>
                                <div className="bg-slate-800 p-2 rounded">
                                    <span className="text-yellow-400 font-bold block">Socket.io</span>
                                    Gerçek zamanlı oyun verisi akışı.
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex gap-20">
                            {/* DATABASE */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-green-950/30 p-6 rounded-2xl border border-green-500/30 text-center w-64"
                            >
                                <div className="text-4xl mb-2">🍃</div>
                                <h3 className="text-xl font-bold text-green-400">MongoDB Atlas</h3>
                                <p className="text-xs text-slate-400 mt-2">
                                    NoSQL Veritabanı.<br />
                                    Kullanıcı Profilleri, Günlük Yazıları, Oyun Skorları.
                                </p>
                            </motion.div>

                            {/* AI SERVICE */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="bg-purple-950/30 p-6 rounded-2xl border border-purple-500/30 text-center w-64"
                            >
                                <div className="text-4xl mb-2">🧠</div>
                                <h3 className="text-xl font-bold text-purple-400">Groq AI</h3>
                                <p className="text-xs text-slate-400 mt-2">
                                    LLaMA-3 Modeli.<br />
                                    Anlık Sentiment Analizi ve Me/We Oranı Hesaplama.
                                </p>
                            </motion.div>
                        </div>

                    </div>
                </div>

                <div className="mt-12 p-8 bg-slate-900 rounded-3xl border border-white/5">
                    <h2 className="text-2xl font-bold mb-4">Mimarinin Güçlü Yönleri (Jüri Notları)</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h4 className="font-bold text-blue-400">1. Ultra Resilient Bağlantı</h4>
                            <p className="text-sm text-slate-400">Frontend ve Backend arasındaki kopmaları önleyen özel "Heartbeat" ve "Reconnect" mekanizmaları.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-green-400">2. Ölçeklenebilir Yapı</h4>
                            <p className="text-sm text-slate-400">Veritabanı (MongoDB) ve Backend (Node.js) birbirinden bağımsız çalışarak binlerce eşzamanlı kullanıcıyı destekler.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-purple-400">3. Hibrit AI Analizi</h4>
                            <p className="text-sm text-slate-400">Hem kural tabanlı (Fallback) hem de Generative AI (Groq) kullanarak kesintisiz analiz garantisi.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
