'use client';

export default function DataLogicPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-12 font-serif leading-relaxed">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl p-12 rounded-lg print:shadow-none">

                {/* Header */}
                <div className="border-b-2 border-slate-200 pb-8 mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Veri Toplama ve Hesaplama Metodolojisi</h1>
                    <div className="flex justify-between text-sm text-slate-500 uppercase tracking-widest font-sans">
                        <span>TÜBİTAK 2204-A Projesi</span>
                        <span>Gizli Jüri Dokümanı</span>
                    </div>
                </div>

                {/* 1. SECTION: Bireyselleşme Katsayısı */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">FORMÜL 1</span>
                        Me/We Ratio (Bireyselleşme Oranı)
                    </h2>
                    <p className="mb-6 text-slate-600">
                        Kullanıcının yazdığı günlüklerdeki dil kullanımından yola çıkarak, bireyselleşme seviyesini ölçen temel metriğimizdir.
                    </p>

                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-300 font-mono text-sm mb-6">
                        <p className="mb-2 text-slate-500">// Hesaplama Algoritması</p>
                        <p className="font-bold text-slate-800">
                            MeRatio = (Ben Kelimeleri) / (Ben Kelimeleri + Biz Kelimeleri + 1)
                        </p>
                        <ul className="mt-4 space-y-1 text-slate-600">
                            <li>• <span className="text-blue-600">Ben Kelimeleri:</span> "ben", "kendim", "benim", "bana"</li>
                            <li>• <span className="text-purple-600">Biz Kelimeleri:</span> "biz", "ikizim", "kardeşim", "beraber"</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50">
                            <span className="font-bold block text-red-800">0.0 - 0.4 (Bağımlı)</span>
                            Kişi kendini sürekli ikiziyle birlikte tanımlıyor. Ayrışma henüz başlamamış.
                        </div>
                        <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                            <span className="font-bold block text-green-800">0.6 - 1.0 (Bireysel)</span>
                            Kişi kendi kararlarını ve duygularını sahipleniyor. Sağlıklı seviye.
                        </div>
                    </div>
                </section>

                {/* 2. SECTION: Sentiment Analysis */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-3">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">FORMÜL 2</span>
                        Duygu Analizi (Sentiment Score)
                    </h2>
                    <p className="mb-4 text-slate-600">
                        Groq AI (LLaMA-3) kullanılarak metnin duygusal tonu 0 ile 100 arasında puanlanır.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700">
                        <li><strong>0-40:</strong> Negatif (Kaygı, çatışma, üzüntü)</li>
                        <li><strong>41-60:</strong> Nötr (Durum tespiti, olay anlatımı)</li>
                        <li><strong>61-100:</strong> Pozitif (Umut, başarı, keyif)</li>
                    </ul>
                </section>

                {/* 3. SECTION: Oyun Puanlama */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">MANTIK</span>
                        Oyun Skorlarının Radara Dönüşümü
                    </h2>
                    <p className="mb-6 text-slate-600">
                        Choice Engine oyunlarında yapılan her seçim, arka planda belirli bir psikolojik boyuta etki eder. Bu puanlar toplanarak "Gelişim Radarı"nı oluşturur.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-300">
                                    <th className="p-3 font-bold text-slate-700">Oyun Modülü</th>
                                    <th className="p-3 font-bold text-slate-700">Etkilediği Boyut</th>
                                    <th className="p-3 font-bold text-slate-700">Puanlama Mantığı</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                <tr>
                                    <td className="p-3">Sınır Savunması</td>
                                    <td className="p-3 text-blue-600 font-bold">Özerklik</td>
                                    <td className="p-3">"Hayır" deme sıklığı ve kendi alanını koruma kararları.</td>
                                </tr>
                                <tr>
                                    <td className="p-3">İletişim Labirenti</td>
                                    <td className="p-3 text-purple-600 font-bold">İletişim</td>
                                    <td className="p-3">Duygularını açıkça ifade etme (Atılganlık) puanı.</td>
                                </tr>
                                <tr>
                                    <td className="p-3">Ayna Oyunu</td>
                                    <td className="p-3 text-green-600 font-bold">Farkındalık</td>
                                    <td className="p-3">Kendi özelliklerini ikizinden ayırt etme başarısı.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. SECTION: Jüri Sunum Notları */}
                <section className="bg-yellow-50 p-8 rounded-xl border border-yellow-200">
                    <h3 className="text-xl font-bold text-yellow-800 mb-4">🎙️ Jüriye Ne Söylemelisiniz?</h3>
                    <div className="space-y-4 text-slate-700">
                        <p>
                            <strong>Soru:</strong> "Bu verilerin doğruluğunu nasıl sağlıyorsunuz?"<br />
                            <strong>Cevap:</strong> "Sistemimiz hibrit bir yapı kullanıyor. Hem kural tabanlı algoritmalar (kelime sayımı) hem de yapay zeka (LLaM v3) aynı anda çalışarak birbirini doğruluyor (Cross-Validation). Örneğin AI servisi yanıt vermezse, kural tabanlı sistem devreye girerek veri kaybını önlüyor."
                        </p>
                        <p>
                            <strong>Soru:</strong> "Neden sadece anket yapmadınız?"<br />
                            <strong>Cevap:</strong> "Anketler kişinin o anki beyanına dayanır. Ancak bizim sistemimiz, 'Choice Engine' oyunları ve 'Günlük Analizi' sayesinde sürece yayılmış, davranışsal verileri toplar. Bu da anlık değil, süreç odaklı ve daha objektif bir sonuç verir."
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}
