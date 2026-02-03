# İkiz Gelişim - Backend API

Render üzerinde deploy edilecek Express.js backend.

## Deploy Adımları (Render)

1. Render.com'da yeni "Web Service" oluştur
2. Bu backend klasörünü GitHub'a push et
3. Render'da:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `MONGODB_URI`: MongoDB Atlas connection string
     - `JWT_SECRET`: Güvenli bir secret key
     - `PORT`: 5000 (otomatik ayarlanır)

## API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/login` | Giriş |
| POST | `/api/auth/register` | Kayıt |
| GET | `/api/profile/stats` | Profil istatistikleri |
| POST | `/api/profile/complete-task` | Görev tamamla |
| POST | `/api/journal/analyze` | Günlük analiz et |
| GET | `/api/journal/history` | Günlük geçmişi |
| GET | `/api/journal/insights` | Haftalık içgörüler |
| POST | `/api/test/save` | Test sonucu kaydet |
| GET | `/api/test/history` | Test geçmişi |
| POST | `/api/game/save` | Oyun skoru kaydet |
| POST | `/api/task/complete` | Çarkıfelek görevi |
| POST | `/api/character/save` | Karakter kaydet |

## CORS

Tüm originlere izin verilmiştir.
