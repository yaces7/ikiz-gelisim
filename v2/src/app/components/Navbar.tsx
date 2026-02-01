
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { href: '/dashboard', label: 'Panel', icon: '📊' },
        { href: '/modul', label: 'Modüller', icon: '📚' },
        { href: '/simulasyon', label: 'Simülasyonlar', icon: '🎮' },
        { href: '/gunluk', label: 'Günlük', icon: '📝' },
        { href: '/testler', label: 'Testler', icon: '📋' },
    ];

    const parentLinks = [
        { href: '/ebeveyn', label: 'Ebeveyn Paneli', icon: '👨‍👩‍👧' },
    ];

    const activeLinks = user?.role === 'parent' ? parentLinks : navLinks;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                            <span className="text-xl">👯</span>
                        </div>
                        <span className="text-xl font-bold text-white hidden sm:block">
                            İkiz <span className="text-gradient">Gelişim</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {isAuthenticated && activeLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2"
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link href="/profil" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium text-white">{user?.username}</p>
                                        <p className="text-xs text-slate-400">Lv. {user?.level}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Çıkış
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/giris" className="btn-ghost px-4 py-2 rounded-lg text-sm">
                                    Giriş
                                </Link>
                                <Link href="/onboarding" className="btn-primary px-4 py-2 rounded-lg text-sm">
                                    Başla
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 text-white"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-strong border-t border-white/10"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated && activeLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
