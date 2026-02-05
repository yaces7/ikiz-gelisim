# İkiz Gelişim Platformu (İGP) - Kapsamlı Teknik ve Fonksiyonel Proje Raporu

## 1. Proje Vizyonu ve Amacı
İkiz Gelişim Platformu (İGP), ikiz çocukların birbirlerine olan aşırı bağımlılıklarını (twin-bond) dengelemek, bireysel kimlik farkındalıklarını (individuation) artırmak ve ebeveynlere bu süreçte bilimsel kanıta dayalı, yapay zeka destekli rehberlik sunmak amacıyla geliştirilmiş bütüncül bir ekosistemdir. Platform, oyunlaştırma (gamification) ve derin öğrenme modellerini kullanarak ergenlik öncesi ve sırasındaki ikizlerin sağlıklı birer birey olarak yetişmesini hedefler.

---

## 2. Teknik Mimari (Tech Stack)

### 2.1. Frontend Katmanı (Client-Side)
*   **Framework**: Next.js 14+ (App Router). Server-side rendering ve client-side interaktivite dengelenmiştir.
*   **Styling**: Vanilla CSS ve TailwindCSS. "Glassmorphism" ve "Future Dark" teması uygulanmıştır.
*   **Animasyon**: Framer Motion. Akıcı geçişler, modül açılışları ve oyun içi mikro-etkinlikler için kullanılır.
*   **Veri Görselleştirme**: Chart.js ve React-Chartjs-2. Radar Chart (Gelişim Radarı) ve Line Chart (Haftalık İlerleme) için kullanılır.
*   **State Management**: React Context API (`AuthContext`). Kullanıcı oturumu, `active_week` ve XP değerleri global olarak yönetilir.

### 2.2. Backend Katmanı (Server-Side)
*   **Runtime**: Node.js & Express.js.
*   **Güvenlik**: JWT (JSON Web Token) tabanlı yetkilendirme sistemi ve Bcrypt şifreleme.
*   **Middleware**: `authMiddleware` ile tüm rotalar (Auth hariç) korunur.

### 2.3. Veri Katmanı ve AI
*   **Veritabanı**: MongoDB (Cloud Atlas). NoSQL yapısı sayesinde esnek veri saklama.
*   **Yapay Zeka**: Groq API (Llama-3-70B). 128k context window kapasitesi ile tüm çocuk verilerini tek seferde analiz ederek ebeveynlere özel rapor sunar.

---

## 3. Haftalık Gelişim Programı (6 Haftalık Müfredat)

Her hafta, projenin temelini oluşturan 3 ana testten oluşur (Toplam 18 test).

### Hafta 1: Kimlik Gelişimi ve Farkındalık
**Amaç**: "Biz" kavramından sıyrılıp "Ben" kavramını inşa etmek.
*   **Test 1 (Kimlik Aynası)**: Fiziksel benzerliklerin ötesindeki ruhsal farkları ölçer.
*   **Test 2 (Benlik Algısı)**: Karar verme süreçlerindeki özerkliği analiz eder.
*   **Test 3 (Duygusal Ayrışma)**: İkizinin acısını veya sevincini kendisininkiyle karıştırmama becerisi.

### Hafta 2: Sosyal İlişkiler ve Sınırlar
**Amaç**: Ortak çevre yerine bireysel sosyal habitat oluşturma.
*   **Test 1 (Sosyal Çember)**: İkizinden bağımsız arkadaşlıkların derinliğini ölçer.
*   **Test 2 (Özel Alan ve Mahremiyet)**: Kapı kapatma, eşya paylaşımı gibi fiziksel sınırları sorgular.
*   **Test 3 (Hayır Diyebilme)**: İkizine karşı sınır koyma ve reddetme becerisini test eder.

### Hafta 3: Duygusal Yönetim ve Bağımsızlık
**Amaç**: Duygusal bulaşmayı (emotional contagion) yönetmek.
*   **Test 1 (Duygu Dedektifi)**: Hissedilen duygunun kaynağını (kendisi mi ikizi mi) buldurur.
*   **Test 2 (Çatışma Çözme Stili)**: Kardeş kavgalarındaki tutumu ve uzlaşma yeteneğini ölçer.
*   **Test 3 (Kıskançlık ve Takdir)**: Sağlıklı rekabet ile yıkıcı kıskançlık arasındaki dengeyi bulur.

### Hafta 4: Akademik ve Bilişsel Gelişim
**Amaç**: Öğrenme stillerini ayrıştırarak kıyaslamayı bitirmek.
*   **Test 1 (Öğrenme Stili)**: Görsel mi, işitsel mi yoksa dokunsal mı olduğunu keşfettirir.
*   **Test 2 (Dikkat ve Odaklanma)**: Yanında ikizi varken veya yokken çalışma verimini ölçer.
*   **Test 3 (Karar Verme Süreçleri)**: Akademik seçimlerdeki bireysel iradeyi test eder.

### Hafta 5: Problem Çözme ve Uyum
**Amaç**: Kriz anlarında ikizine yaslanmadan çözüm üretme.
*   **Test 1 (Kriz Yönetimi)**: Beklenmedik olaylar karşısındaki bireysel duruşu analiz eder.
*   **Test 2 (Empati Sınırı)**: Anlayış göstermekle kendini feda etmek arasındaki çizgiyi ölçer.
*   **Test 3 (İşbirliği Yeteneği)**: İki bağımsız birey olarak nasıl ortak çalışabileceklerini öğretir.

### Hafta 6: Gelecek Vizyonu ve Mezuniyet
**Amaç**: Bağımsız bir hayata hazırlık.
*   **Test 1 (Kariyer ve Hayaller)**: İleride farklı şehirlerde/işlerde olma ihtimaline hazırlık.
*   **Test 2 (Değişim ve Dönüşüm)**: 6 haftalık sürecin sonundaki farkındalık artışını ölçer.
*   **Test 3 (Mezuniyet Hazırlığı)**: Platform sonrası birey kalma sözünü ve hazırlığını yapar.

---

## 4. Temel Modüller ve Çalışma Mantığı

### 4.1. AI Destekli Karakter Oyunu (`/karakter-oyunu`)
*   **Mantık**: Çocuk hazır bir listeden özellik seçmez. "Rehber Bilge" ona 3-5 tane soyut ve eğlenceli soru sorar.
*   **AI Rolü**: Cevapları analiz eder ve çocuğa "Sen bir Kaşif'sin çünkü risk almayı seviyorsun" gibi özgün bir profil dökümü çıkarır.
*   **Çıktı**: 50 XP ödül ve kullanıcı profiline kaydedilen `personality`, `strengths` ve `avatar` verileri.

### 4.2. Günlük ve Duygu Analizi (`/gunluk`)
*   **Duygu Seçimi**: 5 farklı mood scale (Çok Mutlu - Çok Üzgün).
*   **AI Analizi**: Yazılan metin Groq API'ya gider. AI, metinden **"Me/We Ratio"** (Ben/Biz Oranı) çıkarır. Eğer çocuk "ben" kelimesini daha çok kullanıyorsa individüasyon skoru artar.

### 4.3. Ebeveyn Paneli (`/ebeveyn`)
*   **Veri Havuzu**: İkizlerin tüm test sonuçları, XP'leri, günlük temaları backend'de birleştirilir.
*   **AI Uzman Analizi**: Llama-3 modeli tüm bu devasa veri yığınını okur ve ebeveyne "İkizleriniz bu hafta birbirine fazla bağımlı görünüyor, onları hafta sonu farklı kurslara göndermeyi düşünün" gibi somut tavsiyeler verir.
*   **PDF Rapor**: Tek tıkla tüm sürecin kanıtlı dökümü alınabilir.

### 4.4. Çarkıfelek Görev Sistemi (`ChoiceEngine.tsx`)
*   **Mantık**: Rastgele görevler atanır (Örn: "Bugün tek başına kitap oku").
*   **Kayıt**: Görev tamamlandığında Interaction olarak kaydedilir ve gelişim radarına veri pompalar.

---

## 5. Veritabanı ve API Yapısı

### 5.1. Veri Şemaları (`models/index.js`)
*   **User**: `familyCode` ile ikizlerini ve ebeveyini tek bir aile ağacına bağlar. Kullanıcının hangi haftada olduğu (`active_week`) burada tutulur.
*   **Interaction**: Platformdaki "anlık" her şeyin kaydıdır. AI analiz sonuçları bu tablodadır.
*   **Score**: Testlerden alınan 0-100 arası puanlar, hangi haftaya ait olduğu bilgisiyle saklanır.

### 5.2. Kritik API Uç Noktaları
*   `POST /api/progression/select-week`: Kullanıcının aktif olduğu haftayı belirler.
*   `POST /api/character/analyze`: Oyun içi cevapları AI ile analiz eder.
*   `GET /api/parent/dashboard`: Ebeveyn için ikizlerin tüm verisini birleştirip AI analiziyle birlikte döner.

---

## 6. Proje Güvenliği ve Gizlilik
*   **Çocuk Gizliliği**: Çocukların günlük yazılarını ebeveynler **asla doğrudan okuyamazlar**. Ebeveynler sadece yazıda geçen duyguların özetini ve gelişim tavsiyesini görürler. Bu, çocuğun platforma %100 dürüstlükle güvenmesini sağlar.
*   **Erişim Kontrolü**: `authMiddleware` her isteği doğrular, familyCode eşleşmesi olmayan kullanıcılar birbirinin verisini göremez.

---

## 7. Gelişim Radarı (İndividüasyon Metrikleri)
Platform 6 ana boyutu ölçer:
1.  **Özerklik (Autonomy)**: Kendi başına karar verme.
2.  **Sınırlar (Boundaries)**: Fiziksel ve sosyal alanını koruma.
3.  **Duygusal Bağımsızlık**: Duygusal bulaşmadan kurtulma.
4.  **Sosyal Özerklik**: Bireysel arkadaşlıklar.
5.  **Bilişsel Farkındalık**: Kendi öğrenme biçimine hakimiyet.
6.  **Gelecek Bilinci**: Bağımsız bir gelecek vizyonu.

Bu metriklerin her biri testlerden, günlüklerden ve oyunlardan gelen verilerle anlık olarak güncellenir.
