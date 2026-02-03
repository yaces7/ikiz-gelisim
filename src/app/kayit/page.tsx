'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Family, 3: Account, 4: Consent
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'twin',
    twinType: 'monozygotic', // Tek yumurta
    birthDate: '',
    gender: '',
    familyCode: '',
    isNewFamily: true
  });
  const [loading, setLoading] = useState(false);

  const generateFamilyCode = () => {
    const code = 'FAM' + Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, familyCode: code, isNewFamily: true });
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/register', formData);
      setTimeout(() => router.push('/giris'), 1000);
    } catch (e: any) {
      alert(e.message || 'Kayıt başarısız');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass rounded-3xl p-8 relative overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-200">
          <motion.div
            className="h-full bg-green-500"
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Kişisel Bilgiler' :
              step === 2 ? 'Aile Eşleşmesi' :
                step === 3 ? 'Hesap Oluştur' : 'Aydınlatılmış Onam'}
          </h2>
          <p className="text-sm text-gray-500">Adım {step}/4</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <input
                placeholder="Ad Soyad"
                className="input-field"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Cinsiyet</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
                <input
                  type="date"
                  className="input-field"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rolünüz</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormData({ ...formData, role: 'twin' })}
                  className={`flex-1 py-2 rounded-lg border ${formData.role === 'twin' ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                >
                  İkiz
                </button>
                <button
                  onClick={() => setFormData({ ...formData, role: 'parent' })}
                  className={`flex-1 py-2 rounded-lg border ${formData.role === 'parent' ? 'bg-orange-500 text-white' : 'border-gray-300'}`}
                >
                  Ebeveyn
                </button>
              </div>

              {formData.role === 'twin' && (
                <div>
                  <label className="block text-sm font-bold mt-4 mb-2">İkiz Türü (Araştırma İçin)</label>
                  <select
                    className="input-field"
                    value={formData.twinType}
                    onChange={(e) => setFormData({ ...formData, twinType: e.target.value })}
                  >
                    <option value="monozygotic">Tek Yumurta (Monozigotik)</option>
                    <option value="dizygotic">Çift Yumurta (Dizigotik)</option>
                    <option value="unknown">Bilmiyorum</option>
                  </select>
                </div>
              )}

              <button onClick={() => setStep(2)} className="btn-primary w-full mt-6">Devam Et ➔</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6 text-center">
              <p className="text-gray-600">İkiziniz veya ebeveyniniz daha önce kayıt oldu mu?</p>

              <div className="space-y-4">
                <button
                  onClick={generateFamilyCode}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${formData.isNewFamily ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                >
                  <h3 className="font-bold">Hayır, İlk Ben Kayıt Oluyorum</h3>
                  <p className="text-xs text-gray-500">Size özel bir Aile Kodu oluşturacağız.</p>
                  {formData.isNewFamily && formData.familyCode && (
                    <div className="mt-2 text-2xl font-mono font-bold text-green-700 tracking-widest">
                      {formData.familyCode}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setFormData({ ...formData, isNewFamily: false, familyCode: '' })}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${!formData.isNewFamily ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                >
                  <h3 className="font-bold">Evet, Kodum Var</h3>
                  {!formData.isNewFamily && (
                    <input
                      placeholder="Kodu Girin (Örn: FAM1234)"
                      className="mt-2 w-full p-2 text-center text-lg border-b-2 bg-transparent focus:outline-none"
                      value={formData.familyCode}
                      onChange={(e) => setFormData({ ...formData, familyCode: e.target.value.toUpperCase() })}
                    />
                  )}
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="text-gray-500 w-1/3">Geri</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.familyCode}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Devam Et ➔
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
              <input
                placeholder="Kullanıcı Adı"
                className="input-field"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Şifre"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                type="password"
                placeholder="Şifre Tekrar"
                className="input-field"
              />

              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(2)} className="text-gray-500 w-1/3">Geri</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.username || !formData.password}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  İncele ve Onayla ➔
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4 text-left">
              <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-xl text-xs text-gray-600 border border-gray-200">
                <h4 className="font-bold text-sm mb-2 text-black">Aydınlatılmış Onam Formu</h4>
                <p className="mb-2">Bu araştırma, ikiz ergenlerin bireyselleşme süreçlerini incelemek amacıyla TÜBİTAK projesi kapsamında yürütülmektedir.</p>
                <p className="mb-2"><strong>1. Gizlilik:</strong> Verileriniz anonimleştirilecek ve sadece bilimsel amaçla kullanılacaktır. KVKK kapsamında korunmaktadır.</p>
                <p className="mb-2"><strong>2. Gönüllülük:</strong> Araştırmadan istediğiniz an çekilebilirsiniz.</p>
                <p><strong>3. Grup Ataması:</strong> Sistem sizi otomatik olarak "Deney" veya "Kontrol" grubuna atayacaktır. Gruba göre göreceğiniz içerikler farklılık gösterebilir.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="consent" className="w-5 h-5 accent-green-600" />
                <label htmlFor="consent" className="text-sm">Yukarıdaki koşulları okudum, kabul ediyorum.</label>
              </div>

              <button
                onClick={handleRegister}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
              >
                {loading ? 'Kayıt Yapılıyor...' : 'Araştırmayı Başlat'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem; /* p-3 */
                    border-radius: 0.75rem; /* rounded-xl */
                    background-color: rgb(249 250 251); /* bg-gray-50 */
                    border-width: 1px;
                    border-color: rgb(229 231 235); /* border-gray-200 */
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
                .input-field:focus {
                    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
                    --tw-ring-color: rgb(168 85 247); /* ring-purple-500 */
                }
                .btn-primary {
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                    background-image: linear-gradient(to right, rgb(147 51 234), rgb(79 70 229));
                    color: white;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    transition: transform 0.2s;
                }
                .btn-primary:hover {
                    transform: scale(1.02);
                }
            `}</style>
    </div>
  );
}