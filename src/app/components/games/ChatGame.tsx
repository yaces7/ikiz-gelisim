
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatGameProps {
    onClose: () => void;
    onSave: (score: number) => void;
}

const scenarios = [
    {
        sender: 'Anne',
        message: "Canım, kardeşinle aynı kursa gitmeniz daha iyi olmaz mı? Hem birbirinize destek olursunuz.",
        options: [
            { text: "Evet, haklısın anne.", score: 0, reply: "Harika, kaydınızı yapıyorum." },
            { text: "Anne, benim ilgi alanım farklı.", score: 20, reply: "Ama o yalnız kalır diye üzülüyorum..." },
            { text: "Hayır, ben tek başıma gitmek istiyorum!", score: 10, reply: "Neden bu kadar asisin?" }
        ]
    },
    {
        sender: 'Bot: Anne (Devam)',
        isFollowUp: true, // Logic simplification for demo
        message: "Ama o yalnız kalır diye üzülüyorum...",
        options: [
            { text: "Onun da kendi arkadaşlarını bulması lazım.", score: 30, reply: "Belki de haklısın. Deneyelim." },
            { text: "Tamam üzülme, giderim.", score: 0, reply: "Aferin benim düşünceli yavruma." }
        ]
    },
    // More scenarios logic handled via simple flow or random for demo
];

export default function ChatGame({ onClose, onSave }: ChatGameProps) {
    const [messages, setMessages] = useState<{ id: number, text: string, isUser: boolean, sender?: string }[]>([
        { id: 1, text: "Canım, kardeşinle aynı kursa gitmeniz daha iyi olmaz mı? Hem birbirinize destek olursunuz.", isUser: false, sender: "Anne" }
    ]);
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    // Chat auto-scroll
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleOption = (text: string, points: number, reply: string) => {
        // Add User Message
        const userMsgId = Date.now();
        setMessages(prev => [...prev, { id: userMsgId, text: text, isUser: true }]);

        setScore(prev => prev + points);

        // Add Reply with delay
        setTimeout(() => {
            if (step === 0 && points > 0) { // If assertive response
                setMessages(prev => [...prev, { id: Date.now(), text: "Ama o yalnız kalır diye üzülüyorum...", isUser: false, sender: "Anne" }]);
                setStep(1);
            } else if (step === 1 && points > 0) {
                setMessages(prev => [...prev, { id: Date.now(), text: "Belki de haklısın. Deneyelim.", isUser: false, sender: "Anne" }]);
                setTimeout(() => finishGame(score + points), 1500);
            } else {
                setMessages(prev => [...prev, { id: Date.now(), text: reply, isUser: false, sender: "Anne" }]);
                setTimeout(() => finishGame(score + points), 1500);
            }
        }, 1000);
    };

    const finishGame = (finalScore: number) => {
        setFinished(true);
        onSave(finalScore);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-md bg-stone-100 h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">

                {/* Header */}
                <div className="bg-emerald-600 p-4 flex items-center gap-4 text-white shadow-md z-10">
                    <button onClick={onClose} className="text-2xl">←</button>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">A</div>
                    <div>
                        <div className="font-bold">Anne</div>
                        <div className="text-xs opacity-80">Çevrimiçi</div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/whatsapp-bg.png')] bg-opacity-10 bg-repeat bg-stone-200">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] p-3 rounded-2xl shadow-sm text-sm md:text-base
                                ${m.isUser ? 'bg-emerald-100 text-stone-900 rounded-tr-none' : 'bg-white text-stone-900 rounded-tl-none'}
                            `}>
                                {!m.isUser && <div className="text-xs font-bold text-emerald-600 mb-1">{m.sender}</div>}
                                {m.text}
                                <div className="text-[10px] text-stone-400 text-right mt-1">
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area (Options) */}
                <div className="p-4 bg-stone-100 border-t border-stone-200">
                    {!finished ? (
                        <div className="flex flex-col gap-2">
                            {step === 0 && (
                                <>
                                    <button onClick={() => handleOption("Evet, haklısın anne.", 0, "Harika.")} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 text-left text-sm transition font-medium shadow-sm">
                                        Evet, haklısın anne.
                                    </button>
                                    <button onClick={() => handleOption("Anne, benim ilgi alanım farklı.", 20, "...")} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 text-left text-sm transition font-medium shadow-sm">
                                        Anne, benim ilgi alanım farklı.
                                    </button>
                                    <button onClick={() => handleOption("Hayır, ben tek başıma gitmek istiyorum!", 10, "...")} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 text-left text-sm transition font-medium shadow-sm">
                                        Hayır, gitmem!
                                    </button>
                                </>
                            )}
                            {step === 1 && (
                                <>
                                    <button onClick={() => handleOption("Onun da kendi arkadaşlarını bulması lazım.", 30, "")} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 text-left text-sm transition font-medium shadow-sm">
                                        Onun da kendi arkadaşlarını bulması lazım (Sınır Koyma).
                                    </button>
                                    <button onClick={() => handleOption("Tamam üzülme, giderim.", 0, "")} className="p-3 bg-white border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 text-left text-sm transition font-medium shadow-sm">
                                        Tamam üzülme (Taviz).
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <h3 className="text-emerald-600 font-bold mb-2">Simülasyon Tamamlandı</h3>
                            <div className="text-2xl font-black text-stone-800 mb-4">Skor: {score}</div>
                            <button onClick={onClose} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30">
                                Çıkış Yap
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
