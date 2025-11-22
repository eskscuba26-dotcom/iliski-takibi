import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

interface Photo {
  id: string;
  image_base64: string;
  uploaded_at: string;
}

export default function Index() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
  });

  // Start date: 25 Ocak 2025 20:30 (Turkey time)
  const startDate = new Date('2025-01-25T20:30:00+03:00');

  // Calculate time elapsed
  const calculateTimeElapsed = () => {
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Calculate years, months, days more accurately
    let years = 0;
    let months = 0;
    let remainingDays = days;

    // Simple year calculation (365 days)
    years = Math.floor(remainingDays / 365);
    remainingDays = remainingDays % 365;

    // Simple month calculation (30 days average)
    months = Math.floor(remainingDays / 30);
    remainingDays = remainingDays % 30;

    const currentHours = hours % 24;
    const currentMinutes = minutes % 60;

    setTimeElapsed({
      years,
      months,
      days: remainingDays,
      hours: currentHours,
      minutes: currentMinutes,
    });
  };

  // Update timer every minute
  useEffect(() => {
    calculateTimeElapsed();
    const interval = setInterval(() => {
      calculateTimeElapsed();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Request permissions and pick image
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf yüklemek için galeri erişim izni gereklidir.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf çekmek için kamera erişim izni gereklidir.'
        );
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await uploadPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    }
  };

  // Upload photo
  const uploadPhoto = async (base64: string) => {
    setUploading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: `data:image/jpeg;base64,${base64}`,
        }),
      });

      if (response.ok) {
        await fetchPhotos();
        Alert.alert('Başarılı', 'Fotoğraf yüklendi!');
      } else {
        Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const deletePhoto = async (photoId: string) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${EXPO_PUBLIC_BACKEND_URL}/api/photos/${photoId}`,
                { method: 'DELETE' }
              );

              if (response.ok) {
                await fetchPhotos();
                Alert.alert('Başarılı', 'Fotoğraf silindi.');
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Hata', 'Fotoğraf silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  // Show image picker options
  const showImageOptions = () => {
    Alert.alert(
      'Fotoğraf Ekle',
      'Nereden fotoğraf eklemek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeri', onPress: pickImage },
        { text: 'Kamera', onPress: takePhoto },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF1493" />
      </View>
    );
  }

  // Calculate total days
  const totalDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Sevgi Saati</Text>
        <Text style={styles.subtitle}>25 Ocak 2025, 20:30</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Days Display */}
        <View style={styles.totalDaysContainer}>
          <Ionicons name="heart" size={32} color="#FF1493" />
          <Text style={styles.totalDaysNumber}>{totalDays}</Text>
          <Text style={styles.totalDaysLabel}>Gün Birlikte</Text>
        </View>

        {/* Compact Time Counter */}
        <View style={styles.counterContainer}>
          <View style={styles.counterCard}>
            {timeElapsed.years > 0 && (
              <View style={styles.timeBlock}>
                <Text style={styles.timeNumber}>{timeElapsed.years}</Text>
                <Text style={styles.timeLabel}>Yıl</Text>
              </View>
            )}
            
            {(timeElapsed.years > 0 || timeElapsed.months > 0) && (
              <View style={styles.timeBlock}>
                <Text style={styles.timeNumber}>{timeElapsed.months}</Text>
                <Text style={styles.timeLabel}>Ay</Text>
              </View>
            )}
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.days}</Text>
              <Text style={styles.timeLabel}>Gün</Text>
            </View>
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.hours}</Text>
              <Text style={styles.timeLabel}>Saat</Text>
            </View>
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.minutes}</Text>
              <Text style={styles.timeLabel}>Dakika</Text>
            </View>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photosSectionHeader}>
            <Text style={styles.photosTitle}>Anılarımız</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={showImageOptions}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="add" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          {photos.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color="#999" />
              <Text style={styles.emptyText}>Henüz fotoğraf eklenmemiş</Text>
              <Text style={styles.emptySubtext}>
                Anılarınızı eklemek için + butonuna tıklayın
              </Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoCard}
                  onLongPress={() => deletePhoto(photo.id)}
                >
                  <Image
                    source={{ uri: photo.image_base64 }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FF1493',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFE4F0',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  totalDaysContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  totalDaysNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FF1493',
    marginTop: 8,
  },
  totalDaysLabel: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 4,
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  counterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#333',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 55,
    marginVertical: 4,
  },
  timeNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF1493',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'capitalize',
  },
  photosSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoCard: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});
