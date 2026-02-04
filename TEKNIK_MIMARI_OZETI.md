# TÜBİTAK Projesi Teknik Mimari ve Jüri Sunum Notları

## 1. Teknik Mimari Özeti (Architecture Overview)

Projemiz, modern web standartlarına uygun, ölçeklenebilir ve güvenli bir **Microservices-benzeri** mimari üzerine kurulmuştur.

### **Frontend (Ön Yüz)**
*   **Teknoloji:** Next.js 14 (React)
*   **Neden Seçildi?** Hem SEO performansı (Server Side Rendering) hem de zengin interaktif kullanıcı deneyimi (Client Side Rendering) sunduğu için. Özellikle "Choice Engine" gibi oyunlaştırma modüllerinde gerçek zamanlı etkileşim gerektiği için React'in state yönetimi kritikti.
*   **Sunucu:** Vercel (Global CDN dağıtımı için).

### **Backend (Arka Yüz)**
*   **Teknoloji:** Node.js & Express
*   **Neden Seçildi?** Non-blocking I/O yapısı sayesinde aynı anda binlerce öğrencinin veri girişini (günlük, oyun skoru) gecikmesiz işleyebiliyor.
*   **Real-time İletişim:** `Socket.io` kullanılarak, oyunlarda anlık geri bildirim ve sunucu durumu kontrolü sağlanıyor.
*   **Sunucu:** Render (Container tabanlı deployment).

### **Veritabanı & Yapay Zeka**
*   **Veritabanı:** MongoDB (NoSQL).
    *   *Neden?* Günlük girdileri, oyun parametreleri ve sürekli değişen kullanıcı profilleri gibi "yapısal olmayan" verileri esnek bir şekilde tutmak için. Şema değişikliklerinde sistemi durdurmaya gerek kalmıyor.
*   **AI Entegrasyonu:** Groq API (LLaMA-3 model).
    *   *Görevi:* Öğrencilerin yazdığı günlükleri analiz edip "Bireyselleşme Skoru" (Me/We Ratio) hesaplamak.

---

## 2. Karşılaşılan Teknik Zorluklar ve Çözümleri (Jüriye Anlatılacak Kısım)

Jüri genellikle "Hiç sorun yaşadınız mı?" diye sorar. Bu, projenin gerçekten sizin tarafınızdan yapıldığını kanıtlayan kısımdır.

### **Zorluk 1: CORS (Cross-Origin Resource Sharing) ve Güvenlik Duvarları**
*   **Sorun:** Frontend (Vercel) ve Backend (Render) farklı sunucularda olduğu için, tarayıcılar güvenlik gereği iletişimi engelledi (CORS hatası). Özellikle oyun verileri ve giriş işlemleri bloklandı.
*   **Çözüm:** Backend tarafında sadece kütüphane bazlı değil, **manuel HTTP Header Injection** yöntemiyle özel bir middleware yazdık. Bu sayede tüm tarayıcıların (Chrome, Safari, Firefox) "Pre-flight" (ön kontrol) isteklerini başarıyla yanıtladık ve sistemi "Ultra Resilient" (Kırılmaz) hale getirdik.

### **Zorluk 2: Gerçek Zamanlı Veri ve Socket Bağlantısı**
*   **Sorun:** Oyun oynarken sunucu uyku moduna geçerse bağlantı kopuyordu.
*   **Çözüm:** Backend'e bir "API Sağlık (Health Check)" mekanizması kurduk. Frontend, kullanıcı daha siteye girer girmez sunucuyu "dürtüyor" (ping) ve bağlantıyı sıcak tutuyor. Ayrıca Socket.io bağlantısını HTTP sunucusuyla birleştirerek tek port üzerinden hem veri hem dosya akışı sağladık.

### **Zorluk 3: Yapay Zeka Maliyeti ve Hızı**
*   **Sorun:** OpenAI (GPT-4) kullanımı maliyetli ve yavaştı.
*   **Çözüm:** Daha hızlı ve açık kaynaklı dilleri destekleyen **Groq API** altyapısına geçtik. Bu sayede günlük analizleri 0.5 saniye gibi bir sürede tamamlanıyor ve kullanıcı beklemiyor.

---

## 3. Bilimsel Veri Toplama Metodolojisi

Sistem, sadece bir uygulama değil, bir **Veri Toplama Aracıdır**.

1.  **Me/We Ratio (Ben/Biz Oranı):**
    *   Günlüklerdeki "Ben", "Kendim" kelimeleri ile "Biz", "İkizim" kelimelerinin oranını ölçüyoruz.
    *   *Hipotez:* Program ilerledikçe "Ben" oranı artmalı.

2.  **Duygu Analizi (Sentiment Analysis):**
    *   Yazılan metinlerin duygusal tonunu (Pozitif/Negatif) puanlıyoruz (0-100).

3.  **Kazanım Takibi:**
    *   Oyunlardaki seçimler (Choice Engine) doğrudan veritabanına "Özerklik Puanı" olarak işlenir.

Bu veriler, **Ebeveyn Paneli** (Parent Dashboard) üzerinden velilere grafiklerle sunulur, böylece gelişim somut olarak kanıtlanır.
