# 📱 APK OLUŞTURMA - ADIM ADIM GÖRSEL REHBERİ

## 🎯 AMAÇ: Telefonunuzda gerçek uygulama olarak görünmesi

---

## 📋 GEREKLİ BİLGİLER

✅ Expo Email: **eskscuba26@gmail.com**  
✅ Expo Şifre: **658120DOa.**

---

## 🖥️ YÖNTEM 1: BİLGİSAYARDAN (Windows/Mac/Linux)

### ADIM 1: Terminal/Komut İstemi Açın

**Windows için:**
1. ⊞ Win tuşuna basın
2. "cmd" yazın
3. Enter'a basın
4. ✅ Siyah pencere açılacak

**Mac için:**
1. ⌘ + Space tuşuna basın
2. "terminal" yazın
3. Enter'a basın
4. ✅ Terminal açılacak

**Linux için:**
1. Ctrl + Alt + T tuşlarına basın
2. ✅ Terminal açılacak

---

### ADIM 2: Klasöre Gidin

Terminal/CMD'de şu komutu yazın:

```bash
cd /app/frontend
```

**Enter'a basın.**

✅ Şimdi doğru klasördesiniz.

---

### ADIM 3: Login Yapın

Şu komutu yazın:

```bash
eas login
```

**Enter'a basın.**

📧 **Email soracak:**
```
Email or username:
```
Yazın: **eskscuba26@gmail.com**  
Enter'a basın.

🔒 **Şifre soracak:**
```
Password:
```
Yazın: **658120DOa.**  
(Şifre yazarken görünmez - bu normal!)  
Enter'a basın.

✅ **Başarılı mesajı görünecek:**
```
✔ Logged in
```

---

### ADIM 4: APK Build Başlatın

Şu komutu yazın:

```bash
eas build --platform android --profile preview
```

**Enter'a basın.**

🤖 **Sorular gelecek:**

**SORU 1:**
```
What would you like your Android application id to be?
```
**CEVAP:** Sadece **Enter**'a basın (varsayılanı kullanır)

**SORU 2:**
```
Generate a new Android Keystore?
```
**CEVAP:** **Y** yazıp **Enter**'a basın

**SORU 3:**
```
Would you like to automatically create an EAS project for @eskscuba26/...?
```
**CEVAP:** **Y** yazıp **Enter**'a basın

---

### ADIM 5: Build Başladı! 🎉

Terminal'de şöyle bir şey göreceksiniz:

```
✔ Build started
Build ID: abc123...
URL: https://expo.dev/accounts/eskscuba26/projects/iliski-takibi/builds/...

You can monitor the build at:
https://expo.dev/...
```

✅ **Build başladı!**  
⏰ **Süre:** 15-20 dakika

---

### ADIM 6: Build İlerlemesini İzleyin

Terminal'deki **URL'yi** kopyalayın ve tarayıcıda açın.

Veya direkte: **https://expo.dev** adresine gidin
1. Login yapın (eskscuba26@gmail.com)
2. "Builds" sekmesine tıklayın
3. İlerlemeyi göreceksiniz

**Build durumları:**
- 🟡 **Queued** - Sırada bekliyor
- 🔵 **In Progress** - Build yapılıyor
- 🟢 **Finished** - Tamamlandı! ✅
- 🔴 **Failed** - Hata var (bana bildirin)

---

### ADIM 7: APK'yı İndirin

Build tamamlandığında:

**Terminal'de** şöyle bir mesaj göreceksiniz:
```
✔ Build finished

Download URL: https://expo.dev/artifacts/eas/...apk
```

**VEYA**

**expo.dev sitesinde:**
1. Build sayfasına gidin
2. "Download" butonuna tıklayın

✅ **APK dosyası indirilecek!**

---

### ADIM 8: APK'yı Telefona Atın

**Yöntem A - WhatsApp (EN KOLAY):**
1. WhatsApp Web açın (web.whatsapp.com)
2. Kendi numaranızla konuşma açın
3. APK dosyasını gönderin
4. Telefonunuzda WhatsApp'tan APK'yı indirin

**Yöntem B - Google Drive:**
1. APK'yı Google Drive'a yükleyin
2. Telefonunuzdan Drive'da APK'yı bulun
3. İndirin

**Yöntem C - USB Kablo:**
1. Telefonu bilgisayara bağlayın
2. APK'yı telefona kopyalayın

---

### ADIM 9: APK'yı Telefona Yükleyin

Telefonunuzda:

1. APK dosyasını bulun (İndirilenler klasörü)
2. APK'ya tıklayın
3. ⚠️ **"Bilinmeyen Kaynaklardan Yükleme" uyarısı gelirse:**
   - "Ayarlar"a tıklayın
   - İzni açın
   - Geri dönün
4. **"Yükle"** butonuna basın
5. Yükleme başlayacak...
6. ✅ **"Uygulama Yüklendi"** mesajı gelecek
7. **"Aç"** butonuna basın veya Ana ekranda ikonu bulun

---

## 🎉 TAMAMLANDI!

✅ Artık telefonunuzun ana ekranında **"İlişki Takibi"** uygulaması var!  
✅ **İnternet tarayıcısı değil**, gerçek mobil uygulama!  
✅ Diğer uygulamalar gibi çalışıyor!  

---

## 🖥️ YÖNTEM 2: EXPO WEB DASHBOARD'DAN (Daha Kolay!)

Eğer terminal kullanmak istemiyorsanız:

### ADIM 1: Expo Dev Console Açın
1. Tarayıcıda **https://expo.dev** adresine gidin
2. **Login** yapın
   - Email: eskscuba26@gmail.com
   - Şifre: 658120DOa.

### ADIM 2: Proje Seçin
1. **"Projects"** sekmesine tıklayın
2. **"iliski-takibi"** projesini bulun ve tıklayın

### ADIM 3: Build Oluştur
1. Sol menüden **"Builds"** sekmesine tıklayın
2. Sağ üstte **"Create a build"** butonuna tıklayın
3. **Platform:** Android seçin
4. **Profile:** "preview" seçin
5. **"Create build"** butonuna tıklayın

### ADIM 4: Build Yapılandırması
İlk defa build yapıyorsanız:
1. **"Generate new keystore"** seçin
2. **"Create build"** butonuna tıklayın

### ADIM 5: Build Takibi
Build sayfasında:
- İlerleme çubuğunu görebilirsiniz
- Logları okuyabilirsiniz
- Tamamlanınca **"Download"** butonu çıkacak

### ADIM 6: APK İndir ve Yükle
1. **"Download"** butonuna tıklayın
2. APK dosyasını bilgisayara indirin
3. Telefona aktarın (WhatsApp/Drive/USB)
4. Telefonda yükleyin

---

## 🚨 SORUN GİDERME

### Sorun 1: "eas: command not found"
**Çözüm:**
```bash
npm install -g eas-cli
```

### Sorun 2: "Login failed"
**Çözüm:**
- Email'i tekrar kontrol edin: eskscuba26@gmail.com
- Şifreyi tekrar kontrol edin: 658120DOa.
- İnternet bağlantınızı kontrol edin

### Sorun 3: "Build failed"
**Çözüm:**
- Bana terminal/expo.dev'deki hata mesajını gönderin
- Birlikte çözeriz

### Sorun 4: "APK yüklenmiyor"
**Çözüm:**
- Ayarlar > Güvenlik > Bilinmeyen Kaynaklar > Aç
- Veya
- Ayarlar > Uygulamalar > Özel Erişim > Bilinmeyen Uygulamaları Yükle > Chrome > İzin ver

### Sorun 5: "Uygulama açılmıyor"
**Çözüm:**
- Backend'in çalıştığından emin olun
- İnternet bağlantınızı kontrol edin
- Uygulamayı sil ve tekrar yükle

---

## 💡 KISA YOLLAR

### En Hızlı Yöntem:
1. Terminal aç
2. `cd /app/frontend`
3. `eas login` (Email: eskscuba26@gmail.com, Şifre: 658120DOa.)
4. `eas build --platform android --profile preview`
5. 20 dakika bekle
6. APK indir
7. Telefona yükle
8. ✅ TAMAM!

### Terminal İstemiyorsanız:
1. expo.dev adresine git
2. Login yap
3. "Builds" > "Create build"
4. Android > preview
5. 20 dakika bekle
6. Download
7. Telefona yükle
8. ✅ TAMAM!

---

## 📞 YARDIM GEREKİRSE

Takıldığınız yerde:
1. Ekran görüntüsü alın
2. Hata mesajını kopyalayın
3. Bana gönderin
4. Hemen yardımcı olurum!

---

## 🎊 SONUÇ

**Build tamamlandıktan sonra:**
- ✅ Telefonunuzda gerçek uygulama
- ✅ Ana ekranda ikon
- ✅ "İlişki Takibi" adıyla
- ✅ Diğer uygulamalar gibi
- ✅ İnternet tarayıcısı değil!

**Not:** Backend'i canlıya almayı unutmayın (Railway.app), yoksa APK çalışmaz!

---

İyi Şanslar! 🚀❤️
