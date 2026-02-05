# İkiz Gelişim Platformu (İGP) - Kapsamlı Teknik ve Fonksiyonel Proje Raporu

## 1. Proje Vizyonu ve Amacı
İkiz Gelişim Platformu (İGP), ikiz çocukların birbirlerine olan aşırı bağımlılıklarını (twin-bond) dengelemek, bireysel kimlik farkındalıklarını (individuation) artırmak ve ebeveynlere bu süreçte yapay zeka destekli rehberlik sunmak amacıyla geliştirilmiştir. Platform, oyunlaştırma ve derin öğrenme modellerini kullanarak ergenlik öncesi ikizlerin sağlıklı bireyler olarak yetişmesini hedefler.

---

## 2. Teknik Mimari (Tech Stack)

### 2.1. Frontend
*   **Framework**: Next.js 14+ (App Router).
*   **Animasyon**: Framer Motion (Akıcı geçişler ve oyun mekanikleri).
*   **Veri Görselleştirme**: Chart.js (Gelişim Radarı ve İlerleme Grafikleri).
*   **State**: React Context API (`AuthContext`).

### 2.2. Backend & Veritabanı
*   **Runtime**: Node.js & Express.js.
*   **Veritabanı**: MongoDB.
*   **AI**: Groq API (Llama-3-70B) ile gerçek zamanlı analiz.

---

## 3. Sayfa ve Modül Detayları

### 3.1. Ana Sayfa ve Haftalık Gelişim Programı (`/`)
Ana sayfa, projenin kalbi olan **6 Haftalık Gelişim Programı**'nı barındırır.
*   **İşleyiş**: Her hafta bir modüldür. Kullanıcı bir haftaya tıkladığında sayfa otomatik olarak yukarı kayar (Scroll-to-top) ve modül detayı açılır.
*   **Haftayı Etkinleştir**: Modül içindeki bu buton, kullanıcının `active_week` değerini günceller. Bu seçim, platformdaki tüm testleri, günlük sorularını ve oyun içeriklerini o haftanın temasına göre dinamik olarak değiştirir.

### 3.2. Çarkıfelek & Seçim Motoru (`ChoiceEngine.tsx`)
Ana sayfada ve oyun alanında yer alan bu modül, interaktif bir simülasyon motorudur.
*   **Mantık**: Kullanıcıya günlük hayat senaryoları sunulur (Örn: "İkizin senin yerine karar verdiğinde ne yaparsın?").
*   **Mekanik**: Her seçeneğin bir "Bireyselleşme Ağırlığı" vardır. Seçim yapıldığında AI tabanlı geri bildirim verilir ve kullanıcının **Bireyselleşme Skoru** anlık olarak güncellenir.
*   **XP Sistemi**: Her tamamlanan senaryo kullanıcıya XP kazandırır.

### 3.3. Gelişim Laboratuvarı - Testler (`/testler`)
Her haftaya özel olarak kurgulanmış 3 farklı test içerir (Toplam 18 test).
*   **Dinamik Yapı**: Sayfa, kullanıcının aktif haftasını kontrol eder ve sadece o haftanın testlerini getirir.
*   **Puanlama**: Testler sonucunda elde edilen puanlar `Score` tablosuna kaydedilir ve Gelişim Radarı'ndaki ilgili boyutu (Özerklik, Sınırlar vb.) yükseltir.

### 3.4. Duygu Günlüğü (`/gunluk`)
Çocuğun duygusal dünyasını analiz eden AI modülüdür.
*   **Rehber Sorular**: Haftanın temasına göre değişen sorular (Örn: "Bugün kendi başına ne karar aldın?") kullanıcıyı yazmaya teşvik eder.
*   **AI Analizi**: Yazılan metin Groq API'ya gönderilir. AI, metindeki **"Ben vs. Biz"** dengesini ölçer.
*   **Ebeveyn Gizliliği**: Metnin içeriği ebeveyne gösterilmez; sadece AI tarafından üretilen gelişim raporu ve duygu özeti ebeveyn paneline düşer.

### 3.5. Oyun Alanı (`/oyunlar`)
Platformda 4 farklı oyun kategorisi bulunur:
1.  **Sınır Hattı (Swipe Game)**: Kartları sağa/sola kaydırarak (Tinder mekaniği) sınır koyma pratiği yapılır.
2.  **Aynadaki Fark (Reflex Game)**: Hız bazlı bir oyundur. Ekranda akan kelimelerden sadece "bireysel kimliği" temsil edenlere tıklanır.
3.  **Mutfak Diplomasisi (Chat Game)**: AI ile chat simülasyonudur. Aile üyeleriyle kurulan diyaloglarda doğru iletişim dilini seçme becerisini ölçer.
4.  **Sosyal Labirent (Choice Engine)**: Karmaşık sosyal senaryolarda stratejik kararlar alma.

### 3.6. Ebeveyn Paneli (`/ebeveyn`)
Veriye dayalı ebeveynlik rehberidir.
*   **Gelişim Radarı**: Çocukların 6 farklı boyuttaki gelişimini karşılaştırmalı olarak gösterir.
*   **Ebeveyn Notları**: AI, her iki çocuğun verilerini birleştirerek ebeveyne "özel analiz" ve "somut tavsiye" üretir.
*   **PDF Rapor**: 6 haftalık sürecin çıktısı profesyonel bir rapor formatında indirilebilir.

---

## 4. 6 Haftalık İçerik Müfredatı (Görsel Odaklı)

| Hafta | Tema | Temel Kazanım |
| :--- | :--- | :--- |
| **1** | **Kimlik Gelişimi** | Kendini "biz"den ayırıp "ben" olarak tanımlama. |
| **2** | **Sosyal İlişkiler** | Bireysel arkadaşlıklar ve fiziksel sınırlar kurma. |
| **3** | **Duygusal Bağımsızlık** | Başkasının duygusundan etkilenmeme (Ayrışma). |
| **4** | **Akademik Gelişim** | Kendi öğrenme stilini ve zihnini keşfetme. |
| **5** | **Çatışma Çözümü** | Kardeş tartışmalarını sağlıklı yönetme ve işbirliği. |
| **6** | **Gelecek Planlaması** | Bağımsız bir birey olarak gelecek vizyonu kurma. |

---

## 5. Veri ve Güvenlik Altyapısı
*   **FamilyCode**: Her aile tek bir kod ile birbirine bağlanır.
*   **XP & Seviye**: Her aktivite (günlük, test, oyun) puan kazandırır.
*   **İzole Veri**: Günlük içerikleri uçtan uca gizlidir; sadece AI analiz sonuçları ebeveyne iletilir.
