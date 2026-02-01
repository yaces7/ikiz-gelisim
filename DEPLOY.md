# Dağıtım Rehberi (Vercel + Render + MongoDB)

Bu rehber, "İkiz Gelişim Platformu"nu canlı (production) ortamda nasıl yayınlayacağınızı adım adım anlatır.

## Mimari Genel Bakış
- **Frontend (Arayüz)**: Next.js App Router (**Vercel** veya **Render** üzerinde barındırılır).
- **Backend (API & Socket.IO)**: Özel Node.js Sunucusu (**Render** üzerinde barındırılır).
- **Veritabanı**: MongoDB (**MongoDB Atlas** üzerinde barındırılır).

---

## Ön Hazırlık: Veritabanı Kurulumu (MongoDB Atlas)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) adresine gidin ve ücretsiz bir hesap oluşturun.
2. Yeni bir **Cluster** oluşturun (Shared/Free Tier yeterlidir).
3. **Database Access** menüsünde, bir veritabanı kullanıcısı (örn: `admin`) oluşturun ve şifreyi kaydedin.
4. **Network Access** menüsünde, her yerden erişime izin verin (`0.0.0.0/0`) veya daha sonra Render IP'sini beyaz listeye ekleyin.
5. **Database** > **Connect** > **Drivers** yolunu izleyin ve **Connection String**'i kopyalayın.
   - Şuna benzer bir şeydir: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - `<password>` kısmını kendi şifrenizle değiştirmeyi unutmayın.

---

## Seçenek 1: Render Üzerinde Tam Kurulum (Socket.IO Desteği İçin Önerilir)
Bu uygulama Socket.IO ve Python analizi için özel bir `server.js` kullandığından, tüm uygulamayı Render üzerinde bir **Web Service** olarak dağıtmak en kolay yoldur.

1. **Kodlarınızı GitHub/GitLab'a yükleyin**.
2. [Render.com](https://render.com) üzerinde yeni bir hesap oluşturun.
3. **New +** butonuna tıklayın ve **Web Service**'i seçin.
4. GitHub repozitorinizi bağlayın.
5. **Servis Konfigürasyonu**:
   - **Name**: `ikiz-gelisim-platform`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (Bu komut `server.js` dosyasını çalıştırır)
6. **Çevresel Değişkenler (Environment Variables)**:
   "Advanced" > "Environment Variables" altına şunları ekleyin:
   - `MONGODB_URI`: (1. adımdaki MongoDB Bağlantı Linkini yapıştırın)
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_ENCRYPTION_KEY`: (Rastgele güvenli bir metin girin)
   - `SECRET_KEY`: (JWT için rastgele güvenli bir metin girin)
7. **Create Web Service** butonuna tıklayın.

Render, Next.js uygulamanızı derleyecek ve özel sunucuyu başlatacaktır. Uygulamanız `https://uygulama-adiniz.onrender.com` adresinde yayına girecektir.

---

## Seçenek 2: Ayrık Dağıtım (Vercel + Render)
Frontend hızı için Vercel'i tercih ederseniz (Daha karmaşıktır):

1. **Frontend'i Vercel'e Dağıtın**:
   - Reponuzu Vercel'e import edin.
   - Çevresel Değişkenleri ayarlayın (`MONGODB_URI`, vb.).
   - **Önemli**: Vercel "Serverless" çalıştığı için `server.js` dosyasındaki Socket.IO mantığı Vercel'de doğrudan çalışmaz. Bu yüzden Seçenek 1 (Render) önerilir.

---

## Doğrulama
1. Yayınlanan URL'yi açın.
2. Yeni bir kullanıcı kaydedin (`/kayit`).
3. Başarılı olursa, MongoDB bağlantınız çalışıyor demektir.
4. Varlıkların (resimler vb.) yüklendiğinden emin olmak için Parçacık Arka Planını ve Grafikleri kontrol edin.

## Sorun Giderme
- **Build Fails (Derleme Hatası)**: `npm run build` komutunun kendi bilgisayarınızda (local) hatasız çalıştığından emin olun.
- **Database Error**: MongoDB IP Whitelist ayarının `0.0.0.0/0` olduğundan emin olun.
- **Socket.IO Sorunları**: Vercel kullanıyorsanız WebSocket'ler sunucusuz fonksiyonlarda (serverless functions) düzgün çalışmayabilir. Render (Seçenek 1) kullanın.
