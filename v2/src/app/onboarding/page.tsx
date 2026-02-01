
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const STEPS = [
    {
        id: 'welcome',
        title: 'Hoş Geldin! 👋',
        description: 'Bu platform, ikiz bireylerin bireyselleşme sürecini desteklemek için tasarlandı.',
        icon: '🌟'
    },
    {
        id: 'consent',
        title: 'Aydınlatılmış Onam',
        description: 'Araştırma sürecine katılımınız için onayınız gerekmektedir.',
        icon: '📋'
    },
    {
        id: 'info',
        title: 'Demografik Bilgiler',
        description: 'Seni biraz tanımamız gerekiyor.',
        icon: '👤'
    },
    {
        id: 'register',
        title: 'Hesap Oluştur',
        description: 'Yolculuğa başlamak için hesabını oluştur.',
        icon: '🚀'
    }
];

export default function OnboardingPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [consent, setConsent] = useState(false);
    const [formData, setFormData] = useState({
        twin_type: '',
        birth_order: '',
        age: '',
        gender: '',
        family_code: '',
        username: '',
        email: '',
        password: ''
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role: 'twin',
                    age: parseInt(formData.age) || null,
                    birth_order: parseInt(formData.birth_order) || null
                })
            });

            const data = await res.json();

            if (data.success) {
                login(data.token, data.user);
                router.push('/testler?type=pre'); // Ön-testlere yönlendir
            } else {
                setError(data.error || 'Kayıt başarısız');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-lg">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {STEPS.map((step, index) => (
                            <div
                                key={step.id}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${index <= currentStep
                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                                        : 'bg-slate-800 text-slate-500'
                                    }`}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-strong rounded-3xl p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">{STEPS[currentStep].icon}</div>
                            <h2 className="text-2xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
                            <p className="text-slate-400">{STEPS[currentStep].description}</p>
                        </div>

                        {/* Step 0: Welcome */}
                        {currentStep === 0 && (
                            <div className="space-y-4 text-center">
                                <p className="text-slate-300">6 haftalık bilimsel program ile bireyselleşme yolculuğuna başla.</p>
                                <div className="flex flex-wrap gap-4 justify-center mt-6">
                                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">📚 Modüller</div>
                                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">🎮 Simülasyonlar</div>
                                    <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm">📝 Günlük</div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Consent */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="bg-slate-900 p-4 rounded-xl max-h-60 overflow-y-auto text-sm text-slate-300 space-y-2">
                                    <p><strong>Araştırma Hakkında Bilgilendirme:</strong></p>
                                    <p>Bu çalışma, ikiz bireylerin bireyselleşme süreçlerini incelemeyi amaçlamaktadır. Katılımınız tamamen gönüllüdür ve istediğiniz zaman çekilebilirsiniz.</p>
                                    <p>Verileriniz anonim olarak saklanacak ve yalnızca araştırma amaçlı kullanılacaktır. Kişisel bilgileriniz üçüncü şahıslarla paylaşılmayacaktır.</p>
                                    <p>Çalışma süresince interaktif modüller, simülasyonlar ve testler tamamlamanız istenecektir.</p>
                                </div>
                                <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="w-5 h-5 rounded accent-indigo-500"
                                    />
                                    <span className="text-slate-300">Yukarıdaki bilgileri okudum ve araştırmaya katılmayı kabul ediyorum.</span>
                                </label>
                            </div>
                        )}

                        {/* Step 2: Demographics */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">İkiz Türü</label>
                                        <select
                                            value={formData.twin_type}
                                            onChange={(e) => setFormData({ ...formData, twin_type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                        >
                                            <option value="">Seçin</option>
                                            <option value="identical">Tek Yumurta</option>
                                            <option value="fraternal">Çift Yumurta</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Doğum Sırası</label>
                                        <select
                                            value={formData.birth_order}
                                            onChange={(e) => setFormData({ ...formData, birth_order: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                        >
                                            <option value="">Seçin</option>
                                            <option value="1">İlk Doğan</option>
                                            <option value="2">İkinci Doğan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Yaş</label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            placeholder="18"
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Cinsiyet</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                        >
                                            <option value="">Seçin</option>
                                            <option value="male">Erkek</option>
                                            <option value="female">Kadın</option>
                                            <option value="other">Diğer</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Aile Kodu (Opsiyonel)</label>
                                    <input
                                        type="text"
                                        value={formData.family_code}
                                        onChange={(e) => setFormData({ ...formData, family_code: e.target.value })}
                                        placeholder="ABC123"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">İkiziniz veya ebeveynleriniz sisteme kayıtlıysa bu kodu kullanabilirsiniz.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Register */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="ikiz_kullanici"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="ornek@email.com"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Şifre</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500"
                                    />
                                </div>
                                {error && (
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                )}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            {currentStep > 0 ? (
                                <button onClick={handleBack} className="btn-ghost px-6 py-3">
                                    ← Geri
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={currentStep === 1 && !consent}
                                    className={`btn-primary px-6 py-3 ${currentStep === 1 && !consent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Devam →
                                </button>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={loading || !formData.username || !formData.email || !formData.password}
                                    className="btn-primary px-6 py-3"
                                >
                                    {loading ? 'Kaydediliyor...' : 'Yolculuğa Başla →'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
