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
    
    // Calculate total difference
    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hours = now.getHours() - startDate.getHours();
    let minutes = now.getMinutes() - startDate.getMinutes();

    // Adjust for negative values
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    
    if (hours < 0) {
      hours += 24;
      days -= 1;
    }
    
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months -= 1;
    }
    
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    setTimeElapsed({
      years: years < 0 ? 0 : years,
      months: months < 0 ? 0 : months,
      days: days < 0 ? 0 : days,
      hours: hours < 0 ? 0 : hours,
      minutes: minutes < 0 ? 0 : minutes,
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Sevgi Saati</Text>
        <Text style={styles.subtitle}>25 Ocak 2025, 20:30</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Couple Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: 'https://customer-assets.emergentagent.com/job_e4db3706-e757-48e7-9549-6099030dfeac/artifacts/j9t0hd5t_20250920_205107.jpg' }}
            style={styles.couplePhoto}
            resizeMode="cover"
          />
        </View>

        {/* Time Counter - Order: Minute, Hour, Day, Month, Year */}
        <View style={styles.counterContainer}>
          <View style={styles.counterCard}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.minutes}</Text>
              <Text style={styles.timeLabel}>Dakika</Text>
            </View>
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.hours}</Text>
              <Text style={styles.timeLabel}>Saat</Text>
            </View>
            
            <View style={styles.timeBlock}>
              <Text style={styles.timeNumber}>{timeElapsed.days}</Text>
              <Text style={styles.timeLabel}>Gün</Text>
            </View>
            
            {(timeElapsed.years > 0 || timeElapsed.months > 0) && (
              <View style={styles.timeBlock}>
                <Text style={styles.timeNumber}>{timeElapsed.months}</Text>
                <Text style={styles.timeLabel}>Ay</Text>
              </View>
            )}
            
            {timeElapsed.years > 0 && (
              <View style={styles.timeBlock}>
                <Text style={styles.timeNumber}>{timeElapsed.years}</Text>
                <Text style={styles.timeLabel}>Yıl</Text>
              </View>
            )}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#2c3e50',
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#ecf0f1',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  photoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  couplePhoto: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  counterCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 60,
    marginVertical: 8,
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'capitalize',
  },
  photosSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
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
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
});
