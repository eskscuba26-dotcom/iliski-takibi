#!/bin/bash

echo "🚀 APK Build Başlatılıyor..."
echo ""

cd /app/frontend

echo "📱 EAS Build başlatılıyor..."
echo ""

# Build komutu
eas build --platform android --profile preview --non-interactive || {
    echo ""
    echo "❌ Build başlatılamadı."
    echo ""
    echo "Lütfen manuel olarak şu komutları çalıştırın:"
    echo ""
    echo "  cd /app/frontend"
    echo "  eas login"
    echo "  eas build --platform android --profile preview"
    echo ""
    exit 1
}

echo ""
echo "✅ Build başlatıldı!"
echo "📊 Build ilerlemesini şu adresten takip edebilirsiniz: https://expo.dev"
