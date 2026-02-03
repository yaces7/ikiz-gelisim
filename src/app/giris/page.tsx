'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';
import api from '../lib/api';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
// Mock Lottie JSON (In real app, import from file)
const animationData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 180,
  w: 500,
  h: 500,
  nm: "Login Animation",
  ddd: 0,
  assets: [],
  layers: [] // Empty for now, just to prevent error if it tries to load
};

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/auth/login', { username, password });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px] animate-blob"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl flex overflow-hidden z-10"
      >
        {/* Left Side: Animation & Welcome */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white hidden md:flex flex-col justify-between relative">
          <div className="z-10">
            <h1 className="text-4xl font-bold mb-4">Gelişim Yolculuğu</h1>
            <p className="opacity-90 leading-relaxed">
              Bireyselleşme sürecinizi bilimsel verilerle takip edin. Araştırma portalına hoş geldiniz.
            </p>
          </div>

          {/* Lottie Placeholder - Imagine a growing tree or DNA helix here */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-64 h-64 border-4 border-white/20 rounded-full animate-spin-slow"></div>
            <div className="w-48 h-48 border-4 border-white/20 rounded-full animate-reverse-spin absolute"></div>
          </div>

          <p className="text-xs opacity-60 z-10">TÜBİTAK Projesi © 2026</p>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white/60 dark:bg-black/60 backdrop-blur-md">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Giriş Yap</h2>
          <p className="text-gray-500 mb-8 text-sm">Hesabınıza erişmek için bilgilerinizi girin.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="Örn: deney_ikiz1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yükleniyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Hesabınız yok mu? <a href="/kayit" className="text-purple-600 font-bold hover:underline">Araştırmaya Katılın</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}