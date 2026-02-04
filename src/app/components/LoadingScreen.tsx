'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
            <div className="relative flex flex-col items-center">

                {/* DNA Helix Animation */}
                <div className="flex gap-4 mb-8">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -20, 0],
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                            className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />
                    ))}
                </div>

                {/* Text Reveal */}
                <div className="overflow-hidden">
                    <motion.h1
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-2xl font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                    >
                        İkiz Gelişim
                    </motion.h1>
                </div>

                {/* Progress Bar */}
                <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>

                <p className="text-xs text-slate-500 mt-2 font-mono">Platform Yükleniyor...</p>

            </div>
        </div>
    );
}
