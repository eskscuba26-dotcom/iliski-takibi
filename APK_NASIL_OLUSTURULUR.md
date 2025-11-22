# 📱 İlişki Takibi APK Oluşturma Rehberi

## 🎯 Başka Telefonlarda Kullanılabilir APK Oluşturma

Bu rehber, uygulamanızı başka telefonlarda da çalışacak şekilde APK dosyası olarak nasıl oluşturacağınızı anlatır.

---

## ⚡ HIZLI BAŞLANGIÇ - 3 ADIMDA APK

### Adım 1: Expo Hesabı Oluşturun
```bash
# https://expo.dev adresine gidin
# Ücretsiz hesap oluşturun (Gmail ile giriş yapabilirsiniz)
```

### Adım 2: EAS CLI Kurun ve Giriş Yapın
```bash
npm install -g eas-cli
eas login
# Expo hesabınızla giriş yapın
```

### Adım 3: APK Build Başlatın
```bash
cd /app/frontend
eas build --platform android --profile preview
```

**Build süresi:** 10-20 dakika
**Sonuç:** APK indirme linki alacaksınız!

---

## 📋 DETAYLI ADIM ADIM REHBERİ

### 1️⃣ Ön Hazırlık (Tek Seferlik)

#### A) Backend'i Canlıya Alın
Uygulamanız başka telefonlarda çalışması için backend'in internetten erişilebilir olması gerekir.

**Önerilen Platform: Railway.app (EN KOLAY)**

```bash
# 1. Railway.app hesabı oluşturun
# https://railway.app - GitHub ile giriş yapın

# 2. Yeni proje oluşturun
# - "New Project" tıklayın
# - "Deploy from GitHub repo" seçin
# - Backend klasörünü seçin

# 3. Environment Variables ekleyin:
MONGO_URL=mongodb+srv://...  # MongoDB Atlas URL'iniz
DB_NAME=relationship_tracker

# 4. Deploy butonuna tıklayın
# Backend URL'iniz hazır: https://your-app.railway.app
```

#### B) MongoDB Atlas Kurulumu (Ücretsiz)
```bash
# 1. https://www.mongodb.com/cloud/atlas adresine gidin
# 2. Ücretsiz hesap oluşturun
# 3. M0 (Ücretsiz) cluster oluşturun
# 4. Database User oluşturun
# 5. IP Whitelist: 0.0.0.0/0 (Herkese açık)
# 6. Connection string alın:
#    mongodb+srv://username:password@cluster.mongodb.net/
```

#### C) Frontend .env Dosyasını Güncelleyin
```bash
# /app/frontend/.env dosyasını açın
EXPO_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# Railway'deki backend URL'inizi buraya yazın
```

---

### 2️⃣ EAS Build ile APK Oluşturma

#### A) EAS CLI Kurulumu
```bash
# Global olarak EAS CLI'yı kurun
npm install -g eas-cli

# Veya yarn ile:
yarn global add eas-cli
```

#### B) Expo Hesabına Giriş
```bash
eas login

# Email: expo_hesabiniz@gmail.com
# Password: ******
```

#### C) Proje Yapılandırması
```bash
cd /app/frontend

# EAS Build yapılandırmasını oluşturun
eas build:configure

# Bu komut eas.json dosyası oluşturacak (zaten var)
```

#### D) APK Build Başlatın
```bash
# Preview APK oluşturun (test için)
eas build --platform android --profile preview

# Sorular:
# "What would you like your Android application id to be?"
# → com.iliskitakibi.app (varsayılan, Enter'a basın)

# "Generate a new Android Keystore?"
# → Yes (Enter)

# Build başladı! 🎉
# Build ID ve link verilecek
```

#### E) Build İlerlemesini Takip Edin
```bash
# Terminal'de build loglarını görebilirsiniz
# Veya expo.dev sitesinden takip edebilirsiniz

# Build süresi: 10-20 dakika
# Sabırlı olun ☕
```

#### F) APK'yı İndirin
```bash
# Build tamamlandığında bir link alacaksınız:
# https://expo.dev/artifacts/eas/...apk

# Bu linki tarayıcıda açın ve APK'yı indirin
```

---

### 3️⃣ APK'yı Telefona Yükleme

#### Yöntem 1: Direkt İndirme (En Kolay)
1. APK linkini telefonunuzun tarayıcısında açın
2. APK dosyasını indirin
3. İndirmeler klasöründen APK'ya tıklayın
4. "Bilinmeyen kaynaklardan yüklemeye izin ver" uyarısı çıkarsa, ayarlara gidin ve izin verin
5. "Yükle" butonuna basın
6. Uygulama yüklendi! 🎉

#### Yöntem 2: USB ile Transfer
1. APK'yı bilgisayara indirin
2. Telefonu USB ile bağlayın
3. APK'yı telefonun İndirilenler klasörüne kopyalayın
4. Telefonda Dosya Yöneticisi açın
5. APK'ya tıklayın ve yükleyin

#### Yöntem 3: Google Drive / WhatsApp
1. APK'yı Google Drive'a yükleyin
2. Telefondan Google Drive'dan indirin
3. İndirilen APK'yı yükleyin

---

## 🔥 ÖNEMLİ NOTLAR

### ✅ Backend Zorunlu
- APK çalışması için backend mutlaka canlıda olmalı
- Railway.app ücretsiz tier: 500 saat/ay (yeterli)
- Backend olmadan APK çalışmaz!

### ✅ MongoDB Atlas
- Ücretsiz tier: 512MB storage (yeterli)
- Fotoğraflar base64 olarak saklanıyor
- Çok fazla fotoğraf eklerseniz limit dolabilir

### ✅ APK Paylaşma
- Oluşturduğunuz APK'yı istediğiniz kişiyle paylaşabilirsiniz
- Herkes bu APK'yı yükleyip kullanabilir
- Hepsi aynı backend'e bağlanır

### ✅ Güncelleme
- Yeni özellik eklerseniz, yeni APK build'i yapın
- Eski APK'yı silin, yenisini yükleyin

---

## 🎯 PRODUCTION APK (Play Store İçin)

Uygulamanızı Google Play Store'da yayınlamak isterseniz:

```bash
# 1. Production build oluşturun
eas build --platform android --profile production

# 2. AAB dosyası oluşacak (APK değil)
# 3. Google Play Console'a gidin: https://play.google.com/console
# 4. Geliştirici hesabı oluşturun ($25 tek seferlik)
# 5. Yeni uygulama oluşturun
# 6. AAB dosyasını yükleyin
# 7. Store listing bilgilerini doldurun
# 8. İncelemeye gönderin
# 9. Onaylandıktan sonra yayınlanır (1-3 gün)
```

---

## 🚨 SORUN GİDERME

### Build Hatası: "No Android project found"
```bash
# Çözüm: eas.json ve app.json dosyalarını kontrol edin
# app.json'da android.package olmalı
```

### APK Yüklenmiyor
```bash
# Ayarlar > Güvenlik > Bilinmeyen Kaynaklar > Aç
# Veya
# Ayarlar > Uygulamalar > Özel erişim > Bilinmeyen uygulamaları yükle
```

### Uygulama Açılmıyor / Çöküyor
```bash
# Backend URL'ini kontrol edin (.env dosyası)
# Backend'in çalıştığından emin olun
# MongoDB Atlas bağlantısını test edin
```

### Notification Çalışmıyor
```bash
# Telefonun bildirim izinlerini kontrol edin
# Ayarlar > Uygulamalar > İlişki Takibi > İzinler > Bildirimler
```

---

## 📊 ÖZELLEŞT İRME

### Uygulama Adını Değiştirme
```json
// app.json dosyasında:
{
  "expo": {
    "name": "Sizin Adınız",  // ← Buraya yazın
    "slug": "sizin-adiniz"
  }
}
```

### İkon Değiştirme
```bash
# 1. 1024x1024 PNG icon hazırlayın
# 2. /app/frontend/assets/images/icon.png dosyasını değiştirin
# 3. Yeni build oluşturun
```

### Bildirim Sesini Değiştirme
```json
// app.json dosyasında:
{
  "expo": {
    "notification": {
      "sound": "./assets/sounds/notification.wav"
    }
  }
}
```

---

## 💡 İPUÇLARI

### 1. Backend URL'i Test Edin
```bash
# Terminal'de test edin:
curl https://your-backend.railway.app/api/

# Sonuç: {"message":"Relationship Tracker API"}
```

### 2. Build Önbelleği Temizleme
```bash
# Eğer build hata verirse:
eas build:clear-cache
```

### 3. Build Loglarını İnceleme
```bash
# Build hatası alırsanız, loglara bakın:
# expo.dev sitesinde build sayfasını açın
# "Logs" sekmesine tıklayın
```

### 4. Hızlı Test için Development Build
```bash
# Geliştirme sırasında hızlı test için:
eas build --platform android --profile development

# Bu build ile kod değişikliklerini hızlı test edebilirsiniz
# Production için mutlaka "preview" veya "production" kullanın
```

---

## ✨ SON KONTROL LİSTESİ

Uygulamanızı yayınlamadan önce kontrol edin:

- [ ] Backend canlıda ve çalışıyor
- [ ] MongoDB Atlas bağlantısı çalışıyor
- [ ] Frontend .env dosyasında doğru backend URL var
- [ ] app.json dosyası doğru yapılandırılmış
- [ ] EAS build tamamlandı ve APK indirildi
- [ ] APK telefonda test edildi
- [ ] Resim değiştirme çalışıyor
- [ ] Anı ekleme çalışıyor
- [ ] Sayaç düzgün çalışıyor (her saniye güncelleniyor)
- [ ] Saatlik bildirimler geliyor ❤️

---

## 🎉 BAŞARILI!

APK'nız hazır! Artık uygulamanızı istediğiniz kadar telefonda kullanabilirsiniz.

**APK'yı paylaşmak için:**
- Google Drive'a yükleyin
- WhatsApp ile gönderin
- Email ile paylaşın
- USB ile aktarın

**Destek İçin:**
- Expo Forum: https://forums.expo.dev
- Railway Support: https://help.railway.app
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

---

İyi Kullanımlar! ❤️
