
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import Confetti from 'react-confetti';
import api from '../lib/api';

// Categories for Todo List
type Category = 'bireysel' | 'sosyal' | 'akademik';

// Mock Data - In real app, fetch from API
const initialTasks = [
  { id: 1, text: "Bugün 30 dakika tek başına kitap oku.", category: 'bireysel', xp: 50, completed: false },
  { id: 2, text: "Farklı bir arkadaşınla öğle yemeği ye.", category: 'sosyal', xp: 70, completed: false },
  { id: 3, text: "Odanı düzenle ve kendine ait bir köşe yarat.", category: 'bireysel', xp: 60, completed: false },
  { id: 4, text: "İkizinden bağımsız bir ders programı hazırla.", category: 'akademik', xp: 80, completed: false },
  { id: 5, text: "Bir hobini icra et (Resim, Müzik, Spor).", category: 'bireysel', xp: 50, completed: false },
  { id: 6, text: "Bugün 'hayır' demen gereken bir durumda sınır koy.", category: 'sosyal', xp: 100, completed: false },
  { id: 7, text: "Kendini ifade eden bir yazı yaz (Günlük kısmında).", category: 'bireysel', xp: 40, completed: false },
  { id: 8, text: "Gelecek hedeflerinle ilgili bir araştırma yap.", category: 'akademik', xp: 60, completed: false },
];

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [totalXP, setTotalXP] = useState(0);

  // Initial check (mock persistence)
  useEffect(() => {
    // In real app, fetch user task status
  }, []);

  const toggleTask = async (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        // If marking as complete, add XP
        if (!t.completed) {
          setTotalXP(x => x + t.xp);
          saveTaskCompletion(t.text, t.xp);
        } else {
          setTotalXP(x => x - t.xp);
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const saveTaskCompletion = async (taskText: string, xp: number) => {
    try {
      await api.post('/api/task/complete', { task: taskText, score: xp });
    } catch (e) { console.error("Task Save Error", e); }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.category === filter);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white">Görev Panosu Kilitli</h2>
          <p className="text-slate-400">Günlük görevlerini takip etmek için giriş yapmalısın.</p>
          <Link href="/giris" className="inline-block px-8 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Günlük Görev Panosu</h1>
            <p className="text-slate-400">Bireyselleşme yolculuğundaki adımların.</p>
          </div>
          <div className="mt-6 md:mt-0 text-right">
            <div className="text-sm text-slate-500 uppercase font-bold tracking-widest mb-1">Toplam XP</div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 animate-pulse">
              {totalXP}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'bireysel', 'sosyal', 'akademik'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl font-bold capitalize transition-all whitespace-nowrap ${filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {f === 'all' ? 'Tümü' : f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => toggleTask(task.id)}
                className={`
                                    group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 overflow-hidden
                                    ${task.completed
                    ? 'bg-slate-900/30 border-green-500/30 opacity-75'
                    : 'bg-slate-900 border-white/10 hover:border-blue-500/50 hover:shadow-xl'
                  }
                                `}
              >
                {/* Progress Bar Background for Completed */}
                {task.completed && (
                  <motion.div
                    layoutId={`bg-${task.id}`}
                    className="absolute inset-0 bg-green-500/5 z-0"
                  />
                )}

                <div className="flex items-center gap-6 z-10 flex-1">
                  <div className={`
                                        w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                                        ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-600 group-hover:border-blue-400'}
                                    `}>
                    {task.completed && <span className="text-white font-bold">✓</span>}
                  </div>
                  <div>
                    <p className={`text-lg font-medium transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.text}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-md bg-slate-800 ${task.category === 'bireysel' ? 'text-blue-400' :
                      task.category === 'sosyal' ? 'text-purple-400' : 'text-orange-400'
                      }`}>
                      {task.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-right z-10">
                  <span className={`text-sm font-bold ${task.completed ? 'text-green-400' : 'text-slate-500'}`}>
                    +{task.xp} XP
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}