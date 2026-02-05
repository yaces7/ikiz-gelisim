'use client';

import { useState, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scenarios } from '../data/scenarios';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';

interface Character {
  name: string;
  avatar: string;
  personality: string[];
  hobbies: string[];
  dreams: string[];
  strengths: string[];
  difference: string; // New: Difference from twin
}

const personalityTraits = ['Yaratıcı', 'Düşünceli', 'Enerjik', 'Sakin', 'Lider', 'Yardımsever', 'Meraklı', 'Cesur', 'Sabırlı', 'Özgüvenli', 'Neşeli', 'Kararlı'];
const hobbiesArray = ['Resim', 'Müzik', 'Dans', 'Spor', 'Kitap Okuma', 'Yazı Yazma', 'Bahçecilik', 'Fotoğrafçılık', 'Yemek Yapma', 'Bilgisayar', 'Satranç', 'Yüzme'];
const dreamsArray = ['Bilim İnsanı', 'Sanatçı', 'Sporcu', 'Doktor', 'Öğretmen', 'Mühendis', 'Yazar', 'Müzisyen', 'Şef', 'Pilot', 'Veteriner', 'Tasarımcı'];
const strengthsArray = ['Problem Çözme', 'İletişim', 'Organizasyon', 'Yaratıcılık', 'Empati', 'Analitik Düşünme', 'Takım Çalışması', 'Liderlik', 'Adaptasyon', 'Öğrenme Hızı', 'El Becerisi', 'Hafıza'];
const avatars = [
  { emoji: '👧', label: 'Neşeli' },
  { emoji: '👦', label: 'Aktif' },
  { emoji: '🧑‍🎨', label: 'Sanatçı' },
  { emoji: '🧑‍🔬', label: 'Bilgin' },
  { emoji: '🧑‍💻', label: 'Teknoloji' },
  { emoji: '🧑‍🚀', label: 'Kaşif' },
  { emoji: '🧑‍🎤', label: 'Yıldız' },
  { emoji: '🧑‍🍳', label: 'Usta' }
];

const differences = [
  'Daha sabırlıyım',
  'Daha hızlı karar veririm',
  'Daha sessizim',
  'Daha detaycıyım',
  'Daha hayalperestim',
  'Daha mantıklıyım'
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
  const [character, setCharacter] = useState<Character>({
    name: '',
    avatar: '👤',
    personality: [],
    hobbies: [],
    dreams: [],
    strengths: [],
    difference: ''
  });
  const [step, setStep] = useState(0); // 0 is Intro
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // If not logged in, show strict gate
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
          <p className="text-slate-400 mb-8 leading-relaxed">
            Kendi özgün karakterini tasarlamak ve gelişim yolculuğuna başlamak için lütfen giriş yap.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/giris" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSelect = (category: keyof Character, item: string) => {
    if (category === 'avatar' || category === 'difference') {
      setCharacter(prev => ({ ...prev, [category]: item }));
    } else {
      setCharacter(prev => ({
        ...prev,
        [category]: Array.isArray(prev[category])
          ? (prev[category] as string[]).includes(item)
            ? (prev[category] as string[]).filter((i: string) => i !== item)
            : [...(prev[category] as string[]), item].slice(0, 3)
          : []
      }));
    }
  };

  const nextStep = () => {
    if (step < 7) setStep(step + 1);
    else setShowResult(true);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderProgress = () => (
    <div className="mb-8 relative">
      <div className="flex justify-between text-[10px] text-slate-500 mb-2 uppercase tracking-[0.2em] font-black">
        <span>Giriş</span>
        <span>Kimlik</span>
        <span>Yetenek</span>
        <span>Ayrışma</span>
        <span>Tamamla</span>
      </div>
      <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 7) * 100}%` }}
        />
      </div>
      {/* Decorative Glow */}
      <div className="absolute top-4 left-0 w-full h-1 bg-blue-500/20 blur-xl -z-10" />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 py-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-blue-500/20"
            >
              🎮
            </motion.div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight">Maceraya Hazır mısın?</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Kardeşinle benzer çok yanın olabilir, ama sen busun! Kendi özgün karakterini oluşturmaya hemen başla.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="px-10 py-4 bg-white text-slate-950 font-black rounded-2xl shadow-xl hover:bg-slate-100 transition-all"
            >
              BAŞLAYALIM!
            </motion.button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Aşama 1</h3>
              <h2 className="text-3xl font-black text-white">İsmin Nedir?</h2>
              <p className="text-slate-400">Karakterine vereceğin isim, onun hikayesinin başlangıcıdır.</p>
            </div>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-6 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-2xl font-bold transition-all"
              placeholder="Örn: Cesur Gezgin"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Aşama 2</h3>
              <h2 className="text-3xl font-black text-white">Görünümünü Seç</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {avatars.map((av, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect('avatar', av.emoji)}
                  className={`relative group p-6 rounded-3xl transition-all border-2 ${character.avatar === av.emoji
                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/30 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{av.emoji}</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-300">{av.label}</div>
                  {character.avatar === av.emoji && (
                    <motion.div layoutId="cursor" className="absolute -top-2 -right-2 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">✓</motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
      case 4:
      case 5:
      case 6:
        const config = {
          3: { title: 'Kişilik Özellikleri', data: personalityTraits, key: 'personality' as keyof Character, limit: 3, color: 'purple' },
          4: { title: 'İlgi Alanları & Hobiler', data: hobbiesArray, key: 'hobbies' as keyof Character, limit: 3, color: 'blue' },
          5: { title: 'Güçlü Yönlerin', data: strengthsArray, key: 'strengths' as keyof Character, limit: 3, color: 'yellow' },
          6: { title: 'Kimlik Farkı', data: differences, key: 'difference' as keyof Character, limit: 1, color: 'pink', subtitle: 'Kardeşinden en belirgin farkın nedir?' }
        }[step]!;

        const currentSelection = Array.isArray(character[config.key]) ? character[config.key] as string[] : [character[config.key] as string];

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h3 className={`text-xs font-bold text-${config.color}-400 uppercase tracking-widest`}>Aşama {step - 1}</h3>
                <h2 className="text-3xl font-black text-white">{config.title}</h2>
                {config.subtitle && <p className="text-slate-400 mt-1">{config.subtitle}</p>}
              </div>
              <span className={`text-sm font-black text-${config.color}-400`}>
                {config.limit > 1 ? `${currentSelection.filter(Boolean).length} / ${config.limit}` : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {config.data.map((item, index) => {
                const isSelected = currentSelection.includes(item);
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(config.key, item)}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between border-2 ${isSelected
                      ? `bg-${config.color}-600/20 border-${config.color}-500 text-white shadow-lg`
                      : 'bg-slate-800/30 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                  >
                    <span>{item}</span>
                    {isSelected && <span className="text-lg">✨</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const saveCharacter = async () => {
    setIsSaving(true);
    try {
      await api.post('/api/character/save', {
        name: character.name,
        appearance: { emoji: character.avatar },
        values: [...character.personality, ...character.strengths, character.difference],
        goals: [...character.dreams, ...character.hobbies]
      });
      // Small delay for effect
      setTimeout(() => {
        window.location.href = '/profil';
      }, 1500);
    } catch (e) {
      console.error(e);
      window.location.href = '/profil';
    }
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return character.name.length > 2;
    if (step === 2) return character.avatar !== '👤';
    if (step === 6) return !!character.difference;
    const key = { 3: 'personality', 4: 'hobbies', 5: 'strengths' }[step] as keyof Character;
    return (character[key] as string[]).length > 0;
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Confetti numberOfPieces={300} recycle={false} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border-2 border-white/10 p-10 rounded-[40px] max-w-2xl w-full shadow-3xl relative overflow-hidden"
        >
          {/* Animated Gradient Background */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 -z-10 animate-pulse" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-40 h-40 bg-slate-800 rounded-full flex items-center justify-center text-9xl shadow-2xl border-4 border-white/10 mb-6"
            >
              {character.avatar}
            </motion.div>

            <motion.h2 className="text-4xl font-black text-white mb-2">{character.name}</motion.h2>
            <div className="px-4 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-black tracking-[0.3em] uppercase rounded-full mb-8">
              ÖZGÜN KİMLİK OLUŞTURULDU
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kişilik</div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {character.personality.slice(0, 2).map(p => <span key={p} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-lg text-[10px] font-bold">{p}</span>)}
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Farklılık</div>
                <div className="text-xs font-bold text-pink-400">{character.difference}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={saveCharacter}
                disabled={isSaving}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-lg rounded-3xl shadow-2xl shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {isSaving ? 'KAYDEDİLİYOR...' : '🚀 DÜNYAYA ADIM AT! (+50 XP)'}
              </button>
              <button
                onClick={() => { setShowResult(false); setStep(0); }}
                className="text-slate-500 font-bold hover:text-white transition-colors"
              >
                Yeniden Düzenle
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto">
        <motion.div
          layout
          className="bg-slate-900/40 border border-white/5 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {step > 0 && renderProgress()}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="min-h-[400px] flex flex-col justify-center"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {step > 0 && (
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                GERİ
              </button>

              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black shadow-2xl transition-all transform ${canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
              >
                {step === 6 ? 'SONUÇLARI GÖR' : 'İLERLE'}
                {canProceed() && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}