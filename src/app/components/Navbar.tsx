'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';


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
  const { theme, toggleTheme } = useTheme();

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
    switch (route) {
      case 'konular':
        router.push('/');
        break;
      case 'carkifelek':
        router.push('/carkifelek');
        break;
      case 'testler':
        router.push('/testler');
        break;
      case 'etkinlikler':
        router.push('/etkinlikler');
        break;
      case 'oyunlar':
        router.push('/oyunlar');
        break;
      case 'ebeveyn':
        router.push('/ebeveyn');
        break;
      case 'karakter-oyunu':
        router.push('/karakter-oyunu');
        break;
      default:
        router.push('/');
    }
  };

  const getButtonClass = (route: string) => {
    const isActive = activeRoute === route;
    return `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive
      ? 'bg-blue-600 text-white shadow-lg'
      : 'text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-white/10'
      }`;
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {['konular', 'carkifelek', 'testler', 'etkinlikler', 'oyunlar', 'karakter-oyunu', 'ebeveyn'].map((route) => (
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
          <div className="flex items-center space-x-3 ml-4">


            <Link href="/giris">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
              >
                Giriş
              </motion.button>
            </Link>
            <Link href="/kayit">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
              >
                Kayıt
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 