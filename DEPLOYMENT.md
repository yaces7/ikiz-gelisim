# 🚀 İkiz Gelişim Platformu - Deployment Rehberi

Bu rehber, projenizi **Backend (Render)** ve **Frontend (Vercel)** olarak ayrı ayrı deploy etmenizi adım adım anlatır.

---

## 📋 Gereksinimler

1. **GitHub hesabı** (projenizi GitHub'a push etmiş olmalısınız)
2. **MongoDB Atlas hesabı** (ücretsiz tier yeterli)
3. **Render.com hesabı** (ücretsiz)
4. **Vercel hesabı** (ücretsiz)

---

## 🗄️ ADIM 1: MongoDB Atlas Kurulumu

### 1.1 Cluster Oluşturma
1. [MongoDB Atlas](https://cloud.mongodb.com)'a gidin
2. Yeni bir hesap oluşturun veya giriş yapın
3. **"Build a Cluster"** → **FREE tier (M0)** seçin
4. Bölge olarak **Frankfurt (eu-central-1)** seçin
5. Cluster adı: `ikiz-gelisim-cluster`

### 1.2 Database User Oluşturma
1. Sol menüden **Database Access** → **Add New Database User**
2. Authentication Method: **Password**
3. Username: `ikiz_admin`
4. Password: Güçlü bir şifre oluşturun (örn: `IkizGelisim2024!`)
5. Database User Privileges: **Read and write to any database**
6. **Add User**

### 1.3 Network Access (IP Whitelist)
1. Sol menüden **Network Access** → **Add IP Address**
2. **Allow Access from Anywhere** (0.0.0.0/0) seçin
3. **Confirm**

### 1.4 Connection String Alma
1. Sol menüden **Database** → Cluster'ınızda **Connect** butonuna tıklayın
2. **Connect your application** seçin
3. Driver: **Node.js**, Version: **5.5 or later**
4. Connection string'i kopyalayın:
```
mongodb+srv://ikiz_admin:<password>@ikiz-gelisim-cluster.xxxxx.mongodb.net/ikiz-gelisim?retryWrites=true&w=majority
```
5. `<password>` yerine oluşturduğunuz şifreyi yazın

---

## 🖥️ ADIM 2: Backend Deploy (Render)

### 2.1 GitHub'a Push
Önce projenizi GitHub'a push edin:
```bash
cd /home/cesur/development/ikiz-gelisim
git add .
git commit -m "Backend/Frontend separation for deployment"
git push origin main
```

### 2.2 Render'da Web Service Oluşturma

1. [Render.com](https://render.com)'a gidin ve giriş yapın
2. Dashboard'da **New** → **Web Service** tıklayın
3. **Connect a repository** → GitHub hesabınızı bağlayın
4. `ikiz-gelisim` repository'sini seçin

### 2.3 Service Ayarları

| Ayar | Değer |
|------|-------|
| **Name** | `ikiz-gelisim-api` |
| **Region** | Frankfurt (EU Central) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 2.4 Environment Variables (Çok Önemli!)

**Add Environment Variable** butonuna tıklayarak şunları ekleyin:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://ikiz_admin:SIFRENIZ@ikiz-gelisim-cluster.xxxxx.mongodb.net/ikiz-gelisim?retryWrites=true&w=majority` |
| `JWT_SECRET` | `ikiz-gelisim-super-secret-key-2024-tubitak` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

### 2.5 Deploy

1. **Create Web Service** butonuna tıklayın
2. Deploy işlemi başlayacak (3-5 dakika sürebilir)
3. Deploy tamamlandığında size bir URL verilecek:
   ```
   https://ikiz-gelisim-api.onrender.com
   ```
4. Bu URL'i not alın! Frontend için gerekecek.

### 2.6 Test Etme

Tarayıcıda şu URL'i açın:
```
https://ikiz-gelisim-api.onrender.com/api/health
```

Şunu görmelisiniz:
```json
{"status":"OK","timestamp":"2026-02-03T..."}
```

---

## 🌐 ADIM 3: Frontend Deploy (Vercel)

### 3.1 Vercel'e Giriş

1. [Vercel.com](https://vercel.com)'a gidin
2. **Continue with GitHub** ile giriş yapın

### 3.2 Proje Import Etme

1. Dashboard'da **Add New...** → **Project** tıklayın
2. GitHub repository listesinden `ikiz-gelisim` seçin
3. **Import** tıklayın

### 3.3 Proje Ayarları

| Ayar | Değer |
|------|-------|
| **Project Name** | `ikiz-gelisim` |
| **Framework Preset** | Next.js (otomatik algılanır) |
| **Root Directory** | `.` (boş bırakın, ana klasör) |
| **Build Command** | `npm run build` (varsayılan) |
| **Output Directory** | `.next` (varsayılan) |
| **Install Command** | `npm install` (varsayılan) |

### 3.4 Environment Variables (Çok Önemli!)

**Environment Variables** bölümünde şunu ekleyin:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://ikiz-gelisim-api.onrender.com` |

⚠️ **ÖNEMLİ:** URL'in sonunda `/` olmamalı!

### 3.5 Deploy

1. **Deploy** butonuna tıklayın
2. Build işlemi başlayacak (2-4 dakika)
3. Tamamlandığında production URL'iniz verilecek:
   ```
   https://ikiz-gelisim.vercel.app
   ```

---

## ✅ ADIM 4: Test ve Doğrulama

### 4.1 Frontend Test
1. `https://ikiz-gelisim.vercel.app` adresine gidin
2. Ana sayfa yüklenmeli

### 4.2 Kayıt Testi
1. `/kayit` sayfasına gidin
2. Yeni bir hesap oluşturun
3. Başarılı olmalı

### 4.3 Giriş Testi
1. `/giris` sayfasına gidin
2. Oluşturduğunuz hesapla giriş yapın
3. Dashboard'a yönlendirilmeli

### 4.4 Günlük Testi
1. `/gunluk` sayfasına gidin
2. Bir duygu seçin, yazı yazın
3. "Analiz Et" butonuna tıklayın
4. Analiz sonucu gösterilmeli

---

## 🔧 Sorun Giderme

### CORS Hatası
Backend zaten tüm originlere izin veriyor. Hala hata alıyorsanız:
1. Render'da backend'i restart edin
2. Vercel'de frontend'i redeploy edin

### MongoDB Bağlantı Hatası
1. MongoDB Atlas'ta IP Whitelist'i kontrol edin (0.0.0.0/0 olmalı)
2. Connection string'deki şifreyi kontrol edin
3. Cluster'ın aktif olduğundan emin olun

### 500 Hatası
1. Render logs'larını kontrol edin (Dashboard → Logs)
2. Environment variables'ları kontrol edin

### Render Free Tier Uyku Modu
Free tier'da 15 dakika inaktivite sonrası servis uyur. İlk istek 30-50 saniye sürebilir. Bu normaldir.

---

## 📊 Özet URL'ler

| Servis | URL |
|--------|-----|
| **Frontend (Vercel)** | `https://ikiz-gelisim.vercel.app` |
| **Backend (Render)** | `https://ikiz-gelisim-api.onrender.com` |
| **API Health Check** | `https://ikiz-gelisim-api.onrender.com/api/health` |
| **MongoDB Atlas** | `cloud.mongodb.com` |

---

## 🔄 Güncelleme Nasıl Yapılır?

### Kod Güncellemesi
```bash
git add .
git commit -m "Güncelleme açıklaması"
git push origin main
```

- **Vercel**: Otomatik olarak yeni build başlatır
- **Render**: Otomatik olarak yeni deploy başlatır

### Environment Variable Güncellemesi
1. Render/Vercel dashboard'a gidin
2. Settings → Environment Variables
3. Değeri güncelleyin
4. Redeploy yapın

---

## 🎉 Tebrikler!

Projeniz artık canlı! 

- Frontend: Vercel'de (hızlı, global CDN)
- Backend: Render'da (Node.js, Express)
- Database: MongoDB Atlas (bulut)

Her şey ayrı ayrı ölçeklenebilir ve yönetilebilir durumda.
