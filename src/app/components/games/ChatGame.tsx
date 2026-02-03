
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface ChatGameProps {
    onClose: () => void;
    onSave: (score: number) => void;
    week?: number; // Seçilen haftaya göre farklı senaryolar
}

// 20 FARKLI SENARYO - Her biri dallanmalı
const ALL_SCENARIOS = [
    // SENARYO 1: Kurs Seçimi
    {
        id: 'kurs-1',
        sender: 'Anne',
        message: "Canım, kardeşinle aynı kursa gitmeniz daha iyi olmaz mı? Hem birbirinize destek olursunuz.",
        options: [
            { text: "Evet, haklısın anne.", score: 0, nextId: 'end-passive' },
            { text: "Anne, benim ilgi alanım farklı, resim kursuna gitmek istiyorum.", score: 20, nextId: 'kurs-2' },
            { text: "Hayır, ben tek başıma karar vermek istiyorum!", score: 10, nextId: 'kurs-3' }
        ]
    },
    {
        id: 'kurs-2',
        sender: 'Anne',
        message: "Ama o yalnız kalır diye endişeleniyorum... Senin yanında olsa daha rahat ederim.",
        options: [
            { text: "Onun da kendi arkadaşlarını bulması lazım anne, bu onun için de iyi olur.", score: 30, nextId: 'end-success' },
            { text: "Tamam, üzülme, onunla giderim.", score: 0, nextId: 'end-passive' }
        ]
    },
    {
        id: 'kurs-3',
        sender: 'Anne',
        message: "Neden bu kadar sert konuşuyorsun? Sana sadece öneri yapmıştım.",
        options: [
            { text: "Özür dilerim, ama kendi kararlarımı vermek benim için önemli.", score: 25, nextId: 'end-success' },
            { text: "Haklısın, özür dilerim, ne dersen onu yaparım.", score: 0, nextId: 'end-passive' }
        ]
    },

    // SENARYO 2: Oda Düzeni
    {
        id: 'oda-1',
        sender: 'İkiz Kardeş',
        message: "Neden odayı izin almadan değiştirdin? Burası sadece senin değil!",
        options: [
            { text: "Haklısın, önce seninle konuşmalıydım. Beraber düzenleyelim mi?", score: 25, nextId: 'oda-2a' },
            { text: "Kendi tarafımı değiştirdim sadece, sana dokunmadım.", score: 15, nextId: 'oda-2b' },
            { text: "İstediğimi yaparım, sen karışma!", score: -10, nextId: 'oda-2c' }
        ]
    },
    {
        id: 'oda-2a',
        sender: 'İkiz Kardeş',
        message: "Tamam, ama bir daha böyle yapma. Ben de söz hakkı istiyorum.",
        options: [
            { text: "Söz veriyorum, bundan sonra beraber karar verelim.", score: 20, nextId: 'end-success' },
            { text: "Tamam tamam, anladım.", score: 5, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'oda-2b',
        sender: 'İkiz Kardeş',
        message: "Yine de bana haber vermeliydin. Sonuçta aynı odayı paylaşıyoruz.",
        options: [
            { text: "Haklısın, özür dilerim. Bundan sonra konuşuruz.", score: 20, nextId: 'end-success' },
            { text: "Tamam, anladım.", score: 5, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'oda-2c',
        sender: 'İkiz Kardeş',
        message: "Anneeeee! Bak ne yapıyor!",
        options: [
            { text: "Dur, özür dilerim. Sakin ol, konuşalım.", score: 10, nextId: 'end-neutral' },
            { text: "İstersen söyle, umurumda değil!", score: -20, nextId: 'end-fail' }
        ]
    },

    // SENARYO 3: Arkadaş Daveti
    {
        id: 'arkadas-1',
        sender: 'Baba',
        message: "Akşam yemeğine Ayşe Teyze geliyor. İkinizin de evde olmanızı istiyorum.",
        options: [
            { text: "Baba, bugün arkadaşlarımla plan yapmıştım. Başka zaman olabilir mi?", score: 20, nextId: 'arkadas-2a' },
            { text: "Tamam baba, evdeyim.", score: 5, nextId: 'arkadas-2b' },
            { text: "Hayır, gitmiyorum, arkadaşlarımla buluşacağım!", score: -5, nextId: 'arkadas-2c' }
        ]
    },
    {
        id: 'arkadas-2a',
        sender: 'Baba',
        message: "Arkadaşlarınla her zaman görüşebilirsin ama Ayşe Teyze nadiren geliyor.",
        options: [
            { text: "Anlıyorum baba. Bu sefer için gelirim ama gelecek sefer önceden haber verirseniz planlarımı ayarlarım.", score: 25, nextId: 'end-success' },
            { text: "Peki, gelirim.", score: 10, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'arkadas-2b',
        sender: 'Baba',
        message: "Aferin, aile birliği önemli.",
        options: [
            { text: "Evet baba, ama gelecek sefer önceden haber verirseniz iyi olur.", score: 15, nextId: 'end-success' },
            { text: "Tamam.", score: 5, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'arkadas-2c',
        sender: 'Baba',
        message: "Bu nasıl konuşma? Aileye saygı göstermelisin!",
        options: [
            { text: "Özür dilerim baba, doğru konuşmadım. Ama planlarımı da önemsemenizi istiyorum.", score: 15, nextId: 'end-neutral' },
            { text: "Tamam, özür dilerim.", score: 5, nextId: 'end-passive' }
        ]
    },

    // SENARYO 4: Telefon Şifresi
    {
        id: 'telefon-1',
        sender: 'İkiz Kardeş',
        message: "Telefon şifreni söyle, bir şey bakacağım.",
        options: [
            { text: "Hayır, telefonum özel. Ne bakacaksan söyle, ben göstereyim.", score: 30, nextId: 'telefon-2a' },
            { text: "Neden? Güvenmiyorsun mu bana?", score: 15, nextId: 'telefon-2b' },
            { text: "Al bakalım: 1234", score: -10, nextId: 'end-passive' }
        ]
    },
    {
        id: 'telefon-2a',
        sender: 'İkiz Kardeş',
        message: "Aramızda sır mı var yani?",
        options: [
            { text: "Sır değil, özel alan. Senin de özel alanın olmalı.", score: 25, nextId: 'end-success' },
            { text: "Evet, bazı şeyler sadece bana ait.", score: 20, nextId: 'end-success' }
        ]
    },
    {
        id: 'telefon-2b',
        sender: 'İkiz Kardeş',
        message: "Tabii ki güveniyorum ama merak ettim sadece.",
        options: [
            { text: "Merak ettiğini anlıyorum ama herkesin özel alanı olmalı.", score: 25, nextId: 'end-success' },
            { text: "Tamam, göstereyim.", score: 0, nextId: 'end-passive' }
        ]
    },

    // SENARYO 5: Giyim Seçimi
    {
        id: 'giyim-1',
        sender: 'Anne',
        message: "Bu düğüne ikiniz de aynı kıyafeti giyseniz ne güzel olur! Herkes çok sever.",
        options: [
            { text: "Anne, ben farklı bir şey giymek istiyorum. Kendi tarzımı yansıtmak önemli benim için.", score: 25, nextId: 'giyim-2a' },
            { text: "Tamam anne, sen bilirsin.", score: 0, nextId: 'end-passive' },
            { text: "Hayır, aynı giyinmek istemiyorum artık!", score: 10, nextId: 'giyim-2b' }
        ]
    },
    {
        id: 'giyim-2a',
        sender: 'Anne',
        message: "Ama çok tatlı duruyorsunuz beraber...",
        options: [
            { text: "Anlıyorum anne, ama büyüdük. Bireysel tarzımız olsun istiyoruz.", score: 30, nextId: 'end-success' },
            { text: "Belki başka zaman. Bu sefer farklı giyinelim.", score: 20, nextId: 'end-success' }
        ]
    },
    {
        id: 'giyim-2b',
        sender: 'Anne',
        message: "Neden bu kadar sert tepki veriyorsun?",
        options: [
            { text: "Özür dilerim anne, ama artık kendi kararlarımı vermek istiyorum.", score: 20, nextId: 'end-success' },
            { text: "Haklısın, özür dilerim.", score: 5, nextId: 'end-neutral' }
        ]
    },

    // SENARYO 6: Hobi Seçimi
    {
        id: 'hobi-1',
        sender: 'İkiz Kardeş',
        message: "Sen de gitara mı başlıyorsun? Ben başlamıştım zaten, neden aynısını yapıyorsun?",
        options: [
            { text: "Ben de ilgileniyorum, neden rahatsız oluyorsun?", score: 15, nextId: 'hobi-2a' },
            { text: "Haklısın, ben başka bir enstrüman seçeyim.", score: 0, nextId: 'end-passive' },
            { text: "Her ikimiz de öğrenebiliriz, bu bir yarış değil.", score: 25, nextId: 'hobi-2b' }
        ]
    },
    {
        id: 'hobi-2a',
        sender: 'İkiz Kardeş',
        message: "Çünkü her şeyi aynı yapınca kendimi özel hissetmiyorum.",
        options: [
            { text: "Anlıyorum. Ama ben de gerçekten ilgileniyorum. Belki farklı tarzlar çalabiliriz?", score: 30, nextId: 'end-success' },
            { text: "Tamam, o zaman ben piyano deneyeyim.", score: 10, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'hobi-2b',
        sender: 'İkiz Kardeş',
        message: "Hmm, haklısın aslında. Beraber pratik de yapabiliriz.",
        options: [
            { text: "Evet! Hem bireysel hem beraber çalışabiliriz.", score: 25, nextId: 'end-success' },
            { text: "Belki ara sıra.", score: 10, nextId: 'end-neutral' }
        ]
    },

    // SENARYO 7: Sınav Stresi
    {
        id: 'sinav-1',
        sender: 'Baba',
        message: "İkizin çok çalışıyor, sen neden televizyon izliyorsun? Aynı sınava gireceksiniz.",
        options: [
            { text: "Baba, benim çalışma tarzım farklı. Mola verip devam edeceğim.", score: 25, nextId: 'sinav-2a' },
            { text: "Tamam, hemen çalışmaya başlıyorum.", score: 5, nextId: 'end-passive' },
            { text: "O istediği kadar çalışsın, beni rahat bırakın!", score: -5, nextId: 'sinav-2b' }
        ]
    },
    {
        id: 'sinav-2a',
        sender: 'Baba',
        message: "Ama kardeşin gibi çalışsan daha başarılı olmaz mısın?",
        options: [
            { text: "Herkesin öğrenme stili farklı baba. Ben kendi yöntemimle başarılı oluyorum.", score: 30, nextId: 'end-success' },
            { text: "Belki haklısın, daha çok çalışayım.", score: 5, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'sinav-2b',
        sender: 'Baba',
        message: "Bu nasıl konuşma! Aile olarak başarınızı önemsiyoruz.",
        options: [
            { text: "Özür dilerim baba. Ama karşılaştırılmak beni kötü hissettiriyor.", score: 20, nextId: 'end-success' },
            { text: "Tamam, özür dilerim.", score: 5, nextId: 'end-neutral' }
        ]
    },

    // SENARYO 8: Sosyal Medya
    {
        id: 'sosyal-1',
        sender: 'İkiz Kardeş',
        message: "Neden beni takip etmiyorsun? Utanıyor musun benden?",
        options: [
            { text: "Tabii ki hayır! Sadece sosyal medyada kendi alanım olsun istedim.", score: 25, nextId: 'sosyal-2a' },
            { text: "Hemen takip ediyorum, üzülme.", score: 0, nextId: 'end-passive' },
            { text: "Evet, rahatsız oluyorum bazen.", score: 10, nextId: 'sosyal-2b' }
        ]
    },
    {
        id: 'sosyal-2a',
        sender: 'İkiz Kardeş',
        message: "Yani benden ayrı bir hayatın mı olsun istiyorsun?",
        options: [
            { text: "Ayrı değil, bireysel. Seni seviyorum ama kendi kimliğim de önemli.", score: 30, nextId: 'end-success' },
            { text: "Hayır hayır, o anlamda değil... Takip edeyim.", score: 5, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'sosyal-2b',
        sender: 'İkiz Kardeş',
        message: "Bu beni çok üzdü...",
        options: [
            { text: "Üzüldüğünü anlıyorum. Ama bazen bireysel alan ihtiyacım var, bu seni sevmediğim anlamına gelmiyor.", score: 25, nextId: 'end-success' },
            { text: "Özür dilerim, hemen takip ediyorum.", score: 0, nextId: 'end-passive' }
        ]
    },

    // SENARYO 9: Aile Toplantısı
    {
        id: 'toplanti-1',
        sender: 'Anne',
        message: "Yarın aile toplantısında ikizler olarak ne düşünüyorsunuz diye soracaklar. Hazırlıklı olun.",
        options: [
            { text: "Anne, ben kendi fikrimi ayrı söylemek istiyorum. İkizim farklı düşünebilir.", score: 30, nextId: 'toplanti-2a' },
            { text: "Tamam anne, beraber konuşuruz.", score: 5, nextId: 'end-passive' },
            { text: "Neden aynı düşünmemiz gerekiyor?", score: 15, nextId: 'toplanti-2b' }
        ]
    },
    {
        id: 'toplanti-2a',
        sender: 'Anne',
        message: "Ama birlikte konuşsanız daha güçlü olur...",
        options: [
            { text: "Farklı fikirler de güçlü olabilir anne. İki bakış açısı zenginliktir.", score: 30, nextId: 'end-success' },
            { text: "Tamam, o zaman beraber hazırlanalım.", score: 10, nextId: 'end-neutral' }
        ]
    },
    {
        id: 'toplanti-2b',
        sender: 'Anne',
        message: "Aynı düşünmeniz gerekmiyor, ama aile olarak uyumlu görünmek önemli.",
        options: [
            { text: "Anlıyorum anne. Ama farklı fikirleri saygıyla ifade etmek de uyum değil mi?", score: 25, nextId: 'end-success' },
            { text: "Tamam, uyumlu oluruz.", score: 5, nextId: 'end-neutral' }
        ]
    },

    // SON DURUMLAR
    {
        id: 'end-success',
        sender: 'Sistem',
        message: "🎉 Harika! Sınırlarını sağlıklı bir şekilde ifade ettin ve empati kurdun.",
        options: [],
        isEnd: true
    },
    {
        id: 'end-neutral',
        sender: 'Sistem',
        message: "👍 Fena değil! Dengeyi bulmaya çalıştın. Biraz daha kendini ifade edebilirsin.",
        options: [],
        isEnd: true
    },
    {
        id: 'end-passive',
        sender: 'Sistem',
        message: "🤔 Taviz verdin. Kendi ihtiyaçlarını da önemsemeyi unutma!",
        options: [],
        isEnd: true
    },
    {
        id: 'end-fail',
        sender: 'Sistem',
        message: "😔 Bu sefer iletişim koptu. Bir dahaki sefere daha sakin yaklaşmayı dene.",
        options: [],
        isEnd: true
    }
];

// Her hafta için başlangıç senaryoları
const WEEK_SCENARIOS: Record<number, string[]> = {
    1: ['kurs-1', 'oda-1'],
    2: ['telefon-1', 'giyim-1'],
    3: ['arkadas-1', 'hobi-1'],
    4: ['sinav-1', 'sosyal-1'],
    5: ['toplanti-1', 'kurs-1'],
    6: ['oda-1', 'telefon-1', 'giyim-1']
};

export default function ChatGame({ onClose, onSave, week = 1 }: ChatGameProps) {
    // Haftaya göre senaryoları seç
    const startScenarios = WEEK_SCENARIOS[week] || WEEK_SCENARIOS[1];
    const [currentScenarioId, setCurrentScenarioId] = useState(startScenarios[0]);
    const [scenarioIndex, setScenarioIndex] = useState(0);

    const [messages, setMessages] = useState<{ id: number, text: string, isUser: boolean, sender?: string }[]>([]);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [showOptions, setShowOptions] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const currentScenario = ALL_SCENARIOS.find(s => s.id === currentScenarioId);

    useEffect(() => {
        // İlk mesajı ekle
        if (currentScenario && messages.length === 0) {
            setMessages([{
                id: Date.now(),
                text: currentScenario.message,
                isUser: false,
                sender: currentScenario.sender
            }]);
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleOption = (option: { text: string, score: number, nextId?: string }) => {
        setShowOptions(false);

        // Kullanıcı mesajı ekle
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: option.text,
            isUser: true
        }]);

        setScore(prev => prev + option.score);

        // Sonraki senaryo
        setTimeout(() => {
            if (option.nextId) {
                const nextScenario = ALL_SCENARIOS.find(s => s.id === option.nextId);
                if (nextScenario) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: nextScenario.message,
                        isUser: false,
                        sender: nextScenario.sender
                    }]);
                    setCurrentScenarioId(option.nextId);

                    if (nextScenario.isEnd) {
                        // Sonraki senaryoya geç veya bitir
                        setTimeout(() => {
                            if (scenarioIndex < startScenarios.length - 1) {
                                const nextIndex = scenarioIndex + 1;
                                setScenarioIndex(nextIndex);
                                const nextStartId = startScenarios[nextIndex];
                                const nextStart = ALL_SCENARIOS.find(s => s.id === nextStartId);
                                if (nextStart) {
                                    setMessages(prev => [...prev, {
                                        id: Date.now() + 2,
                                        text: '--- Yeni Mesaj ---',
                                        isUser: false,
                                        sender: 'Sistem'
                                    }, {
                                        id: Date.now() + 3,
                                        text: nextStart.message,
                                        isUser: false,
                                        sender: nextStart.sender
                                    }]);
                                    setCurrentScenarioId(nextStartId);
                                    setShowOptions(true);
                                }
                            } else {
                                setFinished(true);
                                onSave(score);
                            }
                        }, 2000);
                    } else {
                        setShowOptions(true);
                    }
                }
            }
        }, 1000);
    };

    const getSenderColor = (sender?: string) => {
        switch (sender) {
            case 'Anne': return 'text-pink-500';
            case 'Baba': return 'text-blue-500';
            case 'İkiz Kardeş': return 'text-purple-500';
            case 'Sistem': return 'text-yellow-500';
            default: return 'text-emerald-500';
        }
    };

    const getSenderAvatar = (sender?: string) => {
        switch (sender) {
            case 'Anne': return '👩';
            case 'Baba': return '👨';
            case 'İkiz Kardeş': return '👯';
            case 'Sistem': return '🤖';
            default: return '👤';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-md bg-stone-100 h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-4 text-white shadow-md z-10">
                    <button onClick={onClose} className="text-2xl hover:scale-110 transition">←</button>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                        {getSenderAvatar(currentScenario?.sender)}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold">{currentScenario?.sender || 'Aile'}</div>
                        <div className="text-xs opacity-80">Mutfak Diplomasisi • Puan: {score}</div>
                    </div>
                    <div className="text-lg font-bold bg-white/20 px-3 py-1 rounded-full">
                        {scenarioIndex + 1}/{startScenarios.length}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[linear-gradient(to_bottom,#f5f5f4,#e7e5e4)]">
                    <AnimatePresence>
                        {messages.map((m, idx) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[85%] p-3 rounded-2xl shadow-sm text-sm
                                    ${m.isUser
                                        ? 'bg-emerald-500 text-white rounded-br-sm'
                                        : m.sender === 'Sistem'
                                            ? 'bg-yellow-100 text-stone-800 border border-yellow-300'
                                            : 'bg-white text-stone-900 rounded-bl-sm'
                                    }
                                `}>
                                    {!m.isUser && m.sender !== 'Sistem' && (
                                        <div className={`text-xs font-bold mb-1 ${getSenderColor(m.sender)}`}>
                                            {getSenderAvatar(m.sender)} {m.sender}
                                        </div>
                                    )}
                                    {m.text}
                                    <div className={`text-[10px] text-right mt-1 ${m.isUser ? 'text-white/70' : 'text-stone-400'}`}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area (Options) */}
                <div className="p-4 bg-stone-100 border-t border-stone-200 max-h-[40vh] overflow-y-auto">
                    {!finished && showOptions && currentScenario && currentScenario.options.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {currentScenario.options.map((opt, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleOption(opt)}
                                    className="p-3 bg-white border border-stone-200 rounded-xl text-stone-700 hover:bg-emerald-50 hover:border-emerald-300 text-left text-sm transition font-medium shadow-sm active:scale-98"
                                >
                                    {opt.text}
                                </motion.button>
                            ))}
                        </div>
                    ) : finished ? (
                        <div className="text-center py-4">
                            <Confetti numberOfPieces={150} recycle={false} />
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-emerald-600 font-bold text-lg mb-2">Simülasyon Tamamlandı!</h3>
                            <div className="text-3xl font-black text-stone-800 mb-4">{score} Puan</div>
                            <p className="text-sm text-stone-500 mb-4">
                                {score >= 50 ? 'Harika iletişim becerileri gösterdin!' :
                                    score >= 25 ? 'İyi bir başlangıç! Pratik yaptıkça gelişeceksin.' :
                                        'Sınır koyma ve iletişim konusunda daha fazla pratik yapabilirsin.'}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2 text-stone-500">Yazıyor...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
