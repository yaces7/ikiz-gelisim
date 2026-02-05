'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';

interface Character {
  name: string;
  avatar: string;
  personality: string[];
  hobbies: string[];
  strengths: string[];
  difference: string;
}

interface DiscoveryQuestion {
  id: number;
  question: string;
  options: { label: string; value: string; icon: string }[];
}

const discoveryQuestions: DiscoveryQuestion[] = [
  {
    id: 1,
    question: "Eğer bir süper gücün olsaydı hangisini seçerdin?",
    options: [
      { label: "Uçmak", value: "adventure", icon: "🦅" },
      { label: "Zihin Okumak", value: "empathy", icon: "🧠" },
      { label: "Görünmezlik", value: "logical", icon: "👻" },
      { label: "Çok Hızlı Olmak", value: "energetic", icon: "⚡" }
    ]
  },
  {
    id: 2,
    question: "Issız bir adaya düşsen yanına alacağın ilk şey ne olurdu?",
    options: [
      { label: "Resim Defteri", value: "creative", icon: "🎨" },
      { label: "Büyüteç", value: "curious", icon: "🔍" },
      { label: "Telsiz", value: "social", icon: "📻" },
      { label: "Hayatta Kalma Kiti", value: "practical", icon: "🎒" }
    ]
  },
  {
    id: 3,
    question: "Hafta sonu senin için hangisi demek?",
    options: [
      { label: "Yeni Yerler Keşfetmek", value: "explorer", icon: "🗺️" },
      { label: "Kitap Okumak", value: "thoughtful", icon: "📚" },
      { label: "Arkadaşlarla Oyun", value: "team", icon: "🎮" },
      { label: "Müzik Dinlemek", value: "artistic", icon: "🎧" }
    ]
  }
];

export default function CharacterGame() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Yükleniyor...</div>}>
      <CharacterGameContent />
    </Suspense>
  );
}

function CharacterGameContent() {
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0: Intro, 1: Name, 2: Chat, 3: Analysis, 4: Result, 5: Difference
  const [character, setCharacter] = useState<Character>({
    name: '',
    avatar: '👤',
    personality: [],
    hobbies: [],
    strengths: [],
    difference: ''
  });

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-6">
            <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Karakter Oyunu</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">Kendi özgün karakterini keşfetmek için giriş yapmalısın.</p>
          <Link href="/giris" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  const handleAnswer = (qId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
    if (currentQ < discoveryQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      runAnalysis();
    }
  };

  const runAnalysis = async () => {
    setStep(3); // Analysis Step
    setIsAnalyzing(true);
    try {
      const response = await api.post('/api/character/analyze', { answers });
      if (response.success) {
        const { personality, strengths, avatarSuggested, discoveryMessage } = response.analysis;
        setCharacter(prev => ({
          ...prev,
          personality,
          strengths,
          avatar: avatarSuggested || '🧑‍🚀'
        }));
        setAiMessage(discoveryMessage);
        setTimeout(() => {
          setIsAnalyzing(false);
          setStep(4); // Result Step
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      setStep(1); // Back to name if error
    }
  };

  const saveCharacter = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/character/save', {
        name: character.name,
        appearance: { emoji: character.avatar },
        values: [...character.personality, ...character.strengths, character.difference],
        goals: character.hobbies
      });
      setTimeout(() => {
        window.location.href = '/profil';
      }, 1500);
    } catch (e) {
      window.location.href = '/profil';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 py-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl">✨</motion.div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white">Özünü Keşfet!</h2>
              <p className="text-slate-400 text-lg">Bu bir test değil, bir keşif yolculuğu. Bilge Rehber senin cevaplarını analiz edip karakterini ortaya çıkaracak.</p>
            </div>
            <button onClick={() => setStep(1)} className="px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-100 transition-all scale-110">MACERAYA BAŞLA</button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white text-center">Önce Sana Bir İsim Verelim</h2>
              <p className="text-slate-400 text-center">Dünyadaki adın dışında, bu maceradaki adın ne olsun?</p>
            </div>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Kahraman İsmi..."
              className="w-full p-6 bg-white/5 border-2 border-white/10 rounded-[32px] text-3xl font-black text-white text-center focus:border-blue-500 transition-all outline-none"
            />
            {character.name.length > 2 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setStep(2)} className="w-full py-5 bg-blue-600 rounded-3xl text-white font-black text-xl shadow-xl">TIKLA VE DEVAM ET</motion.button>
            )}
          </div>
        );
      case 2:
        const q = discoveryQuestions[currentQ];
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Soru {currentQ + 1} / {discoveryQuestions.length}</span>
              <div className="h-1 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-500" animate={{ width: `${((currentQ + 1) / discoveryQuestions.length) * 100}%` }} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white text-center leading-tight">{q.question}</h2>
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.id, opt.value)}
                  className="group flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500 transition-all text-left"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">{opt.icon}</span>
                  <span className="text-lg font-bold text-white">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-12 py-10">
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🧠</div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white">Analiz Başladı...</h2>
              <p className="text-blue-400 font-bold animate-pulse italic">Bilge Rehber cevaplarını dökümlüyor, özgünlüğünü haritalandırıyor.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">İşte Senin Karakterin!</h2>
              <p className="text-slate-400 px-4">{aiMessage}</p>
            </div>

            <div className="w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[40px] text-center relative">
              <div className="text-8xl mb-6">{character.avatar}</div>
              <h3 className="text-3xl font-black text-white mb-6 underline decoration-blue-500 underline-offset-8 decoration-4">{character.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Kişilik</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {character.personality.map(p => <span key={p} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold">{p}</span>)}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-[10px] font-black text-purple-400 mb-2 uppercase tracking-widest">Güçlü Yönler</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {character.strengths.map(s => <span key={s} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">{s}</span>)}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setStep(5)} className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl text-xl shadow-2xl hover:scale-105 transition-all">SON ADIMA GEÇ ➔</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white text-center">Son Bir Şey...</h2>
              <p className="text-slate-400">İkizinden veya başkalarından seni en çok ne ayırır? Senin imzan nedir?</p>
            </div>
            <textarea
              value={character.difference}
              onChange={(e) => setCharacter(prev => ({ ...prev, difference: e.target.value }))}
              placeholder="Örn: Ben her zaman daha detaycıyım ve resim çizmeyi çok severim..."
              className="w-full h-40 p-6 bg-white/5 border-2 border-white/10 rounded-[32px] text-white focus:border-pink-500 transition-all outline-none resize-none text-lg font-medium"
            />
            <button
              onClick={saveCharacter}
              disabled={isSaving || character.difference.length < 5}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xl rounded-3xl shadow-2xl disabled:opacity-50"
            >
              {isSaving ? 'YOLCULUK KAYDEDİLİYOR...' : 'KARAKTERİ MÜHÜRLE (+50 XP)'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 selection:bg-blue-500/30">
      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-slate-900 border border-white/10 p-10 rounded-[48px] shadow-3xl overflow-hidden relative"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -z-10" />

            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <div className="mt-8 text-center">
            <button onClick={() => setStep(0)} className="text-slate-500 text-sm font-bold hover:text-white transition-colors">Vazgeç ve Başa Dön</button>
          </div>
        )}
      </div>
      {step === 4 && <Confetti numberOfPieces={200} recycle={false} />}
    </div>
  );
}