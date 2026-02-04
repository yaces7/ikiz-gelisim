'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ChatGameProps {
    onClose: () => void;
    onSave: (score: number) => void;
    week?: number;
}

// ------------------------------------------------------------------
// SCENARIO DATABASE
// ------------------------------------------------------------------
const ALL_SCENARIOS = [
    // 1. KURS SEÇİMİ (İlgi Alanları)
    {
        id: 'kurs-1',
        sender: 'Anne',
        message: "Canım, kardeşinle aynı yüzme kursuna yazıldınız. Yarın başlıyorsunuz!",
        options: [
            { text: "Anne, benim ilgi alanım farklı, ben gitar kursu istiyordum.", score: 25, nextId: 'kurs-2a' },
            { text: "Tamam anne, nasıl istersen.", score: 0, nextId: 'end-passive' },
            { text: "Hayır gitmiyorum! Hep onun istediği oluyor!", score: 5, nextId: 'kurs-2b' }
        ]
    },
    {
        id: 'kurs-2a',
        sender: 'Anne',
        message: "Ama o yalnız kalır diye endişeleniyorum... Senin yanında olsa daha rahat ederim.",
        options: [
            { text: "Onun da kendi arkadaşlarını bulması lazım anne. Ben gitarı çok istiyorum.", score: 30, nextId: 'end-success' },
            { text: "Tamam, üzülme, bu seferlik giderim.", score: 10, nextId: 'end-passive' }
        ]
    },
    {
        id: 'kurs-2b',
        sender: 'Anne',
        message: "Neden bağırıyorsun? Sadece öneri yapmıştım.",
        options: [
            { text: "Özür dilerim, ama kendi kararlarımı vermek benim için önemli.", score: 20, nextId: 'end-success' },
            { text: "Tamam neyse.", score: 5, nextId: 'end-neutral' }
        ]
    },

    // 2. ODA DÜZENİ (Sınırlar)
    {
        id: 'oda-1',
        sender: 'İkiz Kardeş',
        message: "Odadaki çalışma masalarının yerini değiştirdim. Artık ikimiz de pencereye bakıyoruz.",
        options: [
            { text: "Keşke bana da sorsaydın. Benim tarafımı değiştirme lütfen.", score: 25, nextId: 'oda-2a' },
            { text: "İyi yapmışsın.", score: 5, nextId: 'end-passive' },
            { text: "Eski haline getir hemen! Dokunma eşyalarıma!", score: 0, nextId: 'oda-2b' }
        ]
    },
    {
        id: 'oda-2a',
        sender: 'İkiz Kardeş',
        message: "Sürpriz olsun istemiştim... Beğenmedin mi?",
        options: [
            { text: "Düşüncen güzel ama benim alanımla ilgili kararları birlikte almalıyız.", score: 30, nextId: 'end-success' },
            { text: "Beğendim ama yine de sormalıydın.", score: 20, nextId: 'end-success' }
        ]
    },
    {
        id: 'oda-2b',
        sender: 'İkiz Kardeş',
        message: "Üff tamam be, iyilik de yaramıyor sana!",
        options: [
            { text: "İyilik değil, saygı istiyorum.", score: 15, nextId: 'end-neutral' },
            { text: "Konuşma benimle.", score: -5, nextId: 'end-fail' }
        ]
    },

    // 3. ARKADAŞ DAVETİ (Sosyal)
    {
        id: 'arkadas-1',
        sender: 'Baba',
        message: "Hafta sonu amcanlara gidiyoruz. Kuzenlerinizle oynarsınız.",
        options: [
            { text: "Baba, arkadaşımla önceden sözleşmiştim. Bu sefer gelmesem?", score: 25, nextId: 'arkadas-2a' },
            { text: "Tamam baba.", score: 5, nextId: 'end-passive' },
            { text: "Ben gelmiyorum, hep sıkılıyorum orada.", score: 0, nextId: 'end-fail' }
        ]
    },
    {
        id: 'arkadas-2a',
        sender: 'Baba',
        message: "Ama ayıp olur, seni sorarlar.",
        options: [
            { text: "Selam söylersiniz. Sözümü tutmam gerek, bu benim sorumluluğum.", score: 30, nextId: 'end-success' },
            { text: "Tamam, arkadaşımı iptal ederim mecburen.", score: 10, nextId: 'end-passive' }
        ]
    },

    // 4. TELEFON (Gizlilik) - YENİ
    {
        id: 'telefon-1',
        sender: 'İkiz Kardeş',
        message: "Şifreni değiştirmissin? Söylesene giremiyorum telefona.",
        options: [
            { text: "Evet değiştirdim. Özel mesajlarım olabilir, girmemeni tercih ederim.", score: 30, nextId: 'telefon-2' },
            { text: "Sana ne? Söylemiyorum.", score: 5, nextId: 'end-fail' },
            { text: "Tamam söylüyorum: 1234", score: 0, nextId: 'end-passive' }
        ]
    },
    {
        id: 'telefon-2',
        sender: 'İkiz Kardeş',
        message: "Benden sır mı saklıyorsun? Biz ikiziz!",
        options: [
            { text: "Sır değil, mahremiyet. Senin de özel alanın olmalı, benim de.", score: 30, nextId: 'end-success' },
            { text: "Tamam al bak, bir şey yok zaten.", score: 5, nextId: 'end-passive' }
        ]
    },

    // 5. AYNI KIYAFET (Kimlik) - YENİ
    {
        id: 'kiyafet-1',
        sender: 'Anne',
        message: "Düğün için size aynı elbiseleri aldım! Çok tatlı olacaksınız.",
        options: [
            { text: "Anne teşekkürler ama ben farklı bir tarz giymek istiyorum.", score: 25, nextId: 'kiyafet-2' },
            { text: "Giyerim tabi anne.", score: 5, nextId: 'end-passive' }
        ]
    },
    {
        id: 'kiyafet-2',
        sender: 'Anne',
        message: "Ama herkes ikizleri bir örnek görünce bayılıyor...",
        options: [
            { text: "Başkaları için değil, kendimiz gibi hissetmek için giyinelim anne.", score: 30, nextId: 'end-success' },
            { text: "Peki senin hatırın için giyerim.", score: 10, nextId: 'end-passive' }
        ]
    },

    // 6. OKUL PROJESİ (Akademik) - YENİ
    {
        id: 'okul-1',
        sender: 'İkiz Kardeş',
        message: "Proje ödevini beraber yapalım mı? Sen araştırırsın ben yazarım.",
        options: [
            { text: "Bu sefer bireysel çalışmak istiyorum, kendi konumu seçtim.", score: 25, nextId: 'okul-2' },
            { text: "Olur, fark etmez.", score: 5, nextId: 'end-passive' }
        ]
    },
    {
        id: 'okul-2',
        sender: 'İkiz Kardeş',
        message: "Ama notum düşük gelirse senin suçun!",
        options: [
            { text: "Kendi başarından sen sorumlusun. Sana güveniyorum, yapabilirsin.", score: 30, nextId: 'end-success' },
            { text: "Tamam gel yardım edeyim...", score: 5, nextId: 'end-passive' }
        ]
    },

    // 7. HARÇLIK (Ekonomi) - YENİ
    {
        id: 'para-1',
        sender: 'Baba',
        message: "Harçlığınızı birleştirdim, bu hafta idare edin.",
        options: [
            { text: "Baba lütfen ayrı ver. Benim biriktirme hedefim var.", score: 30, nextId: 'end-success' },
            { text: "Tamam baba.", score: 5, nextId: 'end-passive' }
        ]
    },

    // SONUÇLAR
    {
        id: 'end-success',
        sender: 'Sistem',
        message: "🌟 Mükemmel! Sınırlarını korudun ve kendini harika ifade ettin.",
        options: [],
        isEnd: true
    },
    {
        id: 'end-passive',
        sender: 'Sistem',
        message: "😐 Çok taviz verdin. Kendi isteklerin de önemli, unutma.",
        options: [],
        isEnd: true
    },
    {
        id: 'end-neutral',
        sender: 'Sistem',
        message: "👍 Fena değil. Biraz daha net olabilirsin.",
        options: [],
        isEnd: true
    },
    {
        id: 'end-fail',
        sender: 'Sistem',
        message: "😞 İletişim koptu. Sakin kalmayı dene.",
        options: [],
        isEnd: true
    }
];

const WEEK_SCENARIOS: Record<number, string[]> = {
    1: ['kurs-1', 'oda-1', 'kiyafet-1'],
    2: ['telefon-1', 'arkadas-1', 'okul-1'],
    3: ['para-1', 'kurs-1', 'oda-1'],
    4: ['kiyafet-1', 'telefon-1', 'arkadas-1'],
    5: ['okul-1', 'para-1', 'kurs-1'],
    6: ['oda-1', 'telefon-1', 'kiyafet-1', 'okul-1']
};

export default function ChatGame({ onClose, onSave, week = 1 }: ChatGameProps) {
    // Haftaya göre senaryoları yükle
    const scenariosForWeek = WEEK_SCENARIOS[week] || WEEK_SCENARIOS[1];

    const [queueIndex, setQueueIndex] = useState(0); // Hangi senaryodayız (0, 1, 2...)
    const [activeScenarioId, setActiveScenarioId] = useState(scenariosForWeek[0]);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [totalScore, setTotalScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const currentScenario = ALL_SCENARIOS.find(s => s.id === activeScenarioId);

    // Initial Load
    useEffect(() => {
        if (currentScenario && messages.length === 0) {
            addSystemMessage(currentScenario);
        }
    }, []);

    // Auto Scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const addSystemMessage = (scenario: any) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: scenario.message,
                sender: scenario.sender,
                isUser: false
            }]);

            if (!scenario.isEnd) {
                setShowOptions(true);
            }
        }, 1500);
    };

    const handleOptionClick = (option: any) => {
        setShowOptions(false);
        // User Message
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: option.text,
            isUser: true
        }]);
        setTotalScore(prev => prev + option.score);

        // Next Step Logic
        setTimeout(() => {
            if (option.nextId) {
                const nextScenario = ALL_SCENARIOS.find(s => s.id === option.nextId);

                if (nextScenario) {
                    addSystemMessage(nextScenario);
                    setActiveScenarioId(option.nextId);

                    // Check if End of Scenario
                    if (nextScenario.isEnd) {
                        setTimeout(() => {
                            // Move to NEXT Scenario in Queue
                            if (queueIndex < scenariosForWeek.length - 1) {
                                const nextQueueIdx = queueIndex + 1;
                                const nextStartId = scenariosForWeek[nextQueueIdx];
                                const nextStartScenario = ALL_SCENARIOS.find(s => s.id === nextStartId);

                                setQueueIndex(nextQueueIdx);
                                setActiveScenarioId(nextStartId);

                                // Divider
                                setMessages(prev => [...prev, {
                                    id: Date.now() + 999,
                                    text: `✨ Senaryo ${nextQueueIdx + 1} Başlıyor...`,
                                    isDivider: true
                                }]);

                                if (nextStartScenario) addSystemMessage(nextStartScenario);

                            } else {
                                setIsFinished(true);
                                onSave(totalScore + option.score); // Save final
                            }
                        }, 2500);
                    }
                }
            }
        }, 500);
    };

    const getSenderAvatar = (sender?: string) => {
        if (sender === 'Anne') return '👩';
        if (sender === 'Baba') return '👨';
        if (sender === 'İkiz Kardeş') return '👯';
        if (sender === 'Sistem') return '🤖';
        return '👤';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-sans">
            <div className="w-full max-w-md bg-slate-50 h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border-4 border-slate-800">

                {/* HEAD */}
                <div className="bg-slate-900 text-white p-4 flex items-center gap-4 shadow-lg z-10">
                    <button onClick={onClose} className="text-2xl opacity-70 hover:opacity-100 transition">✕</button>
                    <div className="flex-1 text-center">
                        <h2 className="font-bold text-lg">Mutfak Diplomasisi</h2>
                        <div className="text-xs text-blue-300 font-bold uppercase tracking-widest">
                            Senaryo {queueIndex + 1} / {scenariosForWeek.length}
                        </div>
                    </div>
                    <div className="font-mono font-bold text-green-400">{totalScore} P</div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-200" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <AnimatePresence>
                        {messages.map((m) => (
                            m.isDivider ? (
                                <div key={m.id} className="flex justify-center my-4">
                                    <span className="bg-slate-300 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{m.text}</span>
                                </div>
                            ) : (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!m.isUser && (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center mr-2 text-lg shadow-sm">
                                            {getSenderAvatar(m.sender)}
                                        </div>
                                    )}
                                    <div className={`
                                        max-w-[75%] p-3 text-sm shadow-sm relative
                                        ${m.isUser
                                            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                                            : m.sender === 'Sistem'
                                                ? 'bg-yellow-100 text-slate-800 border border-yellow-300 rounded-xl text-center w-full'
                                                : 'bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100'
                                        }
                                    `}>
                                        {!m.isUser && m.sender !== 'Sistem' && (
                                            <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{m.sender}</div>
                                        )}
                                        {m.text}
                                    </div>
                                </motion.div>
                            )
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <div className="flex items-center gap-1 ml-10">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-slate-400 rounded-full" />
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* FOOTER */}
                <div className="bg-white border-t border-slate-200 p-4 min-h-[80px]">
                    {!isFinished ? (
                        showOptions ? (
                            <div className="flex flex-col gap-2">
                                {currentScenario?.options.map((opt: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionClick(opt)}
                                        className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-sm font-medium active:scale-95"
                                    >
                                        {opt.text}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 text-xs italic">Cevabın bekleniyor...</div>
                        )
                    ) : (
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">🎉 Oyun Bitti</h3>
                            <button onClick={onClose} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">Kapat</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
