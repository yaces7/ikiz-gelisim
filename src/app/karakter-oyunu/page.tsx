'use client';

import { useState, Suspense } from 'react';
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
}

const personalityTraits = ['Yaratıcı', 'Düşünceli', 'Enerjik', 'Sakin', 'Lider', 'Yardımsever', 'Meraklı', 'Cesur', 'Sabırlı', 'Özgüvenli', 'Neşeli', 'Kararlı'];
const hobbies = ['Resim', 'Müzik', 'Dans', 'Spor', 'Kitap Okuma', 'Yazı Yazma', 'Bahçecilik', 'Fotoğrafçılık', 'Yemek Yapma', 'Bilgisayar', 'Satranç', 'Yüzme'];
const dreams = ['Bilim İnsanı', 'Sanatçı', 'Sporcu', 'Doktor', 'Öğretmen', 'Mühendis', 'Yazar', 'Müzisyen', 'Şef', 'Pilot', 'Veteriner', 'Tasarımcı'];
const strengths = ['Problem Çözme', 'İletişim', 'Organizasyon', 'Yaratıcılık', 'Empati', 'Analitik Düşünme', 'Takım Çalışması', 'Liderlik', 'Adaptasyon', 'Öğrenme Hızı', 'El Becerisi', 'Hafıza'];
const avatars = ['👧', '👦', '👩', '👨', '🧑‍🎨', '🧑‍🔬', '🧑‍🌾', '🧑‍🏫', '🧑‍💻', '🧑‍🍳', '🧑‍✈️', '🧑‍🎤'];

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
    avatar: '',
    personality: [],
    hobbies: [],
    dreams: [],
    strengths: []
  });
  const [step, setStep] = useState(1);
  const [showResult, setShowResult] = useState(false);

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
          <h1 className="text-3xl font-bold text-white mb-4">Karakter Oluşturucu</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Kendi özgün karakterini tasarlamak ve gelişim yolculuğuna başlamak için lütfen giriş yap.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/giris" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
              Giriş Yap
            </Link>
            <Link href="/" className="text-slate-500 text-sm hover:text-slate-300">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSelect = (category: keyof Character, item: string) => {
    if (category === 'avatar') {
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
    if (step < 6) setStep(step + 1);
    else setShowResult(true);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">
        <span>İsim & Görünüm</span>
        <span>Kişilik</span>
        <span>Hedefler</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / 6) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">İsmin Nedir?</h2>
            <p className="text-slate-400">Karakterine vereceğin isim, onun hikayesinin başlangıcıdır.</p>
            <input
              type="text"
              value={character.name}
              onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Örn: Cesur Gezgin"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Görünümünü Seç</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect('avatar', avatar)}
                  className={`text-4xl p-4 rounded-xl transition-all ${character.avatar === avatar
                    ? 'bg-blue-600 scale-110 shadow-lg ring-2 ring-blue-400'
                    : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                >
                  {avatar}
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
          3: { title: 'Kişilik Özellikleri', data: personalityTraits, key: 'personality' as keyof Character, limit: 3 },
          4: { title: 'İlgi Alanları & Hobiler', data: hobbies, key: 'hobbies' as keyof Character, limit: 3 },
          5: { title: 'Gelecek Hayalleri', data: dreams, key: 'dreams' as keyof Character, limit: 3 },
          6: { title: 'Güçlü Yönlerin', data: strengths, key: 'strengths' as keyof Character, limit: 3 }
        }[step]!;

        const currentSelection = character[config.key] as string[];

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-white">{config.title}</h2>
              <span className="text-sm font-bold text-blue-400">{currentSelection.length} / {config.limit} Seçildi</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {config.data.map((item, index) => {
                const isSelected = currentSelection.includes(item);
                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(config.key, item)}
                    className={`p-3 rounded-lg text-sm font-bold transition-all text-left ${isSelected
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                    {item}
                    {isSelected && <span className="float-right">✓</span>}
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

  const canProceed = () => {
    if (step === 1) return character.name.length > 2;
    if (step === 2) return !!character.avatar;
    // For array steps, require at least 1 selection
    const key = { 3: 'personality', 4: 'hobbies', 5: 'dreams', 6: 'strengths' }[step] as keyof Character;
    return (character[key] as string[]).length > 0;
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Confetti numberOfPieces={300} recycle={false} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden"
        >
          {/* Card Header Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0 text-center">
              <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-8xl shadow-2xl border-4 border-slate-700 mb-4 mx-auto">
                {character.avatar}
              </div>
              <h2 className="text-2xl font-black text-white">{character.name}</h2>
              <div className="text-sm text-blue-400 font-bold tracking-widest uppercase mt-1">Gelişim Yolcusu</div>
            </div>

            <div className="flex-grow space-y-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kişilik</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.personality.map(p => <span key={p} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-bold">{p}</span>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Güçlü Yönler</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.strengths.map(p => <span key={p} className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-bold">{p}</span>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">İlgi Alanları</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.hobbies.map(p => <span key={p} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-bold">{p}</span>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hedefler</h3>
                  <div className="flex flex-wrap gap-2">
                    {character.dreams.map(p => <span key={p} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-bold">{p}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end gap-4">
            <button
              onClick={() => { setShowResult(false); setStep(1); setCharacter({ name: '', avatar: '', personality: [], hobbies: [], dreams: [], strengths: [] }); }}
              className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              Yeni Oluştur
            </button>
            <button
              onClick={async () => {
                try {
                  await api.post('/api/character/save', {
                    name: character.name,
                    appearance: { emoji: character.avatar },
                    values: [...character.personality, ...character.strengths],
                    goals: [...character.dreams, ...character.hobbies]
                  });
                  window.location.href = '/profil';
                } catch (e) {
                  console.error(e);
                  window.location.href = '/profil';
                }
              }}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition shadow-lg"
            >
              🚀 Maceraya Başla
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/50 border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Decorative Background Blob */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {renderProgress()}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between pt-8 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              Geri
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform ${canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {step === 6 ? 'Tamamla' : 'İlerle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 