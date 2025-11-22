# İlişki Takibi - APK Oluşturma Talimatları

## Yöntem 1: Expo Go ile Test (En Kolay - Hızlı Test İçin)

### Adımlar:
1. **Telefonunuza Expo Go uygulamasını indirin**
   - Android: [Google Play Store'dan Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store'dan Expo Go](https://apps.apple.com/app/expo-go/id982107779)

2. **QR Kod ile Bağlanın**
   - Expo Go uygulamasını açın
   - "Scan QR Code" seçeneğine tıklayın
   - Şu URL'i tarayıcınızda açın: `https://first-meet-tracker.preview.emergentagent.com`
   - Ekranda gösterilen QR kodu tarayın

3. **Uygulama telefonunuzda çalışacaktır!**
   - Backend'e internet üzerinden bağlanır
   - Gerçek zamanlı test edebilirsiniz
   - **NOT:** Bu yöntem sadece test içindir, kalıcı yükleme değildir

---

## Yöntem 2: Bağımsız APK Oluşturma (Kalıcı Yükleme)

Uygulamayı telefonunuza kalıcı olarak yüklemek ve Expo Go olmadan çalıştırmak için EAS Build kullanmanız gerekir.

### Ön Hazırlık:
1. **Expo hesabı oluşturun**
   - [https://expo.dev](https://expo.dev) adresine gidin
   - Ücretsiz hesap oluşturun

2. **Backend URL'ini güncell eyin**
   - Uygulamanızın backend'i bir sunucuda çalışıyor olmalı
   - `/app/frontend/.env` dosyasındaki `EXPO_PUBLIC_BACKEND_URL` değerini güncelleyin
   - Örnek: `EXPO_PUBLIC_BACKEND_URL=https://your-backend-api.com`

### APK Build Adımları:

#### Bilgisayarınızdan (Yerel):

```bash
# 1. Frontend dizinine gidin
cd /app/frontend

# 2. EAS CLI'yı yükleyin (ilk kez yapılıyorsa)
npm install -g eas-cli

# 3. Expo hesabınıza giriş yapın
eas login

# 4. Proje yapılandırmasını oluşturun
eas build:configure

# 5. Android APK build başlatın
eas build --platform android --profile preview

# Build süreci yaklaşık 10-20 dakika sürer
# Build tamamlandığında bir link alacaksınız
# Bu linke tıklayarak APK dosyasını indirebilirsiniz
```

#### APK'yı Telefonunuza Yükleme:

1. **APK linkini telefonunuzda açın**
   - Build tamamlandıktan sonra gelen linki telefonunuzun tarayıcısında açın
   
2. **APK'yı indirin**
   - "Download" butonuna tıklayın
   
3. **Bilinmeyen kaynaklardan yüklemeye izin verin**
   - Telefon ayarlarından "Güvenlik" veya "Uygulamalar" bölümüne gidin
   - "Bilinmeyen kaynaklardan yükleme" seçeneğini aktif edin
   
4. **APK'yı yükleyin**
   - İndirilen APK dosyasına tıklayın
   - "Yükle" butonuna basın

---

## Yöntem 3: Google Play Store'a Yükleme (İleri Seviye)

Uygulamanızı Play Store'da yayınlamak için:

```bash
# 1. Production build oluşturun
eas build --platform android --profile production

# 2. Build tamamlandığında AAB (Android App Bundle) dosyası oluşacak

# 3. Google Play Console'da yeni uygulama oluşturun
# - https://play.google.com/console adresine gidin
# - Geliştirici hesabı oluşturun (25$ tek seferlik ücret)
# - Yeni uygulama oluşturun

# 4. AAB dosyasını Play Console'a yükleyin

# 5. Uygulama bilgilerini doldurun ve yayınlayın
```

---

## Önemli Notlar:

### Backend Bağlantısı:
- **Yerel test için:** Backend'inizin internetten erişilebilir olması gerekir
- **Seçenekler:**
  1. Ngrok veya benzer tunnel servisleri kullanın
  2. Backend'i bir cloud servisine deploy edin (Heroku, Railway, DigitalOcean, vb.)
  3. MongoDB Atlas kullanarak veritabanınızı cloud'a taşıyın

### MongoDB:
- Yerel MongoDB yerine [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (ücretsiz tier) kullanmanız önerilir
- Backend `.env` dosyasındaki `MONGO_URL`'i güncelleyin

### Fotoğraf Depolama:
- Uygulamanız fotoğrafları base64 formatında MongoDB'ye kaydediyor
- Çok fazla fotoğraf eklerseniz veritabanı şişebilir
- Alternatif: AWS S3, Cloudinary gibi servisleri kullanabilirsiniz

---

## Hızlı Başlangıç Özeti:

### Sadece Test İçin:
✅ **Expo Go ile test edin** (5 dakika)

### Kalıcı Yükleme İçin:
✅ **EAS Build ile APK oluşturun** (30 dakika)

### Diğer telefonlarda kullanım:
- APK dosyasını paylaşabilirsiniz
- Veya Google Play Store'a yükleyip oradan indirebilirsiniz

---

## Destek ve Yardım:

- **Expo Dokümantasyonu:** https://docs.expo.dev
- **EAS Build Rehberi:** https://docs.expo.dev/build/introduction
- **Sorun mu var?** Backend loglarını kontrol edin: `sudo supervisorctl tail -f backend`

---

## Backend'i Canlıya Alma (Opsiyonel):

Uygulamanızın her yerde çalışması için backend'i bir sunucuya deploy etmeniz gerekir.

### Önerilen Platformlar:
1. **Railway.app** (En kolay, ücretsiz tier var)
2. **Heroku** (Popüler, ama artık ücretli)
3. **DigitalOcean** ($5/ay droplet)
4. **AWS EC2** (İleri seviye)

### Railway.app ile Deploy:
```bash
# 1. Railway hesabı oluşturun: https://railway.app
# 2. GitHub'a proje yükleyin
# 3. Railway'de "New Project" > "Deploy from GitHub"
# 4. Backend klasörünü seçin
# 5. Environment variables ekleyin (MONGO_URL, DB_NAME)
# 6. Deploy edin!
```

Tüm işlemler tamamlandığında:
- ✅ Backend canlıda çalışacak
- ✅ MongoDB Atlas'ta veritabanı
- ✅ APK telefonlarda yüklü
- ✅ Uygulama tamamen bağımsız çalışacak!
