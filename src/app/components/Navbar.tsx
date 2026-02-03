'use client';

import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';


import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <NavbarContent />
    </Suspense>
  );
};

const NavbarContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState('konular');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const currentPath = pathname.replace('/', '');
    if (pathname === '/') {
      const tab = searchParams.get('tab');
      setActiveRoute(tab || 'konular');
    } else {
      setActiveRoute(currentPath);
    }
  }, [pathname, searchParams]);

  const handleNavigation = (route: string) => {
    setIsMobileMenuOpen(false);
    switch (route) {
      case 'konular': router.push('/'); break;
      case 'carkifelek': router.push('/carkifelek'); break;
      case 'testler': router.push('/testler'); break;
      case 'gunluk': router.push('/gunluk'); break;
      case 'etkinlikler': router.push('/etkinlikler'); break;
      case 'oyunlar': router.push('/oyunlar'); break;
      case 'ebeveyn': router.push('/ebeveyn'); break;
      case 'karakter-oyunu': router.push('/karakter-oyunu'); break;
      default: router.push('/');
    }
  };

  const getButtonClass = (route: string) => {
    const isActive = activeRoute === route;
    return `w-full md:w-auto text-left md:text-center px-4 py-2.5 md:py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
      ? 'bg-blue-600 text-white shadow-lg'
      : 'text-gray-300 hover:bg-white/10'
      }`;
  };

  const menuItems = [
    'konular',
    'carkifelek',
    'testler',
    'gunluk',
    'etkinlikler',
    'oyunlar',
    'karakter-oyunu',
    ...(user?.role === 'parent' || user?.role === 'admin' ? ['ebeveyn'] : [])
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo / Title */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              İKİZ GELİŞİM
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((route) => (
              <motion.button
                key={route}
                onClick={() => handleNavigation(route)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={getButtonClass(route)}
              >
                {route.charAt(0).toUpperCase() + route.slice(1).replace('-', ' ')}
              </motion.button>
            ))}
          </div>

          {/* Right Section (Auth) */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/profil">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                    Profil
                  </motion.button>
                </Link>
                <button onClick={logout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/giris" className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2">Giriş Yap</Link>
                <Link href="/kayit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition">Kayıt Ol</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-white border border-white/10"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 border-b border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-6 space-y-2">
              {menuItems.map((route) => (
                <button
                  key={route}
                  onClick={() => handleNavigation(route)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeRoute === route ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  <span className="w-2 h-2 rounded-full border border-current opacity-40" />
                  {route.charAt(0).toUpperCase() + route.slice(1).replace('-', ' ')}
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-white/5 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-bold text-sm">
                      <span className="text-lg">👤</span> Profilim
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 font-bold text-sm hover:bg-red-500/5">
                      <span className="text-lg">🚪</span> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-center text-white font-bold text-sm bg-white/5 border border-white/10">Giriş Yap</Link>
                    <Link href="/kayit" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-center text-white font-bold text-sm bg-blue-600 shadow-xl shadow-blue-900/40">Kayıt Ol</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar; 