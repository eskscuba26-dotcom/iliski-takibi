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
  const [mainPhoto, setMainPhoto] = useState<string>('');
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

  // Fetch main photo
  const fetchMainPhoto = async () => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/main-photo`);
      if (response.ok) {
        const data = await response.json();
        setMainPhoto(data.main_photo);
      }
    } catch (error) {
      console.error('Error fetching main photo:', error);
    }
  };

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
    fetchMainPhoto();
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

  // Update main photo
  const updateMainPhoto = async (base64: string) => {
    setUploading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/main-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: `data:image/jpeg;base64,${base64}`,
        }),
      });

      if (response.ok) {
        await fetchMainPhoto();
        Alert.alert('Başarılı', 'Ana fotoğraf güncellendi!');
      } else {
        Alert.alert('Hata', 'Fotoğraf güncellenemedi.');
      }
    } catch (error) {
      console.error('Error updating main photo:', error);
      Alert.alert('Hata', 'Fotoğraf güncellenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  // Change main photo
  const changeMainPhoto = async () => {
    Alert.alert(
      'Ana Fotoğrafı Değiştir',
      'Nereden fotoğraf seçmek istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Galeri',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Galeri erişim izni gereklidir.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              await updateMainPhoto(result.assets[0].base64);
            }
          },
        },
        {
          text: 'Kamera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('İzin Gerekli', 'Kamera erişim izni gereklidir.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              await updateMainPhoto(result.assets[0].base64);
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget Style - Photo, Time, Add Button */}
        <View style={styles.widgetContainer}>
          {/* Left - Photo */}
          <TouchableOpacity
            style={styles.widgetPhoto}
            onPress={changeMainPhoto}
            disabled={uploading}
          >
            {mainPhoto ? (
              <Image
                source={{ uri: mainPhoto }}
                style={styles.widgetPhotoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.widgetPhotoPlaceholder}>
                <Ionicons name="camera" size={24} color="#666" />
              </View>
            )}
          </TouchableOpacity>

          {/* Center - Time Display (Vertical) */}
          <View style={styles.widgetTimeContainer}>
            <View style={styles.widgetTimeRow}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.minutes}</Text>
              <Text style={styles.widgetTimeLabel}>Dakika</Text>
            </View>
            <View style={styles.widgetTimeRow}>
              <Text style={styles.widgetTimeNumber}>{timeElapsed.hours}</Text>
              <Text style={styles.widgetTimeLabel}>Saat</Text>
            </View>
            <View style={styles.widgetTimeRow}>
              <Text style={styles.widgetTimeNumber}>
                {timeElapsed.years > 0 ? timeElapsed.years : timeElapsed.months}
              </Text>
              <Text style={styles.widgetTimeLabel}>
                {timeElapsed.years > 0 ? 'Yıl' : 'Ay'}
              </Text>
            </View>
          </View>

          {/* Right - Add Button */}
          <TouchableOpacity
            style={styles.widgetAddButton}
            onPress={showImageOptions}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Ionicons name="add" size={40} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  smallPhotoSection: {
    width: 50,
    height: 50,
    marginRight: 8,
  },
  smallPhoto: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  smallPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  counterContainer: {
    marginTop: 10,
  },
  counterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 60,
    marginVertical: 6,
  },
  timeNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  timeLabel: {
    fontSize: 11,
    color: '#e0e0e0',
    textTransform: 'capitalize',
  },
  startDateText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
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
    color: '#FFF',
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
    color: '#e0e0e0',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
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
